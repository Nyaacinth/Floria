/** @type {import('prettier').Config & import("prettier-plugin-svelte").PluginConfig & import('prettier-plugin-tailwindcss').PluginOptions} */
export default {
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
    endOfLine: "lf",
    embeddedLanguageFormatting: "auto",
    singleAttributePerLine: false,
    plugins: ["prettier-plugin-svelte", "prettier-plugin-tailwindcss"],
    tailwindStylesheet: "./src/app.css",
    overrides: [
        {
            files: "*.svelte",
            options: {
                parser: "svelte"
            }
        }
    ]
}
