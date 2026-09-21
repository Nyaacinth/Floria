import { useMount } from "@reactuses/core"
import { AnimatePresence, motion } from "motion/react"
import { useState, type FunctionComponent } from "react"

import { IconMaterialSymbolRestartAltRounded } from "../../components/IconMaterialSymbolRestartAltRounded"
import { Typewriter } from "../../components/Typewriter"
import type { StoryDefinition } from "../../hooks/useInkIntegration"
import { useInkIntegration } from "../../hooks/useInkIntegration"
import crimeDetectiveTestEntry from "../data.local/test.json?raw"

import styles from "./index.module.css"

const testStoryDef: StoryDefinition = {
    entry: crimeDetectiveTestEntry,
    images: {},
    sounds: {},
    music: {},
    videos: {}
}

export const Splash: FunctionComponent = () => {
    const integration = useInkIntegration(testStoryDef, (_actionName, _value) => {})

    const [tweening, setTweening] = useState(false)

    useMount(() => {
        if (integration.story.canContinue) {
            integration.continueStory()
            setTweening(true)
        }
    })

    return (
        <div className={`h-full w-full overflow-x-hidden overflow-y-hidden bg-amber-50 ${styles.setDefaultFontOrder}`}>
            <div className="absolute top-8 right-16 h-[calc(100%-4rem)] w-[calc(100%-8rem)]">
                <div className="h-full w-full overflow-x-hidden overflow-y-auto">
                    {integration.messageCollection.map((item, index) => {
                        const isTheMostRecentLine =
                            (integration.canContinue || integration.currentChoices.length > 0 || tweening) &&
                            index === integration.messageCollection.length - 1
                        switch (item.type) {
                            case "text": {
                                return (
                                    <motion.p
                                        transition={{ ease: "easeInOut", duration: 0.35 }}
                                        key={index + "#" + JSON.stringify(item)}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: isTheMostRecentLine ? 1 : 0.8 }}
                                        whileHover={{ opacity: 1 }}
                                    >
                                        <Typewriter
                                            richtextHtml={item.html}
                                            interval={75}
                                            onTypingStart={() => setTweening(true)}
                                            onTyped={() => {}}
                                            onTypingEnd={() => {
                                                if (integration.story.canContinue) {
                                                    integration.continueStory()
                                                } else {
                                                    setTweening(false)
                                                }
                                            }}
                                        />
                                    </motion.p>
                                )
                            }
                            case "image": {
                                return "Wat? Image?"
                            }
                            case "sound": {
                                return "Wat? Sound?"
                            }
                            case "video": {
                                return "Wat? Video?"
                            }
                        }
                    })}
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
        </div>
    )
}
