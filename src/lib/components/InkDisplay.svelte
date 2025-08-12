<script lang="ts">
    import { ReactiveInkStory } from "$lib/models/InkStory.svelte"
    import { typewriter } from "$lib/utils/transitions/typewriter"
    import { onMount, tick } from "svelte"
    import { fly } from "svelte/transition"
    import CaretDownIcon from "~icons/gravity-ui/caret-down"

    interface InkDisplayProps {
        storyContent: string
        autoMode?: boolean
    }

    let { storyContent, autoMode = false }: InkDisplayProps = $props()

    let containerRef = $state<HTMLDivElement>()

    export const story = ReactiveInkStory.new(storyContent)

    let inkHistory: string[] = $state([])

    let inkTweening = $state(false)

    function continueStoryAndPushStack() {
        if (!story.canContinue) return
        const newText = story.continue()
        if (typeof newText == "string" && newText !== "") {
            inkHistory.push(newText)
        }
    }

    export function recoverFromStateJsonAndRefreshHistory(json: string) {
        story.recoverFromStateJson(json)
        inkHistory.push(">>> Read from Save Files")
        let currentText = story.currentText
        if (typeof currentText == "string" && currentText !== "") inkHistory.push(currentText)
    }

    function scrollContainerToBottom() {
        if (containerRef) {
            containerRef.scrollTop = containerRef.scrollHeight - containerRef.clientHeight
        }
    }

    onMount(() => {
        const ticket = setInterval(() => {
            if (inkTweening) {
                scrollContainerToBottom()
            }
        }, 150)

        return () => clearInterval(ticket)
    })

    onMount(() => {
        continueStoryAndPushStack()
    })
</script>

<div bind:this={containerRef} class="scrollbar-thin h-full w-full overflow-x-hidden overflow-y-auto font-serif">
    {#each inkHistory as historyItem, index}
        {@const isTheMostRecentLine =
            (story.canContinue || story.currentChoices.length > 0 || inkTweening) && index === inkHistory.length - 1}
        <p
            class={`transition-colors duration-1200 ${isTheMostRecentLine ? "text-[#000000]" : "text-[#0000006A]"}`}
            in:typewriter={{ speed: 1.2 }}
            out:fly={{ opacity: 0, y: -30 }}
            onintrostart={() => (inkTweening = true)}
            onintroend={() => {
                inkTweening = false
                scrollContainerToBottom()
                if (autoMode) tick().then(() => continueStoryAndPushStack())
            }}
            onoutrostart={() => (inkTweening = true)}
            onoutroend={() => (inkTweening = false)}
        >
            {historyItem}
        </p>
        {#if !isTheMostRecentLine}
            <div class="my-2"></div>
        {/if}
    {/each}
    {#if !inkTweening}
        <div in:fly={{ duration: 300, x: 30 }} {@attach scrollContainerToBottom}>
            {#if story.canContinue}
                <button
                    class="m-1 flex rounded-full p-1 text-sm text-gray-800 italic"
                    onclick={() => continueStoryAndPushStack()}
                >
                    <CaretDownIcon width="20" height="20" />
                    <span>Continue</span>
                </button>
            {:else if story.currentChoices.length > 0}
                {#each story.currentChoices as choice}
                    <button
                        class="m-1 flex rounded-full border border-gray-300 bg-gray-50 p-1 px-3 text-sm text-black"
                        onclick={() => {
                            story.chooseChoiceIndex(choice.index)
                            continueStoryAndPushStack()
                        }}
                    >
                        {choice.text}
                    </button>
                {/each}
            {:else}
                <p class="italic">-- The End.</p>
            {/if}
        </div>
    {/if}
</div>

<style>
    .scrollbar-thin {
        scrollbar-width: thin;
    }
</style>
