import { useMount } from "@reactuses/core"
import { motion } from "motion/react"
import type { FunctionComponent } from "react"
import { Fragment, Suspense, use, useRef, useState } from "react"

import getMainStory from "../../assets/story/main"
import { IconMaterialSymbolRestartAltRounded } from "../../components/IconMaterialSymbolRestartAltRounded"
import { Typewriter } from "../../components/Typewriter"
import { useInkIntegration } from "../../hooks/useInkIntegration"
import type { InkMessageItemImage, InkMessageItemSound, InkMessageItemVideo } from "../../hooks/useInkMessageCollection"

import styles from "./index.module.css"

export const Splash: FunctionComponent = () => {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <SplashAsync />
        </Suspense>
    )
}

const LoadingFallback: FunctionComponent = () => {
    return (
        <div className="relative h-full w-full bg-mauve-600">
            <p className="absolute bottom-10 left-10 font-mono text-3xl font-extrabold text-white opacity-15">
                Loading...
            </p>
        </div>
    )
}

const mainStoryHandle = getMainStory()

const SplashAsync: FunctionComponent = () => {
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

    return (
        <div className={`h-full w-full overflow-x-hidden overflow-y-hidden bg-mauve-600 ${styles.setDefaultFonts}`}>
            <div className="absolute top-8 right-16 h-[calc(100%-4rem)] w-[calc(100%-8rem)]">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 100, transition: { duration: 0.1 } }}
                    className={`scrollbar-thin overflow-x-hidden overflow-y-auto ${styles.stampContainer}`}
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
                                            onTyped={() => {}}
                                            onTypingEnd={handleFragTweeningEnd}
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
                </motion.div>
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
