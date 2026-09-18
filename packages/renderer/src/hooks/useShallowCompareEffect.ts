import { useCustomCompareEffect } from "@reactuses/core"
import type { DependencyList, EffectCallback } from "react"

const isPlainObject = (val: unknown): val is Record<string, unknown> =>
    Object.prototype.toString.call(val) === "[object Object]"

function shallowEqual(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) return true

    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false
        return a.every((item, i) => Object.is(item, b[i]))
    }

    if (isPlainObject(a) && isPlainObject(b)) {
        const keysA = Object.keys(a)
        const keysB = Object.keys(b)
        if (keysA.length !== keysB.length) return false

        return keysA.every((key) => Object.prototype.hasOwnProperty.call(b, key) && Object.is(a[key], b[key]))
    }

    return false
}

export function useShallowCompareEffect(effect: EffectCallback, deps: DependencyList) {
    return useCustomCompareEffect(effect, deps, (prev, curr) => {
        if (prev.length !== curr.length) return false
        return prev.every((dep, i) => shallowEqual(dep, curr[i]))
    })
}
