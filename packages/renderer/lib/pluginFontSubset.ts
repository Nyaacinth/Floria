// MIT License

// Copyright (c) 2023 kymok

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import subsetFont from "subset-font"

type LikelyOutputAsset = {
    type: "asset"
    source: string | Uint8Array
    [k: string]: any
}

type LikelyOutputChunk = {
    type: "chunk"
    code: string
    [k: string]: any
}

const isAssetInfo = (info: LikelyOutputAsset | LikelyOutputChunk): info is LikelyOutputAsset => {
    return info.type === "asset"
}

const extractCharacterSet = (info: LikelyOutputAsset | LikelyOutputChunk): Set<string> => {
    if (isAssetInfo(info)) {
        if (typeof info.source === "string") {
            return new Set(info.source)
        } else {
            return new Set()
        }
    }
    return new Set(info.code)
}

type PluginOptions = {
    verbose?: boolean
}

const defaultPluginOptions: PluginOptions = {
    verbose: false
}

async function generateBundle(
    _options: any,
    bundle: { [fileName: string]: LikelyOutputAsset | LikelyOutputChunk },
    pluginOptions: PluginOptions
) {
    // list files
    const fontFiles = Object.keys(bundle).filter((fileName) => {
        return fileName.match(/\.(ttf|woff|woff2)$/)
    })
    const sourceFiles = Object.keys(bundle).filter((fileName) => {
        return fileName.match(/\.(js|css|htm|html)$/)
    })
    if (pluginOptions?.verbose) {
        console.log("subsetting font")
        console.log("subset target:", fontFiles)
        console.log("subset based on:", sourceFiles)
    }

    // compute glyph set
    const glyphSet = sourceFiles
        .map((fileName) => (bundle[fileName] != null ? extractCharacterSet(bundle[fileName]) : new Set()))
        .reduce((acc, set) => new Set([...acc, ...set]), new Set<string>())
    const glyphSetString = Array.from(glyphSet).join("")
    if (pluginOptions?.verbose) {
        console.log("glyph set size:", glyphSet.size)
    }

    // subset fonts
    for (const fileName of fontFiles) {
        const font = bundle[fileName]
        if (font != null && isAssetInfo(font) && typeof font.source !== "string") {
            // Determine target format from filename
            const targetFormat = fileName.endsWith(".woff2")
                ? "woff2"
                : fileName.endsWith(".ttf")
                  ? "truetype"
                  : fileName.endsWith(".woff")
                    ? "woff"
                    : undefined
            const subset = await subsetFont(Buffer.from(font.source), glyphSetString, { targetFormat })
            font.source = new Uint8Array(subset)
        }
    }
}

export default function pluginFontSubset(options?: PluginOptions) {
    const pluginOptions = { ...defaultPluginOptions, ...options }
    return {
        name: "rolldown-plugin-font-subset",
        generateBundle: (_options: any, bundle: { [fileName: string]: LikelyOutputAsset | LikelyOutputChunk }) =>
            generateBundle(_options, bundle, pluginOptions)
    }
}
