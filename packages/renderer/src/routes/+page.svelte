<script lang="ts">
    // If you want to ship your own default story (or the only story), you can start by modifying
    // the constant below and `storyArchive` variable, go to `${workspaceFolder}/src/lib/assets/data`
    // and add your story & assets there.
    const ALLOW_IMPORTING_NEW_STORY = true

    import inkyStoryPlaceholder from "$lib/assets/data/story-placeholder.json?raw"
    import inkyDefaultStory from "$lib/assets/data/story.zip?url"
    import InkDisplay from "$lib/components/InkDisplay.svelte"
    import PlatformSpecificCloseAndMinimizeButton from "$lib/components/PlatformSpecificCloseAndMinimizeButton.svelte"
    import { defaultStoryBackground } from "$lib/constants"
    import { alert_cx } from "$lib/utils/alert_cx"
    import {
        getStoryArchiveFromZip_Fetch,
        getStoryArchiveFromZip_File,
        getStoryArchiveFromZip_Tauri,
        type StoryArchive
    } from "$lib/utils/createStoryArchive"
    import { downloadTextFile } from "$lib/utils/downloadTextFile"
    import { getDefaultTrafficLightPosition } from "$lib/utils/getDefaultTrafficLightPosition"
    import { getTextFromFile_Tauri } from "$lib/utils/getTextFromFile_Tauri"
    import type { CSSColor, ImageBackground } from "$lib/utils/isImageBackground"
    import { isCSSColor, isImageBackground } from "$lib/utils/isImageBackground"
    import { isTauri } from "@tauri-apps/api/core"
    import { platform } from "@tauri-apps/plugin-os"
    import { fade } from "svelte/transition"

    let storyArchive = $state.raw<StoryArchive>({
        storyContent: inkyStoryPlaceholder,
        images: {},
        audio: {}
    })

    getStoryArchiveFromZip_Fetch(inkyDefaultStory).then((value) => (storyArchive = value))

    let inkDisplay = $state<InkDisplay>()

    let background: CSSColor | ImageBackground = $state(defaultStoryBackground)

    let pageRef = $state<HTMLDivElement>()

    let autoMode = $state(false)

    const uniqueId = $props.id()

    function shakePage() {
        if (!pageRef) return
        pageRef.animate(
            [
                {
                    transform: "translate(0, 0)"
                },
                {
                    transform: "translate(30px, 0)"
                },
                {
                    transform: "translate(-30px, 0)"
                },
                {
                    transform: "translate(0, 0)"
                }
            ],
            {
                duration: 175,
                iterations: 1
            }
        )
    }
</script>

<svelte:head>
    <title>Floria</title>
</svelte:head>

<div
    bind:this={pageRef}
    class="{isTauri() &&
        (platform() === 'linux' || platform() === 'macos') &&
        'overflow-hidden rounded-lg border-1 border-[#00000044]'} h-full w-full bg-white"
