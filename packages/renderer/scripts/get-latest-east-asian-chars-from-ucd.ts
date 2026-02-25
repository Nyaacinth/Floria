if (!process.versions.bun) {
    throw new Error(
        "\n\nThis script is unable to run because it relies on Bun APIs " +
            "and this is probably not Bun's environment. (´_ゝ`)\n" +
            "If you believe this should not happen, please modify the script... " +
            "And yes, by doing so you will take all the risks involved.\n\n"
    )
}

import { existsSync, lstatSync, mkdirSync, rmSync } from "node:fs"
import { resolve as resolvePath } from "node:path"
import { createInterface as createReadlineInterface } from "node:readline"

const downloadDir = resolvePath(__dirname, "../scripts-data")

if (!existsSync(downloadDir)) {
    process.stdout.write(
        "\nQuestion from the script: " +
            'Directory "scripts-data" is not found, should we create it?\n' +
            `\nNew Directory Location: "${downloadDir}"\n\n` +
            "Please notice that this directory should be inside packages/renderer inside the Floria project,\n" +
            "and definitely should not be some random locations outside it, " +
            'especially not any of "C:\\scripts-data", "/scripts-data",\n' +
            '".../scripts/scripts-data", or "...\\scripts\\scripts-data", please review it carefully.\n\n' +
            ">>> Yes or No?\n>>> "
    )

    const readlineInterface = createReadlineInterface(process.stdin)

    for await (const answer of readlineInterface) {
        if (!["y", "Y", "yes", "Yes", "YES"].includes(answer)) {
            process.stdout.write("Aborting...\n")
            process.exit(1)
        }
        break
    }

    readlineInterface.close()

    mkdirSync(downloadDir)
}

const downloadPath = resolvePath(downloadDir, "./EastAsianWidth.txt")

if (!existsSync(downloadPath)) {
    process.stdout.write(
        "\nQuestion from the script: " +
            "Will create the file in and download to the specified path, proceed?\n" +
            `\nNew File Location: "${downloadPath}"\n\n` +
            ">>> Yes or No?\n>>> "
    )

    const readlineInterface = createReadlineInterface(process.stdin)

    for await (const answer of readlineInterface) {
        if (!["y", "Y", "yes", "Yes", "YES"].includes(answer)) {
            process.stdout.write("Aborting...\n")
            process.exit(1)
        }
        break
    }

    readlineInterface.close()
} else {
    if (lstatSync(downloadPath).isFile()) {
        rmSync(downloadPath)
    } else {
        throw new Error(`File is not file: "${downloadPath}"`)
    }
}

const content = await fetch("https://www.unicode.org/Public/UCD/latest/ucd/EastAsianWidth.txt").then((r) => r.text())

await Bun.write(downloadPath, content)
