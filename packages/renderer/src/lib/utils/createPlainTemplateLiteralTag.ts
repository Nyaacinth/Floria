export function createPlainTemplateLiteralTag({
    stringPrefix = "",
    injectionPrefix = "",
    injectionSuffix = "",
    stringSuffix = ""
} = {}) {
    return function (strings: TemplateStringsArray, ...substitutions: unknown[]) {
        return (
            stringPrefix +
            strings.reduce((prev, curr, i) => {
                const substitution = substitutions[i]
                return prev + (substitution ? `${curr}${injectionPrefix}${substitution}${injectionSuffix}` : curr)
            }, "") +
            stringSuffix
        )
    }
}
