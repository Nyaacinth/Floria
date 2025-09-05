<script lang="ts">
    // If you want to ship your own default story (or the only story), you can start by modifying
    // the constant below and `storyArchive` variable, go to `${workspaceFolder}/src/lib/assets/data`
    // and add your story & assets there.
    const ALLOW_IMPORTING_NEW_STORY = true

    import inkyTestString from "$lib/assets/data/inky-default-story.json?raw"
    import FloriaLogo from "$lib/components/FloriaLogo.svelte"
    import InkDisplay from "$lib/components/InkDisplay.svelte"
    import PlatformSpecificCloseAndMinimizeButton from "$lib/components/PlatformSpecificCloseAndMinimizeButton.svelte"
    import { defaultStoryBackground } from "$lib/constants"
    import { alert_cx } from "$lib/utils/alert_cx"
    import type { CSSColor, ImageBackground } from "$lib/utils/background"
    import { isCSSColor, isImageBackground } from "$lib/utils/background"
    import { downloadTextFile } from "$lib/utils/downloadTextFile"
    import {
        getStoryArchiveFromZip,
        getStoryArchiveFromZip_Tauri,
        type StoryArchive
    } from "$lib/utils/getStoryArchiveFromZip"
    import { getTextFromFile_Tauri } from "$lib/utils/getTextFromFile_Tauri"
    import { isTauri } from "@tauri-apps/api/core"
    import { fade } from "svelte/transition"

    let storyArchive = $state.raw<StoryArchive>({
        storyContent: inkyTestString,
        images: {},
        audio: {}
    })

    let inkDisplay = $state<InkDisplay>()

    let background: CSSColor | ImageBackground = $state(defaultStoryBackground)

    let containerRef = $state<HTMLDivElement>()

    let autoMode = $state(false)

    const uniqueId = $props.id()

    function shakeContainer() {
        if (!containerRef) return
        containerRef.animate(
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
    class="pattern-background relative h-full w-full transition-colors duration-500"
    style:background-color={isCSSColor(background) ? background : "white"}
    data-tauri-drag-region
>
    {#if isImageBackground(background)}
        {@const imageName = background.substring(4).trim()}
        {@const imageObj = storyArchive.images[imageName]}
        <img
            transition:fade={{ duration: 500 }}
            class="pointer-events-none absolute z-[-1] h-full w-full object-cover"
            src={imageObj.prefix + imageObj.data}
            alt={imageName}
        />
    {/if}
    <div
        bind:this={containerRef}
        class="absolute top-6 left-[15%] h-[calc(100%-4rem)] w-[calc(100%-2*15%)] rounded-sm bg-[#ffffffcf] p-4 shadow-2xl backdrop-blur-lg"
    >
        {#key storyArchive}
            <InkDisplay bind:this={inkDisplay} {storyArchive} {autoMode} bind:background onshake={shakeContainer} />
        {/key}
    </div>
    <div class="absolute bottom-0 h-5 w-full bg-[#000000cf] px-2 text-[0.8rem] text-[#ffffffef]">
        <div class="relative h-full w-full">
            <button class={`mx-2 ${autoMode ? "text-blue-400" : ""}`} onclick={() => (autoMode = !autoMode)}>
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
    <FloriaLogo />
    <input
        title="Save Files Loading File Selector"
        type="file"
        id={`${uniqueId}-load-saves-file-selector`}
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
            id={`${uniqueId}-load-story-file-selector`}
            accept=".zip"
            style:display="none"
            onchange={() => {
                const uploader = document.getElementById(`${uniqueId}-load-story-file-selector`)! as HTMLInputElement
                const file = uploader.files?.[0]
                if (file) {
                    getStoryArchiveFromZip(file).then((value) => (storyArchive = value))
                }
            }}
        />
    {/if}
</div>

<style>
    .pattern-background {
        opacity: 0.8;
        background-size: 17px 17px;
        background-image: repeating-linear-gradient(
            45deg,
            transparent 0,
            transparent 1.7000000000000002px,
            #ffffff4c 0,
            #ffffff4c 50%
        );
    }
</style>
