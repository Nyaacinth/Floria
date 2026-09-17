import { defineConfig } from "oxfmt"

import rootConfig from "../../oxfmt.config.ts"

export default defineConfig({
    ...rootConfig,
    sortTailwindcss: {
        stylesheet: "./src/index.css"
    }
})
