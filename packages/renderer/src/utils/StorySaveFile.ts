import typia from "typia"

import type { InkMessageCollection } from "../hooks/useInkMessageCollection"

interface StorySaveData {
    inkSavedState: string
    messages: InkMessageCollection
}

export class StorySaveFile implements StorySaveData {
    private data: StorySaveData

    get inkSavedState() {
        return this.data.inkSavedState
    }

    get messages() {
        return this.data.messages
    }

    private constructor({ inkSavedState, messages }: StorySaveData) {
        this.data = {
            inkSavedState,
            messages
        }
    }

    private static verify(value: unknown) {
        typia.assert<StorySaveData>(value)
    }

    static fromData(data: StorySaveData) {
        StorySaveFile.verify(data)
        return new StorySaveFile(data)
    }

    static fromJson(json: string) {
        const parsed = JSON.parse(json)
        StorySaveFile.verify(parsed)
        return new StorySaveFile(parsed)
    }

    toJson() {
        StorySaveFile.verify(this.data)
        return JSON.stringify(this.data)
    }
}

;(globalThis as any).TTTAAA = StorySaveFile
