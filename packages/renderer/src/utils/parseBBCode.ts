import reactPreset from "@bbob/preset-react"
import { render } from "@bbob/react"

export function parseBBCode(text: string) {
    return render(text, reactPreset(), {
        onlyAllowTags: ["b", "i", "u", "s", "quote", "code", "style", "color", "size"]
    })
}
