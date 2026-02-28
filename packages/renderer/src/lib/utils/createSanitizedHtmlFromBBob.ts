import bbobHTML from "@bbob/html"
import presetHTML5 from "@bbob/preset-html5"
import DOMPurify from "dompurify"

export function createSanitizedHtmlFromBBob(stringWithCode: string) {
    return DOMPurify.sanitize(bbobHTML(stringWithCode, presetHTML5()), { USE_PROFILES: { html: true } })
}
