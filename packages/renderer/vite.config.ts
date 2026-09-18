import { resolve } from "node:path"

import { getChromeMajorVersion } from "@app/electron-versions"
import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"
import ttsc from "@ttsc/unplugin/vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
    build: {
        target: `chrome${getChromeMajorVersion()}`,
        emptyOutDir: true
    },
    plugins: [
        react(),
        babel({ presets: [reactCompilerPreset()] }),
        ttsc({ project: resolve(import.meta.dirname, "./ttsc.tsconfig.json") }),
        tailwindcss()
    ]
})
