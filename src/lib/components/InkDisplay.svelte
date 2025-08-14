<script lang="ts">
    import { defaultStoryBackground } from "$lib/constants"
    import { ReactiveInkStory } from "$lib/models/InkStory.svelte"
    import { getPureTextLength } from "$lib/utils/getPureTextLength"
    import type { StoryArchive } from "$lib/utils/getStoryArchiveFromZip"
    import DOMPurify from "dompurify"
    import { onMount, tick } from "svelte"
    import { fade, fly } from "svelte/transition"
    import CaretDownIcon from "~icons/gravity-ui/caret-down"

    interface InkDisplayProps {
        storyArchive: StoryArchive
        autoMode?: boolean
        background: string
    }

    let { storyArchive, autoMode = false, background = $bindable() }: InkDisplayProps = $props()

    let containerRef = $state<HTMLDivElement>()

    export const story = ReactiveInkStory.new(storyArchive.storyContent)

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
                    targetScrollTop - containerRef.scrollTop <
                        parseFloat(getComputedStyle(containerRef).height.replace("px", "")) * 0.25
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

    story.bindExternalFunction("playSound", (name) => {
        if (!name || typeof name != "string") {
            story.warning("Invalid sound name")
            inkHistory.push(">>> Invalid Sound Name Detected")
            return
        }
        const audioObj = storyArchive.audio[name]
        if (!audioObj) {
            inkHistory.push(`>>> Sound Not Found: ${name}`)
            return
        }
        const audioElement = document.createElement("audio")
        audioElement.src = audioObj.prefix + audioObj.base64
        audioElement.play()
    })

    try {
        function setBackground(value: unknown) {
            if (typeof value != "string" || value === "") return
            if (value === "default") {
                background = defaultStoryBackground
                return
            }
            background = value
        }
        setBackground(story.getVariableState("background"))
        story.addVariableObserver("background", (varName, value) => {
            if (varName !== "background") return
            setBackground(value)
        })
    } catch {
        background = defaultStoryBackground
    }

    let enterPressed = false

    let continueButtonRef = $state<HTMLButtonElement>()
</script>

<svelte:window
    onkeydown={(e) => {
        if (e.key === "Enter" && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && !e.repeat) {
            if (!enterPressed && !inkTweening) {
                if (continueButtonRef) {
                    continueButtonRef.click()
                }
            }
            enterPressed = true
        }
    }}
    onkeyup={(e) => {
        if (e.key === "Enter") {
            enterPressed = false
        }
    }}
/>

<div
    bind:this={containerRef}
    class="scrollbar-semitrans customized-font-serif h-full w-full overflow-x-hidden overflow-y-auto"
>
    {#each inkHistory as historyItem, index}
        {@const isTheMostRecentLine =
            (story.canContinue || story.currentChoices.length > 0 || inkTweening) && index === inkHistory.length - 1}
        <div
            in:fly={{ opacity: 0, x: 30 }}
            out:fly={{ opacity: 0, y: -30 }}
            onintrostart={() => (inkTweening = true)}
            onintroend={() => {
                if (autoMode) {
                    tick().then(() => {
                        setTimeout(
                            () => {
                                continueStoryAndPushStack()
                                inkTweening = false
                            },
                            getPureTextLength(historyItem.replace(/^\>\>\>\:\:[A-z]+\:\:/gm, "")) * 100 + 220
                        )
                    })
                } else {
                    inkTweening = false
                }
            }}
            onoutrostart={() => (inkTweening = true)}
            onoutroend={() => (inkTweening = false)}
            class={`text-[#000000] transition-opacity duration-1200 hover:opacity-100 ${isTheMostRecentLine ? "opacity-100" : "opacity-41"}`}
        >
            {#if !historyItem.startsWith(">>>::")}
                <p>
                    {historyItem}
                </p>
            {:else if historyItem.startsWith(">>>::img::")}
                {@const imageName = historyItem.substring(10).trim()}
                {@const imageObj = storyArchive.images[imageName]}
                {#if imageObj}
                    <img src={imageObj.prefix + imageObj.base64} alt={imageName} />
                {:else}
                    <p>{">>>"} Image Not Found: {imageName}</p>
                {/if}
            {:else if historyItem.startsWith(">>>::hypertext::")}
                {@html DOMPurify.sanitize(historyItem.substring(16))}
            {/if}
        </div>
        {#if !isTheMostRecentLine}
            <div class="my-2"></div>
        {/if}
    {/each}
    <div class="min-h-[33%] w-full">
        {#if !inkTweening}
            <div in:fade={{ duration: 350 }}>
                {#if story.canContinue}
                    <button
                        bind:this={continueButtonRef}
                        class="blink-opacity m-1 flex rounded-full p-1 text-sm text-gray-800 italic"
                        onclick={() => continueStoryAndPushStack()}
                    >
                        <CaretDownIcon width="20" height="20" />
                        <!-- <span>Continue</span> -->
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
                    <p class="text-sm text-gray-700 italic">-- End of Story --</p>
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
    .customized-font-serif {
        font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif, NSimSun, "MS Mincho", Batang;
    }

    @keyframes blink-opacity-kf {
        0%,
        100% {
            opacity: 100%;
        }
        50% {
            opacity: 41%;
        }
    }
    .blink-opacity {
        animation: blink-opacity-kf 1.5s ease-in-out infinite;
    }
</style>
