import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react-swc"
import macros from "unplugin-macros/vite"
import { defineConfig } from "vite"
import babel from "vite-plugin-babel"

export default defineConfig({
    plugins: [
        macros({
            attrs: { type: "macro" }
        }),
        babel({
            filter: /\.[jt]sx$/,
            babelConfig: {
                plugins: [
                    ["@babel/plugin-syntax-typescript", { isTSX: true }],
                    ["babel-plugin-react-compiler", {}]
                ]
            },
            loader: (fpath) => (fpath.endsWith(".tsx") ? "tsx" : "jsx")
        }),
        react(),
        tailwindcss()
    ]
})
