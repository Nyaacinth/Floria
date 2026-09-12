import reactPreset from "@bbob/preset-react"
import { render } from "@bbob/react"

/**
 * Parses a BBCode-contained string into React components
 *
 * @param text BBCode string, currently only supports the following tags: `[b]`, `[i]`, `[u]`, `[s]`, `[quote]`,
 *   `[code]`, `[style]`, `[color]`, `[size]`
 * @returns React components for rendering
 */
export function parseBBCode(text: string) {
    return render(text, reactPreset(), {
        onlyAllowTags: ["b", "i", "u", "s", "quote", "code", "style", "color", "size"]
    })
}
