import { ipcRenderer } from "electron"

import { versions } from "./versions"

function send(channel: string, message: string) {
    return ipcRenderer.invoke(channel, message)
}

function showAboutPage() {
    return ipcRenderer.invoke("FloriaApp:showAboutPage")
}

export { send, showAboutPage, versions }
