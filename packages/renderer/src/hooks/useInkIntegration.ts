import { useEffect, useRef } from "react"

import { StorySaveFile } from "../utils/StorySaveFile"
import type { InkMediaMessageType } from "./useInkMessageCollection"
import { useInkMessageCollection } from "./useInkMessageCollection"
import { useInkStoryWrapper } from "./useInkStoryWrapper"
import { useShallowCompareEffect } from "./useShallowCompareEffect"

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

    const resetCurrentStory = () => {
        unwrappedStory.ResetCallstack()
        unwrappedStory.ResetGlobals()
        unwrappedStory.ResetState()
        markStoryDirty()
        clearMessageCollection()
    }

    const createSaveFile = () => {
        const inkSavedState = saveToStateJson(false)
        const messages = structuredClone(messageCollection)
        return StorySaveFile.fromData({ inkSavedState, messages })
    }

    const loadSaveFile = (data: StorySaveFile) => {
        recoverFromStateJson(data.inkSavedState)
        setMessageCollection(structuredClone(data.messages))
    }

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
        createSaveFile,
        loadSaveFile
    } satisfies ReturnType<typeof useInkMessageCollection> &
        ReturnType<typeof useInkStoryWrapper> & {
            resetCurrentStory: () => void
            createSaveFile: () => StorySaveFile
            loadSaveFile: (data: StorySaveFile) => void
        }
}
