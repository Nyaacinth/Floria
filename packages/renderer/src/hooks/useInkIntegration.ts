import { useCallback, useEffect, useRef } from "react"
import { useShallowCompareEffect } from "react-use"

import { useInkMessageCollection, type InkMediaMessageType } from "./useInkMessageCollection"
import { useInkStoryWrapper } from "./useInkStoryWrapper"

export interface StoryDefinition {
    /** Exported json string from ink compiler */
    entry: string

    /** A table of image names and image URLs/URIs */
    images: {
        [key: string]: string
    }

    /** A table of image names and image URLs/URIs */
    sounds: {
        [key: string]: string
    }
}

function resolveSrc(storyDef: StoryDefinition, type: InkMediaMessageType, value: string) {
    let ret: string
    switch (type) {
        case "image": {
            ret = storyDef.images[value]
            break
        }
        case "sound": {
            ret = storyDef.sounds[value]
            break
        }
    }
    if (ret == null) throw new RangeError(`Could not resolve type: "${type}", value: "${value}"`)
    return ret
}

export function useInkIntegration(storyDef: StoryDefinition, fnHandlers: { [key: string]: (...args: any[]) => any }) {
    const { handleNewMessage, clearMessageCollection, ...messages } = useInkMessageCollection((type, value) =>
        resolveSrc(storyDef, type, value)
    )
    const { story: unwrappedStory, ...story } = useInkStoryWrapper(storyDef.entry, handleNewMessage)

    const boundHandlers = useRef<{ [key: string]: (...args: any[]) => any }>({})

    useShallowCompareEffect(() => {
        for (const [key, handler] of Object.entries(fnHandlers)) {
            unwrappedStory.BindExternalFunction(key, handler)
        }
        boundHandlers.current = { ...fnHandlers }

        return () => {
            for (const [key] of Object.entries(boundHandlers.current)) {
                unwrappedStory.UnbindExternalFunction(key)
            }
            boundHandlers.current = {}
        }
    }, [{ story: unwrappedStory }, fnHandlers])

    const prevStory = useRef(unwrappedStory)

    useEffect(() => {
        if (prevStory.current !== unwrappedStory) {
            clearMessageCollection()
            prevStory.current = unwrappedStory
        }
    }, [unwrappedStory, clearMessageCollection])

    const resetStory = useCallback(() => {
        unwrappedStory.ResetCallstack()
        unwrappedStory.ResetGlobals()
        unwrappedStory.ResetState()
        clearMessageCollection()
    }, [unwrappedStory, clearMessageCollection])

    return {
        ...messages,
        handleNewMessage,
        clearMessageCollection,
        ...story,
        story: unwrappedStory,
        resetStory
    } satisfies ReturnType<typeof useInkMessageCollection> &
        ReturnType<typeof useInkStoryWrapper> & { resetStory: () => void }
}
