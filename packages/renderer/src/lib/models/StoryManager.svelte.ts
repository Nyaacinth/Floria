import { createLoggingPrefix } from "$lib/utils/createLoggerPrefix"
import { createPlainTemplateLiteralTag } from "$lib/utils/createPlainTemplateLiteralTag"
import type { StoryArchive } from "$lib/utils/createStoryArchive"
import { isCSSColor, type CSSColor } from "$lib/utils/isCSSColor"
import { isImageBackground } from "$lib/utils/isImageBackground"
import { createInkStory, type InkStory } from "./InkStory.svelte"

export type PlaySoundHandler = (url: URL) => void

export type ShakeHandler = () => void

export type { InkStoryManager }

export function createInkStoryManager(...args: ConstructorParameters<typeof InkStoryManager>) {
    return new InkStoryManager(...args)
}

class InkStoryManager {
    archive = $state.raw<StoryArchive | null>(null)
    story = $state.raw<InkStory | null>(null)
    history = $state<string[]>([])
    background = $state<CSSColor | URL>(InkStoryManager.defaultBackground)
    autoMode = $state(false)

    loadStoryArchive(archive: StoryArchive) {
        this.archive = archive
        this.story = createInkStory(archive.inkScript)
        this.history = []
        this.setupStoryIntegration()
        this.continueStory()
    }

    get canContinue() {
        if (!this.story) return false
        return this.story?.canContinue
    }

    continueStory() {
        if (!this.story) return
        if (!this.story.canContinue) return
        const newText = this.story.continue()
        if (newText) this.history.push(newText)
    }

    get currentChoices() {
        if (!this.story) return []
        return this.story.currentChoices
    }

    chooseChoice(index: number) {
        if (!this.story) return
        this.story.chooseChoiceIndex(index)
        this.continueStory()
    }

    // External function bindings
    private setupStoryIntegration() {
        if (!this.story) return

        this.story.bindExternalFunction("clear", () => {
            this.history = []
        })

        this.story.bindExternalFunction("playSound", (name) => {
            if (!this.story) return
            if (!this.archive) return
            if (!name || typeof name != "string") {
                console.warn(msg`Invalid sound name"`)
                this.history.push(">>> Invalid Sound Name Detected")
                return
            }
            const audioUrl = this.archive.audio[name]
            if (!audioUrl) {
                this.history.push(`>>> Sound Not Found: ${name}`)
                return
            }
            this.eventHandler_onPlaySound?.(audioUrl)
        })

        this.story.bindExternalFunction("shake", () => this.eventHandler_onShake?.())

        try {
            const setBackground = (value: unknown) => {
                if (!this.archive) return
                if (typeof value != "string" || value === "") return
                if (value === "default") {
                    this.background = InkStoryManager.defaultBackground
                    return
                }
                if (isCSSColor(value)) {
                    this.background = value
                    return
                }
                if (isImageBackground(value)) {
                    const name = value.substring(4).trim()
                    const image = this.archive.images[name]
                    if (image) {
                        this.background = image
                    } else {
                        this.history.push(`>>> Background Not Found: ${value}`)
                    }
                    return
                }
                this.history.push(`>>> Invalid Background: ${value}`)
            }
            setBackground(this.story.getVariableState("background"))
            this.story.addVariableObserver("background", (varName, value) => {
                if (varName !== "background") return
                setBackground(value)
            })
        } catch {
            this.background = InkStoryManager.defaultBackground
        }
    }

    saveState(): string | null {
        if (!this.story) return null
        return this.story.saveToStateJson() || null
    }

    loadState(json: string) {
        if (!this.story) return
        this.story.recoverFromStateJson(json)
        this.history.push(">>> Read from Save Files")
        const currentText = this.story.currentText
        if (currentText) this.history.push(currentText)
    }

    eventHandler_onPlaySound?: PlaySoundHandler

    onPlaySound(callback: PlaySoundHandler) {
        this.eventHandler_onPlaySound = callback
    }

    eventHandler_onShake?: ShakeHandler

    onShake(callback: ShakeHandler) {
        this.eventHandler_onShake = callback
    }

    static get defaultBackground() {
        return "#000000" as const
    }
}

const msg = createPlainTemplateLiteralTag({
    stringPrefix: createLoggingPrefix("Story Manager")
})