>
    <div class="pattern2-background relative h-full w-full" data-tauri-drag-region>
        <div
            class="pattern-background pointer-events-none relative h-full w-[calc(63%-2*0.75rem)] bg-white transition-colors duration-500"
            style:background-color={isCSSColor(background) ? background : "white"}
        >
            {#if isImageBackground(background)}
                {@const imageName = background.substring(4).trim()}
                {@const imageObj = storyArchive.images[imageName]}
                <img
                    transition:fade={{ duration: 500 }}
                    class="pointer-events-none absolute h-full w-full object-cover"
                    src={imageObj.prefix + imageObj.data}
                    alt={imageName}
                />
            {/if}
        </div>
        <div
            class="absolute right-3 {getDefaultTrafficLightPosition() === 'right'
                ? 'top-12 h-[calc(100%-5rem)]'
                : 'top-3 h-[calc(100%-2.75rem)]'} w-[37%] rounded-sm bg-[#ffffffcf] p-4 shadow-2xl backdrop-blur-lg"
        >
            {#key storyArchive}
                <InkDisplay bind:this={inkDisplay} {storyArchive} {autoMode} bind:background onshake={shakePage} />
            {/key}
        </div>
        <div class="absolute bottom-0 h-5 w-full bg-[#000000cf] px-2 text-[0.8rem] text-[#ffffffef]">
            <div class="relative h-full w-full">
                <button class="mx-2 {autoMode ? 'text-blue-400' : ''}" onclick={() => (autoMode = !autoMode)}>
                    [Auto]
                </button>
                <button
                    class="mx-2"
                    onclick={() => {
                        const saves = inkDisplay?.story.saveToStateJson()
                        if (saves) {
                            downloadTextFile("Saved-State.json", saves)
                        }
                    }}
                >
                    [Save]
                </button>
                <button
                    class="mx-2"
                    onclick={() => {
                        if (isTauri()) {
                            getTextFromFile_Tauri("Saved-State", ["json"]).then((value) => {
                                if (!value) return
                                try {
                                    inkDisplay?.recoverFromStateJsonAndRefreshHistory(value)
                                } catch (e) {
                                    alert_cx(
                                        "Cannot load this save file, please check the content." +
                                            (e instanceof Error ? "\n" + e.message : "")
                                    )
                                }
                            })
                        } else {
                            document.getElementById(`${uniqueId}-load-saves-file-selector`)?.click()
                        }
                    }}
                >
                    [Load]
                </button>
                <button
                    class="mx-2"
                    onclick={() => {
                        inkDisplay?.clearHistory()
                    }}
                >
                    [Clear History]
                </button>
                <button
                    class="mx-2"
                    onclick={() => {
                        storyArchive = { ...storyArchive }
                    }}
                >
                    [Restart Story]
                </button>
                {#if ALLOW_IMPORTING_NEW_STORY}
                    <button
                        class="absolute right-0 mx-2"
                        onclick={() => {
                            if (isTauri()) {
                                getStoryArchiveFromZip_Tauri().then((value) => value && (storyArchive = value))
                            } else {
                                document.getElementById(`${uniqueId}-load-story-file-selector`)?.click()
                            }
                        }}
                    >
                        [Import Inky Story]
                    </button>
                {/if}
            </div>
        </div>
        <PlatformSpecificCloseAndMinimizeButton />
        <input
            title="Save Files Loading File Selector"
            type="file"
            id="{uniqueId}-load-saves-file-selector"
            accept=".json"
            style:display="none"
            onchange={() => {
                const uploader = document.getElementById(`${uniqueId}-load-saves-file-selector`)! as HTMLInputElement
                uploader.files?.[0].text().then((value) => {
                    try {
                        inkDisplay?.recoverFromStateJsonAndRefreshHistory(value)
                    } catch (e) {
                        alert_cx(
                            "Cannot load this save file, please check the content." +
                                (e instanceof Error ? "\n" + e.message : "")
                        )
                    } finally {
                        uploader.value = ""
                    }
                })
            }}
        />
        {#if ALLOW_IMPORTING_NEW_STORY}
            <input
                title="Story Loading File Selector"
                type="file"
                id="{uniqueId}-load-story-file-selector"
                accept=".zip"
                style:display="none"
                onchange={() => {
                    const uploader = document.getElementById(
                        `${uniqueId}-load-story-file-selector`
                    )! as HTMLInputElement
                    const file = uploader.files?.[0]
                    if (file) {
                        getStoryArchiveFromZip_File(file).then((value) => (storyArchive = value))
                    }
                }}
            />
        {/if}
    </div>
</div>

<style>
    .pattern-background {
        background-image:
            linear-gradient(#ffffff4c 3.2px, transparent 3.2px),
            linear-gradient(90deg, #ffffff4c 3.2px, transparent 3.2px),
            linear-gradient(#ffffff4c 1.6px, transparent 1.6px),
            linear-gradient(90deg, #ffffff4c 1.6px, transparent 1.6px);
        background-size:
            80px 80px,
            80px 80px,
            16px 16px,
            16px 16px;
        background-position:
            -3.2px -3.2px,
            -3.2px -3.2px,
            -1.6px -1.6px,
            -1.6px -1.6px;
    }
    .pattern2-background {
        background-color: #cfcfcf;
        opacity: 0.8;
        background-image:
            repeating-radial-gradient(circle at 0 0, transparent 0, #cfcfcf 16px),
            repeating-linear-gradient(#44444455, #444444);
    }
</style>
