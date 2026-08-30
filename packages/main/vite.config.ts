import { ChildProcess, spawn } from "child_process"

import { getNodeMajorVersion } from "@app/electron-versions"
import electronPath from "electron"
import type { Plugin, ViteDevServer } from "vite"
import { defineConfig } from "vite"

/** @see https://vitejs.dev/config/ */
export default defineConfig({
    build: {
        ssr: true,
        sourcemap: "inline",
        outDir: "dist",
        assetsDir: ".",
        target: `node${getNodeMajorVersion()}`,
        lib: {
            entry: "src/index.ts",
            formats: ["es"]
        },
        rolldownOptions: {
            output: {
                entryFileNames: "[name].js"
            }
        },
        emptyOutDir: true,
        reportCompressedSize: false
    },
    plugins: [handleHotReload()]
})

/** Implement Electron app reload when some file was changed */
function handleHotReload(): Plugin {
    let electronApp: ChildProcess | null = null

    let rendererWatchServer: ViteDevServer | null = null

    return {
        name: "@app/main-process-hot-reload",

        config(config, env) {
            if (env.mode !== "development") {
                return
            }

            const rendererWatchServerProvider = config.plugins!.find(
                (p) => (p as Plugin).name === "@app/renderer-watch-server-provider"
            ) as Plugin
            if (!rendererWatchServerProvider) {
                throw new Error("Renderer watch server provider not found")
            }

            rendererWatchServer = rendererWatchServerProvider.api.provideRendererWatchServer()

            process.env.VITE_DEV_SERVER_URL = rendererWatchServer!.resolvedUrls!.local[0]

            return {
                build: {
                    watch: {}
                }
            }
        },

        writeBundle() {
            if (process.env.NODE_ENV !== "development") {
                return
            }

            /** Kill electron if a process already exists */
            if (electronApp !== null) {
                electronApp.removeListener("exit", process.exit)
                electronApp.kill("SIGINT")
                electronApp = null
            }

            /** Spawn a new electron process */
            electronApp = spawn(String(electronPath), ["--inspect", "."], {
                stdio: "inherit"
            })

            /** Stops the watch script when the application has been quit */
            electronApp.addListener("exit", process.exit)
        }
    }
}
