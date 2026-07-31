import { defineConfig } from "oxlint"

export default defineConfig({
    plugins: ["react", "typescript", "oxc"],
    rules: {
        "typescript/adjacent-overload-signatures": "warn",
        "typescript/no-extra-non-null-assertion": "warn",
        "typescript/no-inferrable-types": "warn",
        "typescript/no-loss-of-precision": "warn",
        "typescript/no-misused-new": "warn",
        "typescript/no-this-alias": "warn",
        "typescript/prefer-as-const": "warn",
        "typescript/prefer-namespace-keyword": "warn",
        "typescript/ban-types": "warn",
        "react/rules-of-hooks": "error",
        "react/exhaustive-deps": "warn",
        "react/only-export-components": ["warn", { allowConstantExport: true }]
    }
})
