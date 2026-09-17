import { defineConfig } from "oxlint"

export default defineConfig({
    /* [!] root config implies typeAware & typeAware cannot be specified in folder-level configs */
    plugins: ["typescript", "oxc"]
})
