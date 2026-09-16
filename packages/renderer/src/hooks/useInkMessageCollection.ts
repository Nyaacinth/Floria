import { useCallback, useState } from "react"

import { parseBBCode } from "../utils/parseBBCode"

export interface InkMessageItemText {
    type: "text"
    author?: string
    elmTree: React.ReactNode[]
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

export type InkMessageItem = InkMessageItemText | InkMessageItemImage | InkMessageItemSound

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
const commonMessageRegex = /^((?<author>[^`]{1,256}):\s)?`?(?<message>[\s\S]+)$/m
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

export type MediaMessageSrcResolver = (type: InkMediaMessageType, value: string) => string

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
export function parseInkMessage(msg: string, srcResolver: MediaMessageSrcResolver): InkMessageItem {
    const mediaMessageMatched = matchAgainstMediaMessageRegex(msg)
    if (mediaMessageMatched !== false) {
        switch (mediaMessageMatched.msgType) {
            case "image":
            case "sound": {
                return {
                    type: mediaMessageMatched.msgType,
                    author: mediaMessageMatched.author,
                    src: srcResolver(mediaMessageMatched.msgType, mediaMessageMatched.value)
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
            elmTree: parseBBCode(commonMessageMatched.message.trim())
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
export function useInkMessageCollection(srcResolver: MediaMessageSrcResolver) {
    const [collection, setCollection] = useState<InkMessageCollection>([])
    const addToCollection = useCallback(
        (value: InkMessageItem) => {
            setCollection((coll) => [...coll, value])
        },
        [setCollection]
    )
    const clearCollection = useCallback(() => {
        setCollection([])
    }, [setCollection])
    const handleNewMessage = useCallback(
        (newText: string) => {
            try {
                addToCollection(parseInkMessage(newText, srcResolver))
            } catch (e) {
                if (e instanceof Error) {
                    alert(e.message)
                    throw e
                } else {
                    throw e
                }
            }
        },
        [addToCollection, srcResolver]
    )
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
