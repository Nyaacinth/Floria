export type CSSColor =
    | `rgb(${number}, ${number}, ${number})`
    | `rgba(${number}, ${number}, ${number}, ${number})`
    | `#${string}`

export function isCSSColor(value: unknown): value is CSSColor {
    if (!(typeof value == "string")) return false
    if (
        (value.startsWith("rgb(") && value.endsWith(")")) ||
        (value.startsWith("rgba(") && value.endsWith(")")) ||
        value.match(/^#[0-9A-Fa-f]+$/)
    ) {
        return true
    } else {
        return false
    }
}
