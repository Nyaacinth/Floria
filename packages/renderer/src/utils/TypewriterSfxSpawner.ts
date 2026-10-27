import onEnterSfxUrl from "../assets/sfx/on-enter.wav?url"
import onTypedSfxUrl from "../assets/sfx/on-typed.wav?url"

export class TypewriterSfxSpawner {
    static typeAudio = new Audio(onTypedSfxUrl)
    static enterAudio = new Audio(onEnterSfxUrl)

    static lastTimePlayTyped = 0
    static playTyped() {
        const now = Date.now()
        if (now - this.lastTimePlayTyped > 75 + Math.round(Math.random() * 100)) {
            void (this.typeAudio.cloneNode(false) as HTMLAudioElement).play()
            this.lastTimePlayTyped = now
        }
    }

    static lastTimePlayEnter = 0
    static playEnter() {
        const now = Date.now()
        if (now - this.lastTimePlayEnter > 75 + Math.round(Math.random() * 100)) {
            void (this.enterAudio.cloneNode(false) as HTMLAudioElement).play()
            this.lastTimePlayEnter = now
        }
    }
}
