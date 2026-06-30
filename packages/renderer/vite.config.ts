import { getChromeMajorVersion } from "@app/electron-versions"
import { fileURLToPath, URL } from "node:url"

import vue from "@vitejs/plugin-vue"
import vueDevTools from "vite-plugin-vue-devtools"

import { defineConfig } from "vite"

/** @see https://vite.dev/config/ */
export default defineConfig({
    build: {
        target: `chrome${getChromeMajorVersion()}`,
        emptyOutDir: true
    },
    plugins: [vue(), vueDevTools()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url))
        }
    }
})
