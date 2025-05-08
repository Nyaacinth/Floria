import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react-swc"
import { extname } from "node:path"
import macros from "unplugin-macros/vite"
import { defineConfig } from "vite"
import babel from "vite-plugin-babel"

export default defineConfig({
    plugins: [
        macros(),
        babel({
            filter: /\.[jt]sx?$/,
            babelConfig: {
                plugins: [
                    ["@babel/plugin-syntax-typescript", { isTSX: true }],
                    ["babel-plugin-react-compiler", {}]
                ]
            },
            loader: (fpath) => {
                return extname(fpath).replace(/^\./, "") as "js" | "ts" | "jsx" | "tsx"
            }
        }),
        react(),
        tailwindcss()
    ]
})
