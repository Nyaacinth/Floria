import { useInterval } from "@reactuses/core"
import DOMPurify from "dompurify"
import { useEffect, useMemo, useState, type FunctionComponent } from "react"

export interface TypewriterProps {
    richtextHtml: string
    interval: number
    onTyped: () => void
    onTypingEnd: () => void
}

export const Typewriter: FunctionComponent<TypewriterProps> = ({ richtextHtml, interval, onTyped, onTypingEnd }) => {
    const htmlIterator = useMemo(() => createHtmlIterator(richtextHtml), [richtextHtml])
    const [currentHtml, setCurrentHtml] = useState("")
    const [done, setDone] = useState(false)

    useInterval(
        () => {
            console.log("!")
            if (done) return
            const result = htmlIterator.next()
            if (result.done) setDone(true)
            if (result.value) setCurrentHtml(result.value)
            onTyped()
        },
        done ? null : interval,
        { immediate: true }
    )

    useEffect(() => {
        if (done) onTypingEnd()
    }, [done, onTypingEnd])

    return <span dangerouslySetInnerHTML={{ __html: currentHtml }} />
}

/**
 * Create an iterator that iterates through given html string and automatically skip tags in the process
 *
 * @param html Html string, shall not contain non-text-centric or potentially malformed html
 */
function* createHtmlIterator(html: string) {
    let ptr = 0
    let lastYielded = -1

    yield "" // html.slice(0, 0)
    lastYielded = 0

    while (ptr < html.length) {
        if (html[ptr] === "<") {
            // skip opening, closing, self-closing, or invalid tags
            const end = html.indexOf(">", ptr)
            if (end === -1) {
                ptr = html.length
                break
            }
            ptr = end + 1
            continue
        }

        // consume next char
        ptr++

        // skip immediate closing tags
        while (ptr < html.length && html[ptr] === "<" && html[ptr + 1] === "/") {
            const end = html.indexOf(">", ptr)
            if (end === -1) {
                ptr = html.length
                break
            }
            ptr = end + 1
        }

        if (ptr !== lastYielded) {
            lastYielded = ptr
            yield DOMPurify.sanitize(html.slice(0, ptr))
        }
    }

    // guard: string ends with tags after the last visible char
    if (lastYielded !== html.length) {
        yield DOMPurify.sanitize(html.slice(0, html.length))
    }
}
