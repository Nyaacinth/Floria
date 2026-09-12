import { useCallback, useState } from "react"

import { parseBBCode } from "../utils/parseBBCode"

export interface InkMessageItemText {
    type: "text"
    author?: string
    elmTree: React.ReactNode
}

export interface InkMessageItemImage {
    type: "image"
    author?: string
    value: string
}

export interface InkMessageItemMotion {
    type: "motion"
    author?: string
    value: string
}

export interface InkMessageItemAudio {
    type: "audio"
    author?: string
    value: string
}

export type InkMessageItem = InkMessageItemText | InkMessageItemImage | InkMessageItemMotion | InkMessageItemAudio

export type InkMessageType = InkMessageItem["type"]

export type InkMessageCollection = InkMessageItem[]

/**
 * The regex for media messages, should be used before the regex for common messages
 *
 * Matches `{ msgType: string; author?: string; message: string }`
 */
const mediaMessageRegex = /^`\[(?<msgType>[a-zA-Z_]+)\]\s(<(?<author>.{1,256})>\s)?"(?<value>[!-~]+)"\s*$/m
function matchAgainstMediaMessageRegex(value: string) {
    const groups = mediaMessageRegex.exec(value)?.groups
    console.log(groups)
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
const commonMessageRegex = /^(<(?<author>.{1,256})>\s)?`?(?<message>[\s\S]+)$/m
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

export function parseInkMessage(msg: string): InkMessageItem {
    const mediaMessageMatched = matchAgainstMediaMessageRegex(msg)
    if (mediaMessageMatched !== false) {
        switch (mediaMessageMatched.msgType) {
            case "image":
            case "motion":
            case "audio": {
                return {
                    type: mediaMessageMatched.msgType,
                    author: mediaMessageMatched.author,
                    value: mediaMessageMatched.value
                } as InkMessageItemImage | InkMessageItemMotion | InkMessageItemAudio
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

export function useInkMessageCollection() {
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
                addToCollection(parseInkMessage(newText))
            } catch (e) {
                if (e instanceof TypeError) {
                    alert(e.message)
                    throw e
                } else {
                    throw e
                }
            }
        },
        [addToCollection]
    )
    return [collection, handleNewMessage, clearCollection, addToCollection, setCollection] as [
        messageCollection: InkMessageCollection,
        handleNewMessage: (message: string) => void,
        clear: () => void,
        pushMessage: (message: InkMessageItem) => void,
        setMessageCollection: React.Dispatch<React.SetStateAction<InkMessageCollection>>
    ]
}
