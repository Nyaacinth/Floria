import { useEffect } from "react"

import { useInkMessageCollection, type InkMediaMessageType } from "./useInkMessageCollection"
import { useInkStoryRct } from "./useInkStoryRct"

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
    const messages = useInkMessageCollection((type, value) => resolveSrc(storyDef, type, value))
    const story = useInkStoryRct(storyDef.entry, messages.handleNewMessage)

    useEffect(() => {
        for (const [key, handler] of Object.entries(fnHandlers)) {
            story.bindExternalFunction(key, handler)
        }
        return () => {
            for (const key of Object.keys(fnHandlers)) {
                story.unbindExternalFunction(key)
            }
        }
    }, [story, fnHandlers])

    return {
        ...messages,
        ...story
    }
}
