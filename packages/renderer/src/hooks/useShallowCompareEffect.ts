import { useCustomCompareEffect } from "@reactuses/core"

type uCCEParams = Parameters<typeof useCustomCompareEffect>

export function useShallowCompareEffect(effect: uCCEParams[0], deps: uCCEParams[1]) {
    return useCustomCompareEffect(effect, deps, (prev, curr) => {
        return prev.every((a, index) => {
            const b = curr[index]
            if (a === b) return true
            if (!(a instanceof Object) || !(b instanceof Object)) return false
            const keys = Object.keys(a)
            const length = keys.length
            for (let i = 0; i < length; i++) if (!(keys[i] in b)) return false
            for (let i = 0; i < length; i++)
                if ((a as Record<string, unknown>)[keys[i]] !== (b as Record<string, unknown>)[keys[i]]) return false
            return length === Object.keys(b).length
        })
    })
}
