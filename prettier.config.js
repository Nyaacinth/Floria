/** @type {import("prettier").Config}*/
export default {
    printWidth: 120,
    tabWidth: 4,
    useTabs: false,
    semi: false,
    singleQuote: false,
    jsxSingleQuote: false,
    quoteProps: "as-needed",
    trailingComma: "none",
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: "always",
    htmlWhitespaceSensitivity: "ignore",
    endOfLine: "lf",
    embeddedLanguageFormatting: "auto",
    singleAttributePerLine: false,
    tailwindStylesheet: "./src/main.css",
    plugins: ["prettier-plugin-tailwindcss"]
}
