import { useMount } from "@reactuses/core"
import { motion } from "motion/react"
import type { FunctionComponent } from "react"
import { use, useRef, useState } from "react"

import getMainStory from "../../assets/story/main"
import { IconMaterialSymbolRestartAltRounded } from "../../components/IconMaterialSymbolRestartAltRounded"
import { Typewriter } from "../../components/Typewriter"
import { useAutoScrollDown } from "../../hooks/useAutoScrollDown"
import { useInkIntegration } from "../../hooks/useInkIntegration"
import { TypewriterSfxSpawner } from "../../utils/TypewriterSfxSpawner"
import { controls } from "./controls"
import { ImageFrag, SoundFrag, VideoFrag } from "./media-frags"

import styles from "./styles.module.css"

const mainStoryHandle = getMainStory()

export const SplashAsync: FunctionComponent = () => {
    const mainStory = use(mainStoryHandle)
    const integration = useInkIntegration(mainStory, (_actionName, _value) => {})
    const inited = useRef(false)
    const [tweening, setTweening] = useState(false)

    const typingInterval = mainStory.props?.typingInterval ?? 75

    useMount(() => {
        if (inited.current) return
        if (integration.story.canContinue) {
            integration.continueStory()
        }
        inited.current = true
    })

    const handleFragTweeningStart = () => setTweening(true)
    const handleFragTweeningEnd = () => {
        if (integration.story.canContinue) {
            integration.continueStory()
        } else {
            setTweening(false)
        }
    }

    const autoScrollContainerRef = useRef<HTMLDivElement>(null)
    useAutoScrollDown(autoScrollContainerRef)

    return (
        <div className={`h-full w-full overflow-x-hidden overflow-y-hidden bg-mauve-600 ${styles.setDefaultFonts}`}>
            <div className="absolute top-8 left-16.5 h-[calc(100%-4rem)] w-14">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 100, transition: { duration: 0.1 } }}
                    className={`${styles.controlsContainer} text-[#ccccccbf]`}
                >
                    {controls.map((item) => {
                        const [label, SpecifiedIcon, callback] = item
                        return (
                            <div key={label} aria-label={label} className="contents" onClick={callback}>
                                <SpecifiedIcon size={40} />
                            </div>
                        )
                    })}
                </motion.div>
            </div>
            <div className="absolute top-8 right-16 h-[calc(100%-4rem)] w-[calc(100%-12rem)]">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 100, transition: { duration: 0.1 } }}
                    className={styles.stampContainer}
                >
                    <div
                        ref={autoScrollContainerRef}
                        className="relative h-full w-full scrollbar-thin overflow-x-hidden overflow-y-auto"
                    >
                        {integration.messageCollection.map((item, index) => {
                            const isTheMostRecentLine =
                                (integration.canContinue || integration.currentChoices.length > 0 || tweening) &&
                                index === integration.messageCollection.length - 1
                            const itemIndex = `${index}#${JSON.stringify(item)}`
                            switch (item.type) {
                                case "text": {
                                    return (
                                        <motion.p
                                            className="mt-0.5 mb-0.5"
                                            transition={{ ease: "easeInOut", duration: 0.35 }}
                                            key={itemIndex}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: isTheMostRecentLine ? 1 : 0.8 }}
                                            whileHover={{ opacity: 1 }}
                                        >
                                            {item.author ? (
                                                <span className="mr-1 rounded-sm bg-amber-100 pr-1 pl-1">
                                                    {item.author}:
                                                </span>
                                            ) : null}
                                            <Typewriter
                                                richtextHtml={item.html}
                                                interval={typingInterval}
                                                onTypingStart={handleFragTweeningStart}
                                                onTyped={() => TypewriterSfxSpawner.playTyped()}
                                                onTypingEnd={() => {
                                                    handleFragTweeningEnd()
                                                    TypewriterSfxSpawner.playEnter()
                                                }}
                                            />
                                        </motion.p>
                                    )
                                }
                                case "image": {
                                    return (
                                        <ImageFrag
                                            item={item}
                                            isTheMostRecentLine={isTheMostRecentLine}
                                            onTweeningStart={handleFragTweeningStart}
                                            onTweeningEnd={handleFragTweeningEnd}
                                            key={itemIndex}
                                        />
                                    )
                                }
                                case "sound": {
                                    return (
                                        <SoundFrag
                                            item={item}
                                            isTheMostRecentLine={isTheMostRecentLine}
                                            onTweeningStart={handleFragTweeningStart}
                                            onTweeningEnd={handleFragTweeningEnd}
                                            key={itemIndex}
                                        />
                                    )
                                }
                                case "video": {
                                    return (
                                        <VideoFrag
                                            item={item}
                                            isTheMostRecentLine={isTheMostRecentLine}
                                            onTweeningStart={handleFragTweeningStart}
                                            onTweeningEnd={handleFragTweeningEnd}
                                            key={itemIndex}
                                        />
                                    )
                                }
                            }
                        })}
                        <div className="min-h-[30%]">
                            {!tweening ? (
                                <motion.div
                                    transition={{ ease: "easeInOut", duration: 0.35 }}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    {integration.currentChoices.length > 0 ? (
                                        integration.currentChoices.map((value, index) => {
                                            return (
                                                <button
                                                    key={index}
                                                    className="m-1 flex rounded-full bg-gray-800 pt-1 pr-2 pb-1 pl-2 text-sm text-white italic"
                                                    onClick={() => {
                                                        integration.chooseChoiceIndex(value.index)
                                                        if (integration.story.canContinue) {
                                                            integration.continueStory()
                                                        }
                                                    }}
                                                >
                                                    {value.text}
                                                </button>
                                            )
                                        })
                                    ) : !integration.canContinue ? (
                                        <>
                                            <p className="m-2 text-sm text-amber-800 italic">· El Final ·</p>
                                            <button
                                                className="m-2 flex rounded-full bg-gray-800 p-1 text-white"
                                                onClick={() => {
                                                    integration.resetCurrentStory()
                                                    setTimeout(() => {
                                                        if (integration.story.canContinue) {
                                                            integration.continueStory()
                                                            setTweening(true)
                                                        }
                                                    }, 300)
                                                }}
                                            >
                                                <IconMaterialSymbolRestartAltRounded size={20} />
                                            </button>
                                        </>
                                    ) : null}
                                </motion.div>
                            ) : null}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
