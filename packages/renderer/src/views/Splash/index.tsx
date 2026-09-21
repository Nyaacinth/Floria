import { useMount } from "@reactuses/core"
import { motion } from "motion/react"
import type { FunctionComponent } from "react"
import { Fragment, useRef, useState } from "react"

import mainStory from "../../assets/story/main"
import { IconMaterialSymbolRestartAltRounded } from "../../components/IconMaterialSymbolRestartAltRounded"
import { Typewriter } from "../../components/Typewriter"
import { useInkIntegration } from "../../hooks/useInkIntegration"
import type { InkMessageItemImage, InkMessageItemSound, InkMessageItemVideo } from "../../hooks/useInkMessageCollection"

import styles from "./index.module.css"

export const Splash: FunctionComponent = () => {
    const integration = useInkIntegration(mainStory, (_actionName, _value) => {})
    const inited = useRef(false)
    const [tweening, setTweening] = useState(false)

    useMount(() => {
        if (inited.current) return
        if (integration.story.canContinue) {
            integration.continueStory()
        }
        inited.current = true
    })

    return (
        <div className={`h-full w-full overflow-x-hidden overflow-y-hidden bg-amber-50 ${styles.setDefaultFontOrder}`}>
            <div className="absolute top-8 right-16 h-[calc(100%-4rem)] w-[calc(100%-8rem)]">
                <div className="h-full w-full scrollbar-thin overflow-x-hidden overflow-y-auto">
                    {integration.messageCollection.map((item, index) => {
                        const isTheMostRecentLine =
                            (integration.canContinue || integration.currentChoices.length > 0 || tweening) &&
                            index === integration.messageCollection.length - 1
                        switch (item.type) {
                            case "text": {
                                return (
                                    <motion.p
                                        className="mt-0.5 mb-0.5"
                                        transition={{ ease: "easeInOut", duration: 0.35 }}
                                        key={index + "#" + JSON.stringify(item)}
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
                                return (
                                    <ImageFrag
                                        item={item}
                                        isTheMostRecentLine={isTheMostRecentLine}
                                        onTweeningStart={() => setTweening(true)}
                                        onTweeningEnd={() => {
                                            if (integration.story.canContinue) {
                                                integration.continueStory()
                                            } else {
                                                setTweening(false)
                                            }
                                        }}
                                        key={index + "#" + JSON.stringify(item)}
                                    />
                                )
                            }
                            case "sound": {
                                return (
                                    <SoundFrag
                                        item={item}
                                        isTheMostRecentLine={isTheMostRecentLine}
                                        onTweeningStart={() => setTweening(true)}
                                        onTweeningEnd={() => {
                                            if (integration.story.canContinue) {
                                                integration.continueStory()
                                            } else {
                                                setTweening(false)
                                            }
                                        }}
                                        key={index + "#" + JSON.stringify(item)}
                                    />
                                )
                            }
                            case "video": {
                                return (
                                    <VideoFrag
                                        item={item}
                                        isTheMostRecentLine={isTheMostRecentLine}
                                        onTweeningStart={() => setTweening(true)}
                                        onTweeningEnd={() => {
                                            if (integration.story.canContinue) {
                                                integration.continueStory()
                                            } else {
                                                setTweening(false)
                                            }
                                        }}
                                        key={index + "#" + JSON.stringify(item)}
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
            </div>
        </div>
    )
}

const ImageFrag: FunctionComponent<{
    item: InkMessageItemImage
    isTheMostRecentLine: boolean
    onTweeningStart: () => void
    onTweeningEnd: () => void
}> = ({ item, isTheMostRecentLine, onTweeningStart, onTweeningEnd }) => {
    const introStarted = useRef(false)
    const introEnded = useRef(false)
    return (
        <Fragment>
            {item.author ? (
                <motion.p
                    className="mt-0.5 mb-0.5"
                    transition={{ ease: "easeInOut", duration: 0.35 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isTheMostRecentLine ? 1 : 0.8 }}
                    whileHover={{ opacity: 1 }}
                >
                    <span className="rounded-sm bg-amber-100 pr-1 pl-1">{item.author}:</span>
                </motion.p>
            ) : null}
            <motion.img
                className="w-[50%] rounded-lg border border-gray-500 object-contain object-left"
                src={item.src}
                transition={{ ease: "easeInOut", duration: 0.35 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: isTheMostRecentLine ? 1 : 0.8 }}
                whileHover={{ opacity: 1 }}
                onAnimationStart={() => {
                    if (introStarted.current) return
                    onTweeningStart()
                    introStarted.current = true
                }}
                onAnimationComplete={() => {
                    if (introEnded.current) return
                    onTweeningEnd()
                    introEnded.current = true
                }}
            />
        </Fragment>
    )
}

const SoundFrag: FunctionComponent<{
    item: InkMessageItemSound
    isTheMostRecentLine: boolean
    onTweeningStart: () => void
    onTweeningEnd: () => void
}> = ({ item, isTheMostRecentLine, onTweeningStart, onTweeningEnd }) => {
    const introStarted = useRef(false)
    const introEnded = useRef(false)
    return (
        <Fragment>
            {item.author ? (
                <motion.p
                    className="mt-0.5 mb-0.5"
                    transition={{ ease: "easeInOut", duration: 0.35 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isTheMostRecentLine ? 1 : 0.8 }}
                    whileHover={{ opacity: 1 }}
                >
                    <span className="rounded-sm bg-amber-100 pr-1 pl-1">{item.author}:</span>
                </motion.p>
            ) : null}
            <motion.audio
                className="rounded-full border border-gray-500"
                transition={{ ease: "easeInOut", duration: 0.35 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: isTheMostRecentLine ? 1 : 0.8 }}
                whileHover={{ opacity: 1 }}
                controls
                controlsList="nofullscreen nodownload noremoteplayback noplaybackrate"
                src={item.src}
                autoPlay
                onAnimationStart={() => {
                    if (introStarted.current) return
                    onTweeningStart()
                    introStarted.current = true
                }}
                onAnimationComplete={() => {
                    if (introEnded.current) return
                    onTweeningEnd()
                    introEnded.current = true
                }}
            />
        </Fragment>
    )
}

const VideoFrag: FunctionComponent<{
    item: InkMessageItemVideo
    isTheMostRecentLine: boolean
    onTweeningStart: () => void
    onTweeningEnd: () => void
}> = ({ item, isTheMostRecentLine, onTweeningStart, onTweeningEnd }) => {
    const introStarted = useRef(false)
    const introEnded = useRef(false)
    return (
        <Fragment>
            {item.author ? (
                <motion.p
                    className="mt-0.5 mb-0.5"
                    transition={{ ease: "easeInOut", duration: 0.35 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isTheMostRecentLine ? 1 : 0.8 }}
                    whileHover={{ opacity: 1 }}
                >
                    <span className="rounded-sm bg-amber-100 pr-1 pl-1">{item.author}:</span>
                </motion.p>
            ) : null}
            <motion.video
                className="w-[50%] rounded-lg border border-gray-500"
                transition={{ ease: "easeInOut", duration: 0.35 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: isTheMostRecentLine ? 1 : 0.8 }}
                whileHover={{ opacity: 1 }}
                controls
                controlsList="nofullscreen nodownload noremoteplayback noplaybackrate"
                src={item.src}
                autoPlay
                onAnimationStart={() => {
                    if (introStarted.current) return
                    onTweeningStart()
                    introStarted.current = true
                }}
                onAnimationComplete={() => {
                    if (introEnded.current) return
                    onTweeningEnd()
                    introEnded.current = true
                }}
            />
        </Fragment>
    )
}
