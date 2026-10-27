import { motion } from "motion/react"
import type { FunctionComponent } from "react"
import { Fragment, useRef } from "react"

import type { InkMessageItemImage, InkMessageItemAudio, InkMessageItemVideo } from "../../hooks/useInkMessageCollection"

export const ImageFrag: FunctionComponent<{
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
                className="w-[60%] rounded-sm border border-gray-500 object-contain object-left"
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

export const AudioFrag: FunctionComponent<{
    item: InkMessageItemAudio
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

export const VideoFrag: FunctionComponent<{
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
                className="w-[60%] rounded-sm border border-gray-500"
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
