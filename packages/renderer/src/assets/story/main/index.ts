import type { StoryDefinition } from "../../../hooks/useInkIntegration"

export default async function getMainStory(): Promise<StoryDefinition> {
    const entry = (await import("./entry.json?raw")).default

    return {
        entry,
        images: {},
        sounds: {},
        videos: {},
        music: {}
    }
}
