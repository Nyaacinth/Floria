<script lang="ts">
    import inkyTestString from "$lib/assets/data/inky-default-story.json?raw"
    import FloriaLogo from "$lib/components/FloriaLogo.svelte"
    import InkDisplay from "$lib/components/InkDisplay.svelte"
    import PlatformSpecificCloseAndMinimizeButton from "$lib/components/PlatformSpecificCloseAndMinimizeButton.svelte"
    import { defaultStoryBackground } from "$lib/constants"
    import { downloadTextFile } from "$lib/utils/downloadTextFile"
    import { getStoryArchiveFromZip, type StoryArchive } from "$lib/utils/getStoryArchiveFromZip"

    let storyArchive = $state.raw<StoryArchive>({
        storyContent: inkyTestString,
        images: {},
        audio: {}
    })

    let inkDisplay = $state<InkDisplay>()

    let background = $state(defaultStoryBackground)

    let autoMode = $state(false)

    const uniqueId = $props.id()
</script>

<div class="isometric-background relative h-full w-full" style:--story-background={background} data-tauri-drag-region>
    <div
        class="absolute top-6 left-[15%] h-[calc(100%-4rem)] w-[calc(100%-2*15%)] rounded-sm bg-[#ffffffcf] p-4 shadow-2xl backdrop-blur-lg"
    >
        {#key storyArchive}
            <InkDisplay bind:this={inkDisplay} {storyArchive} {autoMode} bind:background />
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
                    document.getElementById(`${uniqueId}-load-saves-file-selector`)?.click()
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
                class="absolute right-0 mx-2"
                onclick={() => {
                    document.getElementById(`${uniqueId}-load-story-file-selector`)?.click()
                }}
            >
                [Import Inky Story]
            </button>
        </div>
    </div>
    <PlatformSpecificCloseAndMinimizeButton />
    <FloriaLogo />
    <input
        type="file"
        id={`${uniqueId}-load-saves-file-selector`}
        accept=".json"
        style:display="none"
        onchange={() => {
            const uploader = document.getElementById(`${uniqueId}-load-saves-file-selector`)! as HTMLInputElement
            uploader.files?.[0].text().then((value) => {
                inkDisplay?.recoverFromStateJsonAndRefreshHistory(value)
                uploader.value = ""
            })
        }}
    />
    <input
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
</div>

<style>
    .isometric-background {
        background-color: hsl(from var(--story-background) h s calc(l + 10));
        opacity: 0.8;
        background-size: 17px 17px;
        background-image: repeating-linear-gradient(
            45deg,
            var(--story-background) 0,
            var(--story-background) 1.7000000000000002px,
            hsl(from var(--story-background) h s calc(l + 10)) 0,
            hsl(from var(--story-background) h s calc(l + 10)) 50%
        );
    }
</style>
