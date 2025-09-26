import { isTauri } from "@tauri-apps/api/core"
import { platform } from "@tauri-apps/plugin-os"

export function getDefaultTrafficLightPosition() {
    if (defaultPosition != notSetSymbol) return defaultPosition
    defaultPosition = evaluateDefaultTrafficLightPosition()
    return defaultPosition
}

const notSetSymbol = "::<not-set>::"

let defaultPosition = notSetSymbol

export function evaluateDefaultTrafficLightPosition() {
    const currentPlatform = isTauri() ? platform() : "web"
    switch (currentPlatform) {
        case "windows":
        case "linux":
            return "right"
        case "macos":
            return /* "left" */ "none"
        case "web":
            return "none"
    }
    console.warn(`Unsupported platform: "${currentPlatform}"; defaulting to right for window controls position`)
    return "right"
}
