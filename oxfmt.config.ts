import { defineConfig } from "oxfmt"

export default defineConfig({
    sortImports: true,
    sortPackageJson: {
        sortScripts: true
    },
    printWidth: 120,
    tabWidth: 4,
    useTabs: false,
    semi: false,
    singleQuote: false,
    quoteProps: "as-needed",
    trailingComma: "none",
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: "always",
    htmlWhitespaceSensitivity: "ignore",
    vueIndentScriptAndStyle: true,
    endOfLine: "lf",
    embeddedLanguageFormatting: "auto",
    singleAttributePerLine: false,
    ignorePatterns: []
})
