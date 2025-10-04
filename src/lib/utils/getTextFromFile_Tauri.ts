import { isTauri } from "@tauri-apps/api/core"
import { homeDir } from "@tauri-apps/api/path"
import { open } from "@tauri-apps/plugin-dialog"
import { readTextFile } from "@tauri-apps/plugin-fs"

export async function getTextFromFile_Tauri(filterName: string, extensions: string[]) {
    if (!isTauri()) {
        console.warn("Called Tauri-specific function but not in Tauri")
        return
    }

    const selectedPath = await open({
        multiple: false,
        directory: false,
        defaultPath: await homeDir(),
        filters: [
            {
                name: filterName,
                extensions: extensions
            }
        ]
    })

    if (!selectedPath) return

    const content = await readTextFile(selectedPath)

    return content
}
