import { useCallback, useEffect, useRef } from "react"
import { useShallowCompareEffect } from "react-use"

import type { StorySaveData } from "../utils/createStorySaveData"
import { createStorySaveData } from "../utils/createStorySaveData"
import type { InkMediaMessageType } from "./useInkMessageCollection"
import { useInkMessageCollection } from "./useInkMessageCollection"
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
        case "action": {
            throw new TypeError('Media message type "action" should not appear here')
        }
    }
    if (ret == null) throw new RangeError(`Could not resolve type: "${type}", value: "${value}"`)
    return ret
}

export function useInkIntegration(storyDef: StoryDefinition, fnHandlers: { [key: string]: (...args: any[]) => any }) {
    const { handleNewMessage, clearMessageCollection, messageCollection, setMessageCollection, ...messages } =
        useInkMessageCollection((type, value) => resolveSrc(storyDef, type, value))
    const {
        story: unwrappedStory,
        markDirty: markStoryDirty,
        saveToStateJson,
        recoverFromStateJson,
        ...story
    } = useInkStoryWrapper(storyDef.entry, handleNewMessage)

    useShallowCompareEffect(() => {
        const boundHandlers = { ...fnHandlers }
        for (const [key, handler] of Object.entries(boundHandlers)) {
            unwrappedStory.BindExternalFunction(key, handler)
        }

        return () => {
            for (const [key] of Object.entries(boundHandlers)) {
                unwrappedStory.UnbindExternalFunction(key)
            }
        }
    }, [{ story: unwrappedStory }, fnHandlers])

    const prevStory = useRef(unwrappedStory)

    useEffect(() => {
        if (prevStory.current !== unwrappedStory) {
            clearMessageCollection()
            prevStory.current = unwrappedStory
        }
    }, [unwrappedStory, clearMessageCollection])

    const resetCurrentStory = useCallback(() => {
        unwrappedStory.ResetCallstack()
        unwrappedStory.ResetGlobals()
        unwrappedStory.ResetState()
        markStoryDirty()
        clearMessageCollection()
    }, [unwrappedStory, clearMessageCollection, markStoryDirty])

    const createSaveData = useCallback(() => {
        const inkSavedState = saveToStateJson(false)
        const messages = structuredClone(messageCollection)
        return createStorySaveData(inkSavedState, messages)
    }, [messageCollection, saveToStateJson])

    const loadSaveData = useCallback(
        (data: StorySaveData) => {
            recoverFromStateJson(data.inkSavedState)
            setMessageCollection([...data.messages])
        },
        [setMessageCollection, recoverFromStateJson]
    )

    return {
        ...messages,
        handleNewMessage,
        clearMessageCollection,
        messageCollection,
        setMessageCollection,
        ...story,
        story: unwrappedStory,
        markDirty: markStoryDirty,
        saveToStateJson,
        recoverFromStateJson,
        resetCurrentStory,
        createSaveData,
        loadSaveData
    } satisfies ReturnType<typeof useInkMessageCollection> &
        ReturnType<typeof useInkStoryWrapper> & {
            resetCurrentStory: () => void
            createSaveData: () => StorySaveData
            loadSaveData: (data: StorySaveData) => void
        }
}
