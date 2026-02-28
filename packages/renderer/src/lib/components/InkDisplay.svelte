<script lang="ts">
    import { defaultStoryBackground } from "$lib/constants"
    import { ReactiveInkStory } from "$lib/models/InkStory.svelte"
    import type { StoryArchive } from "$lib/utils/createStoryArchive"
    import { getPureTextLength } from "$lib/utils/getPureTextLength"
    import DOMPurify from "dompurify"
    import { onMount, tick } from "svelte"
    import { fade, fly } from "svelte/transition"
    import CaretDownIcon from "~icons/gravity-ui/caret-down"

    interface InkDisplayProps {
        storyArchive: StoryArchive
        autoMode?: boolean
        background: string
        onshake?: () => void
    }

    let { storyArchive, autoMode = false, background = $bindable(), onshake }: InkDisplayProps = $props()

    let containerRef = $state<HTMLDivElement>()

    let containerHeight = $state("0px")

    $effect(() => {
        if (containerRef) {
            containerHeight = getComputedStyle(containerRef).height
        }
    })

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

    let autoScrollInterrupted = false
    onMount(() => {
        let animationId: number
        let lastTime = 0
        let abortSignal = false
        const autoScrollInterval = 12

        function autoScroll(currentTime: number) {
            if (abortSignal) return
            // Throttle to approximately 100ms intervals
            if (currentTime - lastTime < autoScrollInterval) {
                animationId = requestAnimationFrame(autoScroll)
                return
            }
            lastTime = currentTime

            if (autoScrollInterrupted) {
                animationId = requestAnimationFrame(autoScroll)
                return
            }
            if (containerRef) {
                const containerScrollTop = containerRef.scrollTop
                const targetScrollTop = containerRef.scrollHeight - containerRef.clientHeight
                if (containerScrollTop !== 0 && targetScrollTop > containerScrollTop) {
                    containerRef.scrollBy({
                        top: Math.max(0.3 * (targetScrollTop - containerScrollTop), 0.01),
                        behavior: "smooth"
                    })
                }
            }

            animationId = requestAnimationFrame(autoScroll)
        }

        animationId = requestAnimationFrame(autoScroll)

        return () => {
            cancelAnimationFrame(animationId)
            abortSignal = true
        }
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
        audioElement.src = audioObj.prefix + audioObj.data
        audioElement.play()
    })

    story.bindExternalFunction("shake", () => onshake?.())

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
    onwheel={(e) => {
        if (e.deltaY !== 0) {
            autoScrollInterrupted = true
        }
    }}
    onresize={() => {
        if (containerRef) {
            containerHeight = getComputedStyle(containerRef).height
        }
    }}
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
    ontouchmove={(e) => {
        autoScrollInterrupted = true
    }}
>
    {#each inkHistory as historyItem, index}
        {@const isTheMostRecentLine =
            (story.canContinue || story.currentChoices.length > 0 || inkTweening) && index === inkHistory.length - 1}
        <div
            in:fly={{ opacity: 0, x: 30 }}
            out:fly={{ opacity: 0, y: -30 }}
            onintrostart={() => {
                tick().then(() => {
                    if (containerRef) {
                        const difference =
                            containerRef.scrollHeight - containerRef.clientHeight - containerRef.scrollTop
                        if (
                            difference > 1 &&
                            difference < parseFloat(getComputedStyle(containerRef).height.replace("px", "")) * 0.25
                        ) {
                            containerRef.scrollTop += 1
                            autoScrollInterrupted = false
                        }
                    }
                })
                inkTweening = true
            }}
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
            class="text-[#000000] transition-opacity duration-1200 hover:opacity-100 {isTheMostRecentLine
                ? 'opacity-100'
                : 'opacity-41'}"
        >
            {#if !historyItem.startsWith("::")}
                <p>
                    {historyItem}
                </p>
            {:else if historyItem.startsWith("::img::")}
                {@const imageName = historyItem.substring(7).trim()}
                {@const imageObj = storyArchive.images[imageName]}
                {#if imageObj}
                    <img
                        {@attach () => {
                            tick().then(() => {
                                if (containerRef) {
                                    containerRef.scrollTop += 1
                                }
                            })
                        }}
                        class="w-full object-contain object-left"
                        src={imageObj.prefix + imageObj.data}
                        alt={imageName}
                    />
                {:else}
                    <p>{">>>"} Image Not Found: {imageName}</p>
                {/if}
            {:else if historyItem.startsWith("::html::")}
                {@html DOMPurify.sanitize(historyItem.substring(8))}
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
                        aria-label="Button: Continue the Story"
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
                            class="m-1 rounded-[0.875rem] border border-gray-300 bg-gray-50 p-1 px-3 text-left text-sm text-black transition-all duration-300 hover:bg-gray-200"
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
