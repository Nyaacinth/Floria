import { isTauri } from "@tauri-apps/api/core"
import { message as tauriMessage } from "@tauri-apps/plugin-dialog"

export function alert_cx(message: unknown) {
    if (isTauri()) {
        tauriMessage(Object.prototype.toString.call(message))
    } else {
        alert(message)
    }
}
