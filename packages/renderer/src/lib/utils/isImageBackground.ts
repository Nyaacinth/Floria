export type ImageBackground = `img:${string}`

export function isImageBackground(value: unknown): value is ImageBackground {
    if (!(typeof value == "string")) return false
    if (value.startsWith("img:")) {
        return true
    } else {
        return false
    }
}
