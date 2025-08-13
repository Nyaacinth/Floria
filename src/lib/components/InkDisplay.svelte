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

    export function clearHistory() {
        inkHistory = []
    }

    onMount(() => {
        // Smoothly Scroll to Bottom by Default
        let fontSize = containerRef ? parseFloat(getComputedStyle(containerRef).fontSize.replace("px", "")) : 16
        console.log(fontSize)
        let start: number
        function progressive_ScrollContainerToBottom(timestamp: number) {
            if (start === undefined) {
                start = timestamp
            }
            const dt = timestamp - start

            if (containerRef) {
                const targetScrollTop = containerRef.scrollHeight - containerRef.clientHeight
                if (
                    targetScrollTop > containerRef.scrollTop &&
                    targetScrollTop - containerRef.scrollTop < 3 * fontSize
                ) {
                    containerRef.scrollTop += dt * 0.00005
                }
            }
        }
        let ticket: number
        const callback = (timestamp: number) => {
            progressive_ScrollContainerToBottom(timestamp)
            ticket = requestAnimationFrame(callback)
        }
        ticket = requestAnimationFrame(callback)
        return () => cancelAnimationFrame(ticket)
    })

    onMount(() => {
        continueStoryAndPushStack()
    })

    story.bindExternalFunction("clear", () => {
        clearHistory()
    })
</script>

<div bind:this={containerRef} class="scrollbar-semitrans h-full w-full overflow-x-hidden overflow-y-auto font-serif">
    {#each inkHistory as historyItem, index}
        {@const isTheMostRecentLine =
            (story.canContinue || story.currentChoices.length > 0 || inkTweening) && index === inkHistory.length - 1}
        <p
            class={`transition-colors duration-1200 ${isTheMostRecentLine ? "text-[#000000]" : "text-[#0000006A]"}`}
            in:typewriter={{ speed: 1.2 }}
            out:fly={{ opacity: 0, y: -30 }}
            onintrostart={() => (inkTweening = true)}
            onintroend={() => {
                if (autoMode) {
                    tick().then(() =>
                        setTimeout(() => {
                            continueStoryAndPushStack()
                            inkTweening = false
                        }, 700)
                    )
                } else {
                    inkTweening = false
                }
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
    <div class="min-h-[33%] w-full">
        {#if !inkTweening}
            <div in:fly={{ duration: 300, x: 30 }}>
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
</div>

<style>
    .scrollbar-semitrans {
        scrollbar-width: thin;
        scrollbar-color: #444444af #00000000;
    }
    .scrollbar-semitrans::-webkit-scrollbar-thumb {
        /* Foreground */
        background: #444444af;
    }
    .scrollbar-semitrans::-webkit-scrollbar-track {
        /* Background */
        background: #00000000;
    }
</style>
