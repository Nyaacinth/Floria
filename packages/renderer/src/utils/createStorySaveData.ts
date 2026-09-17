import type { InkMessageCollection } from "../hooks/useInkMessageCollection"

export interface StorySaveData {
    inkSavedState: string
    messages: InkMessageCollection
}

export function createStorySaveData(inkSavedState: string, messages: InkMessageCollection) {
    return {
        inkSavedState,
        messages
    } as StorySaveData
}
