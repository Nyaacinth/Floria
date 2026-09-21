import { useInterval, useMount } from "@reactuses/core"
import DOMPurify from "dompurify"
import type { FunctionComponent } from "react"
import { useEffect, useMemo, useRef, useState } from "react"

export interface TypewriterProps {
    richtextHtml: string
    interval: number
    onTypingStart: () => void
    onTyped: () => void
    onTypingEnd: () => void
}

const TypewriterUnkeyed: FunctionComponent<TypewriterProps> = ({
    richtextHtml,
    interval,
    onTypingStart,
    onTyped,
    onTypingEnd
}) => {
    const htmlIterator = useMemo(() => createHtmlIterator(DOMPurify.sanitize(richtextHtml)), [richtextHtml])
    const [currentHtml, setCurrentHtml] = useState("")
    const [done, setDone] = useState(false)
    const notifiedOnTypingEnd = useRef(false)

    useInterval(
        () => {
            if (done) return
            const result = htmlIterator.next()
            if (result.done) {
                setDone(true)
                return
            }
            if (result.value) setCurrentHtml(result.value)
            onTyped()
        },
        done ? null : interval,
        { immediate: true }
    )

    useMount(() => onTypingStart())

    useEffect(() => {
        if (done && !notifiedOnTypingEnd.current) {
            onTypingEnd()
            notifiedOnTypingEnd.current = true
        }
    }, [done, onTypingEnd])

    return <span dangerouslySetInnerHTML={{ __html: currentHtml }} />
}

export const Typewriter: FunctionComponent<TypewriterProps> = (props) => {
    return <TypewriterUnkeyed {...props} key={props.richtextHtml} />
}

/**
 * Create an iterator that walks given _sanitized_ html string and automatically skips tags
 *
 * @param html Sanitized text-centric html
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
