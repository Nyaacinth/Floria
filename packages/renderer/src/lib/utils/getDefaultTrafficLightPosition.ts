import { isTauri } from "@tauri-apps/api/core"
import { platform } from "@tauri-apps/plugin-os"

export type TrafficLightPosition = "left" | "right" | "none"

export function getDefaultTrafficLightPosition(): TrafficLightPosition {
    if (defaultPosition != notSetSymbol) return defaultPosition as TrafficLightPosition
    defaultPosition = evaluateDefaultTrafficLightPosition()
    return defaultPosition as TrafficLightPosition
}

const notSetSymbol = "::<not-set>::"

let defaultPosition = notSetSymbol

function evaluateDefaultTrafficLightPosition(): TrafficLightPosition {
    const currentPlatform = isTauri() ? platform() : "web"
    switch (currentPlatform) {
        case "windows":
        case "linux":
            return "right"
        case "macos":
            return "left"
        case "web":
            return "none"
    }
    console.warn(`Unsupported platform: "${currentPlatform}"; defaulting to right for window controls position`)
    return "right"
}
