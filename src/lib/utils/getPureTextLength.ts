import DOMPurify from "dompurify"

export function getPureTextLength(html: string): number {
    html = DOMPurify.sanitize(html)
    const div = document.createElement("div")
    div.innerHTML = html
    const text = div.textContent || div.innerText || ""
    return text.length
}
