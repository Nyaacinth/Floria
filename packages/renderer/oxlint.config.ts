import { defineConfig } from "oxlint"

export default defineConfig({
    /* [!] root config implies typeAware & typeAware cannot be specified in folder-level configs */
    plugins: ["react", "typescript", "oxc"],
    rules: {
        "react/rules-of-hooks": "error",
        "react/exhaustive-deps": "warn",
        "react/jsx-key": "warn",
        "react/only-export-components": ["warn", { allowConstantExport: true }]
    }
})
