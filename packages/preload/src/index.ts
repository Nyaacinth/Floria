import { ipcRenderer } from "electron"
import { versions } from "./versions"

function send(channel: string, message: string) {
    return ipcRenderer.invoke(channel, message)
}

export { send, versions }
