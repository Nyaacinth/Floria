import { isTauri } from "@tauri-apps/api/core"
import { homeDir } from "@tauri-apps/api/path"
import { save } from "@tauri-apps/plugin-dialog"
import { writeTextFile } from "@tauri-apps/plugin-fs"

function downloadTextFile_Browser(filename: string, text: string) {
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text))
    element.setAttribute("download", filename)

    element.style.display = "none"

    element.click()
}

async function downloadTextFile_Tauri(filename: string, text: string) {
    const selectedPath = await save({
        defaultPath: await homeDir(),
        filters: [
            {
                name: filename.split(".").shift() ?? "Invalid",
                extensions: [filename.split(".").pop() ?? "bin"]
            }
        ]
    })

    if (!selectedPath) return

    writeTextFile(selectedPath, text)
}

export function downloadTextFile(filename: string, text: string) {
    if (isTauri()) {
        downloadTextFile_Tauri(filename, text)
    } else {
        downloadTextFile_Browser(filename, text)
    }
}
