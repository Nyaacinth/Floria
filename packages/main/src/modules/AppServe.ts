import serve from "electron-serve"
import path from "node:path"
import type { AppInitConfig } from "../AppInitConfig"
import { AppModule } from "../AppModule"

export class AppServe implements AppModule {
    private rendererPath?: string

    constructor(initConfig: AppInitConfig) {
        const rendererPath = initConfig.renderer
        if (!(rendererPath instanceof URL) && typeof rendererPath.path == "string") {
            this.rendererPath = rendererPath.path
            initConfig.renderer = new URL("app://-")
        } else if (import.meta.env.PROD) {
            console.warn("Renderer path is a URL, which is not supported in production mode")
        }
    }

    enable(): void {
        if (import.meta.env.DEV || this.rendererPath === undefined) return
        serve({ directory: path.dirname(this.rendererPath) })
    }
}

/**
 * Mutates the `initConfig` object if successfully enabled electron-serve, in that case it will be set to URL: `app://-`
 * Must be placed before any other module that requires `initConfig.renderer`.
 */
export function appServe(initConfig: AppInitConfig): AppModule {
    return new AppServe(initConfig)
}
