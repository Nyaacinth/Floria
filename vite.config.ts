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
                const validLoaders = ["js", "ts", "jsx", "tsx"] as const
                const loader = extname(fpath).replace(/^\./, "")
                if (!(validLoaders as unknown as string[]).includes(loader))
                    throw new Error(`Unsupported file extension: ${loader}`)
                return loader as (typeof validLoaders)[number]
            }
        }),
        react(),
        tailwindcss()
    ]
})
