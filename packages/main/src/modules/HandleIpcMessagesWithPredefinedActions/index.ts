import { ipcMain } from "electron"

import type { AppModule } from "../../AppModule"
import type { ModuleContext } from "../../ModuleContext"
import showAboutPageAction from "./showAboutPage"

const actions: Array<
    readonly [exposeName: string, callback: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any]
> = [showAboutPageAction]

class HandleIpcMessagesWithPredefinedActions implements AppModule {
    async enable({ app }: ModuleContext): Promise<void> {
        await app.whenReady()
        for (const [exposeName, callback] of actions) {
            ipcMain.handle(exposeName, callback)
        }
    }
}

export function handleIpcMessagesWithPredefinedActions() {
    return new HandleIpcMessagesWithPredefinedActions()
}
