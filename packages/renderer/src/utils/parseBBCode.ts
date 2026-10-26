import bbobHtml from "@bbob/html"
import htmlPreset from "@bbob/preset-html5"

/**
 * Parses a BBCode-contained string into React components
 *
 * @param text BBCode string, currently only supports the following tags: `[b]`, `[i]`, `[u]`, `[s]`, `[quote]`,
 *   `[code]`, `[style]`, `[color]`, `[size]`
 * @returns Parsed HTML string
 */
export function parseBBCode(text: string) {
    const onlyTagsEscaped = text.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    return bbobHtml(onlyTagsEscaped, htmlPreset(), {
        onlyAllowTags: ["b", "i", "u", "s", "quote", "code", "style", "color", "size"]
    })
}
