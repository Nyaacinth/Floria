import { sveltekit } from "@sveltejs/kit/vite"
import tailwindcss from "@tailwindcss/vite"
import icons from "unplugin-icons/vite"
import macros from "unplugin-macros/vite"

import { defineConfig } from "vite"

export default defineConfig({
    plugins: [tailwindcss(), sveltekit(), icons({ compiler: "svelte" }), macros()]
})
