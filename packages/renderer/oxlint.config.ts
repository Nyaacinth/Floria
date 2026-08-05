import { defineConfig } from "oxlint"

export default defineConfig({
    options: { typeAware: true },
    plugins: ["react", "typescript", "oxc"],
    rules: {
        "react/rules-of-hooks": "error",
        "react/exhaustive-deps": "warn",
        "react/jsx-key": "warn",
        "react/only-export-components": ["warn", { allowConstantExport: true }]
    }
})
