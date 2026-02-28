export type CSSColor =
    | `rgb(${number}, ${number}, ${number})`
    | `rgba(${number}, ${number}, ${number}, ${number})`
    | `#${string}`

export type ImageBackground = `img:${string}`

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

export function isImageBackground(value: unknown): value is ImageBackground {
    if (!(typeof value == "string")) return false
    if (value.startsWith("img:")) {
        return true
    } else {
        return false
    }
}
