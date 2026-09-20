import { useState } from "react"

import { parseBBCode } from "../utils/parseBBCode"
import type { StoryResourceResolver } from "./useInkIntegration"

export interface InkMessageItemText {
    type: "text"
    author?: string
    html: string
}

export interface InkMessageItemImage {
    type: "image"
    author?: string
    src: string
}

export interface InkMessageItemSound {
    type: "sound"
    author?: string
    src: string
}

export interface InkMessageItemVideo {
    type: "video"
    author?: string
    src: string
}

export type InkMessageItem = InkMessageItemText | InkMessageItemImage | InkMessageItemSound | InkMessageItemVideo

export type InkMessageType = InkMessageItem["type"]

export type InkMediaMessageType = Exclude<InkMessageType, "text">

export type InkMessageCollection = InkMessageItem[]

/**
 * The regex for media messages, should be used before the regex for common messages
 *
 * Matches `{ msgType: string; author?: string; message: string }`
 */
const mediaMessageRegex = /^`\[(?<msgType>[a-zA-Z_]+)\]\s((?<author>.{1,256}):\s)?"(?<value>[!-~]+)"\s*$/m
function matchAgainstMediaMessageRegex(value: string) {
    const groups = mediaMessageRegex.exec(value)?.groups
    if (groups === undefined) {
        return false
    } else {
        return {
            msgType: groups.msgType,
            author: groups.author,
            value: groups.value
        } as { msgType: string; author?: string; value: string }
    }
}

/**
 * The regex for common messages, should be used after the regex for media messages
 *
 * Matches `{ author?: string; message: string }`
 */
const commonMessageRegex = /^((?<author>[^`]{1,256}?):\s)?`?(?<message>[\s\S]+)$/m
function matchAgainstCommonMessageRegex(value: string) {
    const groups = commonMessageRegex.exec(value)?.groups
    if (groups === undefined) {
        return false
    } else {
        return {
            author: groups.author,
            message: groups.message
        } as { author?: string; message: string }
    }
}

/**
 * Parses ink lines of text with customized semantics
 *
 * Currently with media messages:
 *
 * ```plaintext
 * `[msgType] Optional Message Author: "values..."
 *
 * ``[etc] "Etc" <- This is plain text message with no author now
 * ```
 *
 * (Escape from media message matching with initial double backtick)
 *
 * ...and common messages:
 *
 * ```plaintext
 * Optional Message Author: Messages...
 *
 * `Not Author: Some text... <- This is plain text message with no author now
 * ```
 *
 * (Escape author matching with initial single backtick)
 *
 * @param msg The message to parse
 * @returns The parsed ink message item for message history insertion
 */
export function parseInkMessage(msg: string, resResolver: StoryResourceResolver): InkMessageItem {
    const mediaMessageMatched = matchAgainstMediaMessageRegex(msg)
    if (mediaMessageMatched !== false) {
        switch (mediaMessageMatched.msgType) {
            case "image":
            case "sound":
            case "video": {
                return {
                    type: mediaMessageMatched.msgType,
                    author: mediaMessageMatched.author,
                    src: resResolver(mediaMessageMatched.msgType, mediaMessageMatched.value)
                } as InkMessageItemImage | InkMessageItemSound
            }
            default: {
                throw new TypeError(
                    `Ink media message type "${mediaMessageMatched.msgType}" is not of a supported type`
                )
            }
        }
    }
    const commonMessageMatched = matchAgainstCommonMessageRegex(msg)
    if (commonMessageMatched !== false) {
        return {
            type: "text",
            author: commonMessageMatched.author,
            html: parseBBCode(commonMessageMatched.message.trim())
        } as InkMessageItemText
    }
    throw new TypeError(`Ink message cannot be parsed: "${JSON.stringify(msg)}"`)
}

/**
 * Creates a ink message collection (a.k.a. history) for later use, you should probably pass `handleNewMessage` to
 * `useInkStoryWrapper()`
 *
 * @returns The ink message collection, the new message handler and related functions
 */
export function useInkMessageCollection(resResolver: StoryResourceResolver) {
    const [collection, setCollection] = useState<InkMessageCollection>([])
    const addToCollection = (value: InkMessageItem) => {
        setCollection((coll) => [...coll, value])
    }
    const clearCollection = () => {
        setCollection([])
    }
    const handleNewMessage = (newText: string) => {
        try {
            addToCollection(parseInkMessage(newText, resResolver))
        } catch (e) {
            if (e instanceof Error) {
                alert(e.message)
                throw e
            } else {
                throw e
            }
        }
    }
    return {
        /** The ink message collection */
        messageCollection: collection,
        /** You should probably pass this to `useInkStoryWrapper()` */
        handleNewMessage,
        /** Clear the collection */
        clearMessageCollection: clearCollection,
        /** Write a new (external) message to the collection */
        pushMessageToCollection: addToCollection,
        /** The original setter for the ink message collection */
        setMessageCollection: setCollection
    }
}
