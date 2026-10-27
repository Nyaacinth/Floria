import type { If, IsEqual, Tagged } from "type-fest"
import z from "zod"

import type { InkMessageCollection } from "../hooks/useInkMessageCollection"

interface StorySaveDataExpected {
    inkSavedState: string
    messages: InkMessageCollection
}

const StorySaveData = z.compile(
    z.object({
        inkSavedState: z.string(),
        messages: z.array(
            z.union([
                z.object({
                    type: z.literal("text"),
                    author: z.optional(z.string()),
                    html: z.string()
                }),
                z.object({
                    type: z.literal("image"),
                    author: z.optional(z.string()),
                    src: z.string()
                }),
                z.object({
                    type: z.literal("audio"),
                    author: z.optional(z.string()),
                    src: z.string()
                }),
                z.object({
                    type: z.literal("video"),
                    author: z.optional(z.string()),
                    src: z.string()
                })
            ])
        )
    })
)

type StorySaveData = If<
    IsEqual<StorySaveDataExpected, z.infer<typeof StorySaveData>>,
    z.infer<typeof StorySaveData>,
    Tagged<{}, "Go check StorySaveData, it is no longer the same as StorySaveDataExpected">
>

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

    private static parseData(value: unknown) {
        return StorySaveData.parse(value)
    }

    static fromData(data: StorySaveData) {
        return new StorySaveFile(StorySaveFile.parseData(data))
    }

    static fromJson(json: string) {
        return new StorySaveFile(StorySaveData.parse(JSON.parse(json)))
    }

    toJson() {
        return JSON.stringify(StorySaveData.parse(this.data))
    }
}
