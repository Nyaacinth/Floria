import { getChromeMajorVersion } from "@app/electron-versions"
import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import { defineConfig } from "vite"

import fontSubset from "./lib/pluginFontSubset.ts"

// https://vite.dev/config/
export default defineConfig({
    build: {
        target: `chrome${getChromeMajorVersion()}`,
        emptyOutDir: true
    },
    plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss(), fontSubset()]
})
