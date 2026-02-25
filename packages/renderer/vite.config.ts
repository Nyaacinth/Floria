import { getChromeMajorVersion } from "@app/electron-versions"
import { fileURLToPath, URL } from "node:url"

import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import macros from "unplugin-macros/vite"
import vueDevTools from "vite-plugin-vue-devtools"

import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
    build: {
        target: `chrome${getChromeMajorVersion()}`,
        emptyOutDir: true
    },
    plugins: [vue(), vueDevTools(), tailwindcss(), macros()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url))
        }
    }
})
