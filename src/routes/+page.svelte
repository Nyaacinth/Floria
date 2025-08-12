<script lang="ts">
    import inkyTestString from "$lib/assets/data/inky-test.json?raw"
    import InkDisplay from "$lib/components/InkDisplay.svelte"
    import PlatformSpecificCloseButton from "$lib/components/PlatformSpecificCloseButton.svelte"
    import { downloadTextFile } from "$lib/utils/downloadTextFile"
    import { onMount } from "svelte"

    let storyContent = $state(inkyTestString)

    let inkDisplay = $state<InkDisplay>()

    const uniqueId = $props.id()

    onMount(() => {
        ;(window as any).myInkDisplay = inkDisplay
    })
</script>

<div class="isometric-background relative h-full w-full" data-tauri-drag-region>
    <div
        class="absolute top-6 left-[15%] h-[calc(100%-4rem)] w-[calc(100%-2*15%)] rounded-sm bg-[#ffffffcf] p-4 shadow-2xl backdrop-blur-lg"
    >
        {#key storyContent}
            <InkDisplay bind:this={inkDisplay} {storyContent} />
        {/key}
    </div>
    <div class="absolute bottom-0 h-5 w-full bg-[#000000cf] px-2 text-[0.8rem] text-[#ffffffef]">
        <div class="relative h-full w-full">
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
                class="absolute right-0 mx-2"
                onclick={() => {
                    document.getElementById(`${uniqueId}-load-story-file-selector`)?.click()
                }}
            >
                [Import Inky Story]
            </button>
        </div>
    </div>
    <PlatformSpecificCloseButton />
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
        accept=".json"
        style:display="none"
        onchange={() => {
            const uploader = document.getElementById(`${uniqueId}-load-story-file-selector`)! as HTMLInputElement
            uploader.files?.[0].text().then((value) => {
                storyContent = value
                uploader.value = ""
            })
        }}
    />
</div>

<style>
    .isometric-background {
        background-color: #99bcac44;
        opacity: 0.8;
        background-image:
            linear-gradient(30deg, #99bcac 12%, transparent 12.5%, transparent 87%, #99bcac 87.5%, #99bcac),
            linear-gradient(150deg, #99bcac 12%, transparent 12.5%, transparent 87%, #99bcac 87.5%, #99bcac),
            linear-gradient(30deg, #99bcac 12%, transparent 12.5%, transparent 87%, #99bcac 87.5%, #99bcac),
            linear-gradient(150deg, #99bcac 12%, transparent 12.5%, transparent 87%, #99bcac 87.5%, #99bcac),
            linear-gradient(60deg, #99bcac77 25%, transparent 25.5%, transparent 75%, #99bcac77 75%, #99bcac77),
            linear-gradient(60deg, #99bcac77 25%, transparent 25.5%, transparent 75%, #99bcac77 75%, #99bcac77);
        background-size: 20px 35px;
        background-position:
            0 0,
            0 0,
            10px 18px,
            10px 18px,
            0 0,
            10px 18px;
    }
</style>
