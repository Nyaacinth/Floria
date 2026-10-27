import { useCallback, useEffect, useRef } from "react"

import { assert } from "../utils/assert"
import { StorySaveFile } from "../utils/StorySaveFile"
import { useInkMessageCollection } from "./useInkMessageCollection"
import { useInkStoryWrapper } from "./useInkStoryWrapper"

export type ResourceResolvables = "image" | "audio" | "video"

export type StoryResourceResolver = (type: ResourceResolvables, value: string) => string

export interface StoryDefinition {
    /** Exported json string from ink compiler */
    entry: string

    /** A table of image names and image URLs/URIs */
    images: {
        [key: string]: string
    }

    /** A table of audio names and audio URLs/URIs */
    audio: {
        [key: string]: string
    }

    /** A table of video names and video URLs/URIs */
    videos: {
        [key: string]: string
    }

    /** Optional properties, for story ui settings */
    props?: {
        typingInterval?: number
    }
}

function resolveSrc(storyDef: StoryDefinition, type: ResourceResolvables, value: string) {
    let ret: string
    switch (type) {
        case "image": {
            ret = storyDef.images[value]
            break
        }
        case "audio": {
            ret = storyDef.audio[value]
            break
        }
        case "video": {
            ret = storyDef.videos[value]
        }
    }
    if (ret == null) throw new RangeError(`Could not resolve type: "${type}", value: "${value}"`)
    return ret
}

export function useInkIntegration(storyDef: StoryDefinition, onInvoke: (actionName: string, value: string) => void) {
    const { handleNewMessage, clearMessageCollection, messageCollection, setMessageCollection, ...messages } =
        useInkMessageCollection((type, value) => resolveSrc(storyDef, type, value))
    const {
        story: unwrappedStory,
        markDirty: markStoryDirty,
        saveToStateJson,
        recoverFromStateJson,
        ...story
    } = useInkStoryWrapper(storyDef.entry, handleNewMessage)

    const onInvokeWrapped = useCallback(
        (actionName: string, value: string) => {
            assert(typeof actionName == "string", "actionName in EXTERNAL invoke(actionName, value) should be string")
            assert(typeof value == "string", "value in EXTERNAL invoke(actionName, value) should be string")
            onInvoke(actionName, value)
        },
        [onInvoke]
    )

    useEffect(() => {
        unwrappedStory.BindExternalFunction("invoke", onInvokeWrapped)

        return () => unwrappedStory.UnbindExternalFunction("invoke")
    }, [unwrappedStory, onInvokeWrapped])

    const prevStory = useRef(unwrappedStory)

    useEffect(() => {
        if (prevStory.current !== unwrappedStory) {
            clearMessageCollection()
            prevStory.current = unwrappedStory
        }
    }, [unwrappedStory, clearMessageCollection])

    const resolveResource = (type: ResourceResolvables, name: string) => resolveSrc(storyDef, type, name)

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
        resolveResource,
        resetCurrentStory,
        createSaveFile,
        loadSaveFile
    } satisfies ReturnType<typeof useInkMessageCollection> &
        ReturnType<typeof useInkStoryWrapper> & {
            [key: string]: any
        }
}
