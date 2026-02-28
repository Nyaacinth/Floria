/**
 * @file Sindre Sorhus's fast searcher adapted to this project's use
 * @copyright Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
 * @license MIT
 */

import { $getEastAsianCharacterWidthData } from "./$getEastAsianCharacterWidthData.macro" with { type: "macro" }

export const eastAsianCharacterWidthData = await $getEastAsianCharacterWidthData()

/**
 * Binary search on a sorted flat array of [start, end] pairs.
 * @param ranges - Flat array of inclusive [start, end] range pairs, e.g. [0, 5, 10, 20].
 * @param codePoint - The value to search for.
 * @returns Whether the value falls within any of the ranges.
 */
export const isInRange = (ranges: number[], codePoint: number) => {
    let low = 0
    let high = Math.floor(ranges.length / 2) - 1
    while (low <= high) {
        const mid = Math.floor((low + high) / 2)
        const i = mid * 2
        if (codePoint < (ranges[i] as number)) {
            high = mid - 1
        } else if (codePoint > (ranges[i + 1] as number)) {
            low = mid + 1
        } else {
            return true
        }
    }

    return false
}

const minimumAmbiguousCodePoint = eastAsianCharacterWidthData.ambiguous[0] as number
const maximumAmbiguousCodePoint = eastAsianCharacterWidthData.ambiguous.at(-1) as number
const minimumFullWidthCodePoint = eastAsianCharacterWidthData.fullwidth[0] as number
const maximumFullWidthCodePoint = eastAsianCharacterWidthData.fullwidth.at(-1) as number
const minimumHalfWidthCodePoint = eastAsianCharacterWidthData.halfwidth[0] as number
const maximumHalfWidthCodePoint = eastAsianCharacterWidthData.halfwidth.at(-1) as number
const minimumNarrowCodePoint = eastAsianCharacterWidthData.narrow[0] as number
const maximumNarrowCodePoint = eastAsianCharacterWidthData.narrow.at(-1) as number
const minimumWideCodePoint = eastAsianCharacterWidthData.wide[0] as number
const maximumWideCodePoint = eastAsianCharacterWidthData.wide.at(-1) as number

const commonCjkCodePoint = 0x4e_00
const [wideFastPathStart, wideFastPathEnd] = findWideFastPathRange(eastAsianCharacterWidthData.wide)

// Use a hot-path range so common `isWide` calls can skip binary search.
// The range containing U+4E00 covers common CJK ideographs;
// fallback to the largest range for resilience to Unicode table changes.
function findWideFastPathRange(ranges: number[]): [fastPathStart: number, fastPathEnd: number] {
    let fastPathStart = ranges[0] as number
    let fastPathEnd = ranges[1] as number

    for (let index = 0; index < ranges.length; index += 2) {
        const start = ranges[index] as number
        const end = ranges[index + 1] as number

        if (commonCjkCodePoint >= start && commonCjkCodePoint <= end) {
            return [start, end]
        }

        if (end - start > fastPathEnd - fastPathStart) {
            fastPathStart = start
            fastPathEnd = end
        }
    }

    return [fastPathStart, fastPathEnd]
}

export const isAmbiguous = (codePoint: number) => {
    if (codePoint < minimumAmbiguousCodePoint || codePoint > maximumAmbiguousCodePoint) {
        return false
    }

    return isInRange(eastAsianCharacterWidthData.ambiguous, codePoint)
}

export const isFullWidth = (codePoint: number) => {
    if (codePoint < minimumFullWidthCodePoint || codePoint > maximumFullWidthCodePoint) {
        return false
    }

    return isInRange(eastAsianCharacterWidthData.fullwidth, codePoint)
}

const isHalfWidth = (codePoint: number) => {
    if (codePoint < minimumHalfWidthCodePoint || codePoint > maximumHalfWidthCodePoint) {
        return false
    }

    return isInRange(eastAsianCharacterWidthData.halfwidth, codePoint)
}

const isNarrow = (codePoint: number) => {
    if (codePoint < minimumNarrowCodePoint || codePoint > maximumNarrowCodePoint) {
        return false
    }

    return isInRange(eastAsianCharacterWidthData.narrow, codePoint)
}

export const isWide = (codePoint: number) => {
    if (codePoint >= wideFastPathStart && codePoint <= wideFastPathEnd) {
        return true
    }

    if (codePoint < minimumWideCodePoint || codePoint > maximumWideCodePoint) {
        return false
    }

    return isInRange(eastAsianCharacterWidthData.wide, codePoint)
}

export function getCategory(codePoint: number) {
    if (isAmbiguous(codePoint)) {
        return "ambiguous"
    }

    if (isFullWidth(codePoint)) {
        return "fullwidth"
    }

    if (isHalfWidth(codePoint)) {
        return "halfwidth"
    }

    if (isNarrow(codePoint)) {
        return "narrow"
    }

    if (isWide(codePoint)) {
        return "wide"
    }

    return "neutral"
}

export function isFullWidthLike(codePoint: number) {
    return isFullWidth(codePoint) || isWide(codePoint)
}
