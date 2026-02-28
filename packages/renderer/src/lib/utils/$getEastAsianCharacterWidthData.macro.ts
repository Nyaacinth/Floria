/// <reference lib="esnext" />
/// <reference types="@types/bun" />

if (!process.versions.bun) {
    throw new Error(
        "\n\nThis script is unable to run because it relies on Bun APIs " +
            "and this is probably not Bun's environment. (´_ゝ`)\n" +
            "If you believe this should not happen, please modify the script... " +
            "And yes, by doing so you will take all the risks involved.\n\n"
    )
}

import { existsSync } from "node:fs"
import { resolve as resolvePath } from "node:path"
import type { Simplify } from "type-fest"

export type EastAsianCharacterWidthData = {
    version: string
    ambiguous: number[]
    fullwidth: number[]
    halfwidth: number[]
    narrow: number[]
    wide: number[]
}

/**
 * [Macro] Construct EastAsianCharacterWidthData at compile-time
 * @description YOU SHOULD NEVER CALL THIS WITHOUT `{ type: "macro" }` IMPORT ATTRIBUTES
 * @copyright Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
 * @license MIT
 */
export async function $getEastAsianCharacterWidthData(): Promise<EastAsianCharacterWidthData> {
    const resolvedDatabasePath = resolvePath(__dirname, "../../../scripts-data/EastAsianWidth.txt")
    if (!existsSync(resolvedDatabasePath))
        throw new Error(
            'Error: could not find EastAsianWidth.txt, please run script "fetch-data:EastAsianWidth.txt" first.'
        )

    const categoryNames = new Map([
        ["A", "ambiguous"],
        ["F", "fullwidth"],
        ["H", "halfwidth"],
        ["N", "neutral"],
        ["Na", "narrow"],
        ["W", "wide"]
    ])

    const generatedCategories = ["ambiguous", "fullwidth", "halfwidth", "narrow", "wide"] as const // values of categoryNames

    function parse(input: string) {
        function simplifyRanges(
            // Reason: not my code, and, for simplicity
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ranges: any[],
            { separateTwoNumberRanges }: { separateTwoNumberRanges?: boolean } = {}
        ) {
            if (!Array.isArray(ranges)) {
                throw new TypeError(`Expected an array, got \`${typeof ranges}\`.`)
            }

            if (ranges.length === 0) {
                return []
            }

            // Normalize ranges
            ranges = ranges
                .map(([start, end]) => (start <= end ? [start, end] : [end, start]))
                .sort((a, b) => a[0] - b[0])

            const result = [ranges[0]]

            for (const [start, end] of ranges.slice(1)) {
                const [lastStart, lastEnd] = result.at(-1)

                if (start - 1 <= lastEnd) {
                    const newEnd = Math.max(end, lastEnd)
                    result[result.length - 1] = [lastStart, newEnd]
                } else {
                    result.push([start, end])
                }
            }

            if (separateTwoNumberRanges) {
                return result.flatMap(([start, end]) =>
                    start + 1 === end
                        ? [
                              [start, start],
                              [end, end]
                          ]
                        : [[start, end]]
                )
            }

            return result
        }

        const { version } = input.match(/EastAsianWidth-(?<version>.*)\.txt/)?.groups ?? {}

        if (!version) throw new Error("Unrecognised format of EastAsianWidth.txt")

        // Remove comments
        input = input.replaceAll(/\s*#.*$/gm, "").trim()

        const categories: Map<string, number[][]> = new Map(Array.from(categoryNames, ([, category]) => [category, []]))

        // Parse input and group by category
        for (const line of input.split("\n")) {
            /*
			https://www.unicode.org/Public/UCD/latest/ucd/EastAsianWidth.txt

			The format is two fields separated by a semicolon.
			Field 0: Unicode code point value or range of code point values
			Field 1: East_Asian_Width property, consisting of one of the following values:
							"A", "F", "H", "N", "Na", "W"
			*/
            const [range, eastAsianWidthProperty] = line.split(";").map((x) => x.trim())
            if (!range || !eastAsianWidthProperty) throw new Error("Unrecognised format of EastAsianWidth.txt")

            const category = categoryNames.get(eastAsianWidthProperty)
            if (!category) throw new Error("Unrecognised format of EastAsianWidth.txt")
            const [start, end = start] = range.split("..").map((part) => Number.parseInt(part, 16))
            // Reason: will be flattened later on
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            categories.get(category)?.push([start, end] as any)
        }

        for (const [category, ranges] of categories) {
            const simplified = simplifyRanges(ranges, { separateTwoNumberRanges: true })
            if (simplified.length <= 0) throw new Error(`Category "${category}": simplified.length <= 0`)
            categories.set(category, simplified)
        }

        const result: { version: string } & { [key in (typeof generatedCategories)[number]]?: number[] } = {
            version
        }

        generatedCategories.forEach((cate) => {
            const value = categories.get(cate)
            if (value === void 0 || value.length <= 0) throw new Error(`Load failed: ${cate}`)
            result[cate] = value.flat()
        })

        return result as Simplify<{ version: string } & { [key in (typeof generatedCategories)[number]]: number[] }>
    }

    const theFile = Bun.file(resolvedDatabasePath)

    return parse(await theFile.text())
}
