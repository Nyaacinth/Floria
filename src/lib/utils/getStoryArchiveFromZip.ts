import { homeDir } from "@tauri-apps/api/path"
import { open } from "@tauri-apps/plugin-dialog"
import { readFile } from "@tauri-apps/plugin-fs"
import JSZip from "jszip"

export type StoryArchive = {
    storyContent: string
    images: {
        [imageName: string]: {
            data: string
            prefix: string
        }
    }
    audio: {
        [audioName: string]: {
            data: string
            prefix: string
        }
    }
}

export async function getStoryArchiveFromZip(zipData: unknown) {
    const zip = await JSZip.loadAsync(zipData)

    const files = new Map<string, string>() // key: fileName, value: base64

    let storyContent: string | undefined = undefined

    const promises: Promise<void>[] = []
    zip.forEach((path, entry) => {
        if (entry.dir) return // continue
        const filename = entry.name
        if (entry.name === "main.json") {
            const promise = entry.async("text").then((value) => {
                storyContent = value
            })
            promises.push(promise)
        } else {
            const promise = entry.async("base64").then((value) => {
                files.set(filename, value)
            })
            promises.push(promise)
        }
    })
    await Promise.all(promises)

    // known types *.json *.jpg *.mp3

    const storyArchive: {
        storyContent?: string
        images: {
            [imageName: string]: {
                data: string
                prefix: string
            }
        }
        audio: {
            [audioName: string]: {
                data: string
                prefix: string
            }
        }
    } = {
        storyContent,
        images: {},
        audio: {}
    }

    files.forEach((base64, filename) => {
        if (filename.endsWith(".jpg")) {
            storyArchive.images[filename.substring(0, filename.length - 4)] = {
                data: base64,
                prefix: "data:image/jpeg;base64,"
            }
        } else if (filename.endsWith(".mp3")) {
            storyArchive.audio[filename.substring(0, filename.length - 4)] = {
                data: base64,
                prefix: "data:audio/mpeg;base64,"
            }
        }
    })

    if (storyArchive.storyContent === undefined) {
        throw new Error("Failed to parse main.json")
    }

    return storyArchive as StoryArchive
}

export async function getStoryArchiveFromZip_File(file: File) {
    return await getStoryArchiveFromZip(file)
}

export async function getStoryArchiveFromZip_Tauri() {
    const selectedPath = await open({
        multiple: false,
        directory: false,
        defaultPath: await homeDir(),
        filters: [
            {
                name: "Story Archive",
                extensions: ["zip"]
            }
        ]
    })

    if (!selectedPath) return

    const content = await readFile(selectedPath)

    return await getStoryArchiveFromZip(content)
}

export async function getStoryArchiveFromZip_Fetch(url: string) {
    const content = await fetch(url).then((value) => value.arrayBuffer())

    return await getStoryArchiveFromZip(content)
}
