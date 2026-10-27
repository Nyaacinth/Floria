import { useDebounceFn } from "@reactuses/core"
import { useEffect, useState, type RefObject } from "react"

export function useAutoScrollDown(elmRef: RefObject<HTMLElement | null>) {
    const [interrupted, setInterrupted] = useState(false)

    const { run: setBack } = useDebounceFn(() => {
        setInterrupted(false)
    }, 500)

    useEffect(() => {
        const cb = (e: WheelEvent) => {
            if (e.deltaY !== 0) {
                setInterrupted(true)

                setBack()
            }
        }
        window.addEventListener("wheel", cb, { passive: true })

        return () => window.removeEventListener("wheel", cb)
    }, [setBack])

    useEffect(() => {
        let animationId: number
        let lastTime = 0
        let abortSignal = false
        const autoScrollInterval = 12

        function autoScroll(currentTime: number) {
            if (abortSignal) return
            if (currentTime - lastTime < autoScrollInterval) {
                animationId = requestAnimationFrame(autoScroll)
                return
            }
            lastTime = currentTime

            if (interrupted) {
                animationId = requestAnimationFrame(autoScroll)
                return
            }
            if (elmRef.current) {
                const elm = elmRef.current
                const offsetHeight = elm.offsetHeight
                const containerScrollTop = elm.scrollTop
                const targetScrollTop = elm.scrollHeight - elm.clientHeight
                const diff = targetScrollTop - containerScrollTop
                if (diff !== 0 && diff < offsetHeight * 0.25) {
                    elm.scrollBy({
                        top: Math.max(0.3 * diff, 0.05),
                        behavior: "auto"
                    })
                }
            }

            animationId = requestAnimationFrame(autoScroll)
        }

        animationId = requestAnimationFrame(autoScroll)

        return () => {
            cancelAnimationFrame(animationId)
            abortSignal = true
        }
    }, [elmRef, interrupted])
}
