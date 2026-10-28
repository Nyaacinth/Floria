import path from "node:path"

import serve from "electron-serve"

import type { AppInitConfig } from "../AppInitConfig"
import type { AppModule } from "../AppModule"

export class AppServe implements AppModule {
    private rendererPath?: string
    private hostname?: string

    constructor(initConfig: AppInitConfig) {
        const rendererPath = initConfig.renderer
        if (!(rendererPath instanceof URL) && typeof rendererPath.path == "string") {
            this.rendererPath = rendererPath.path
            this.hostname = "floria-app"
            initConfig.renderer = new URL(`app://${this.hostname}`)
        } else if (import.meta.env.PROD) {
            console.warn("Renderer path is a URL, which is not supported in production mode")
        }
    }

    enable(): void {
        if (import.meta.env.DEV || this.rendererPath === undefined || this.hostname === undefined) return
        serve({
            directory: path.dirname(this.rendererPath),
            scheme: "app",
            hostname: this.hostname
        })
    }
}

/**
 * Mutates the `initConfig` object if successfully enabled electron-serve, in that case it will be set to URL:
 * `app://<randomhostname>`
 *
 * Must be placed before any other module that requires `initConfig.renderer`.
 */
export function serveStatics(initConfig: AppInitConfig): AppModule {
    return new AppServe(initConfig)
}
