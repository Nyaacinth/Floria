import { BrowserWindow } from "electron"
import type { AppInitConfig } from "../AppInitConfig"
import type { AppModule } from "../AppModule"
import { ModuleContext } from "../ModuleContext"

class WindowManager implements AppModule {
    private readonly preload: { path: string }
    private readonly renderer: { path: string } | URL
    private readonly withDevTools

    constructor({ initConfig, withDevTools = false }: { initConfig: AppInitConfig; withDevTools?: boolean }) {
        this.preload = initConfig.preload
        this.renderer = initConfig.renderer
        this.withDevTools = withDevTools
    }

    async enable({ app }: ModuleContext): Promise<void> {
        await app.whenReady()
        await this.restoreOrCreateWindow(true)
        app.on("second-instance", () => this.restoreOrCreateWindow(true))
        app.on("activate", () => this.restoreOrCreateWindow(true))
    }

    async createWindow(): Promise<BrowserWindow> {
        const browserWindow = new BrowserWindow({
            show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: false, // Sandbox disabled due to Node.js API dependency
                webviewTag: false, // The webview tag is not recommended. Consider alternatives like an iframe or Electron's BrowserView. @see https://www.electronjs.org/docs/latest/api/webview-tag#warning
                preload: this.preload.path
            }
        })

        if (this.renderer instanceof URL) {
            await browserWindow.loadURL(this.renderer.href)
        } else {
            await browserWindow.loadFile(this.renderer.path)
        }

        return browserWindow
    }

    async restoreOrCreateWindow(show = false) {
        let window = BrowserWindow.getAllWindows().find((w) => !w.isDestroyed())

        if (window === undefined) {
            window = await this.createWindow()
        }

        if (!show) {
            return window
        }

        if (window.isMinimized()) {
            window.restore()
        }

        window.show()

        if (this.withDevTools) {
            window.webContents.openDevTools({ mode: "detach" })
        }

        window.focus()

        return window
    }
}

export function createWindowManagerModule(...args: ConstructorParameters<typeof WindowManager>) {
    return new WindowManager(...args)
}
