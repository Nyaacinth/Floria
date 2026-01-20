import { AppModule } from "../AppModule"
import { ModuleContext } from "../ModuleContext"

export type ExtensionReference = ExtensionInstaller.ExtensionReference

export interface ChromeDevToolsExtensionInstallOptions extends ExtensionInstaller.ExtensionOptions {
    installEvenInProduction?: boolean
}

export class ChromeDevToolsExtension implements AppModule {
    private readonly options?: ExtensionInstaller.ExtensionOptions
    private readonly shouldInstall: boolean

    constructor(
        private readonly extensions:
            | ExtensionInstaller.ExtensionReference
            | string
            | (ExtensionInstaller.ExtensionReference | string)[],
        options?: ChromeDevToolsExtensionInstallOptions
    ) {
        this.options = options
        this.shouldInstall = options?.installEvenInProduction || import.meta.env.DEV
    }

    async enable({ app }: ModuleContext): Promise<void> {
        if (!this.shouldInstall) return
        await app.whenReady()
        await ExtensionInstaller.installExtension(this.extensions, this.options)
    }
}

export function chromeDevToolsExtension(...args: ConstructorParameters<typeof ChromeDevToolsExtension>) {
    return new ChromeDevToolsExtension(...args)
}

export const EMBER_INSPECTOR: ExtensionReference = {
    id: "bmdblncegkenkacieihfhpjfppoconhi"
}
export const REACT_DEVELOPER_TOOLS: ExtensionReference = {
    id: "fmkadmapgofadopljbjfkapdkoienihi"
}
export const BACKBONE_DEBUGGER: ExtensionReference = {
    id: "bhljhndlimiafopmmhjlgfpnnchjjbhd"
}
export const JQUERY_DEBUGGER: ExtensionReference = {
    id: "dbhhnnnpaeobfddmlalhnehgclcmjimi"
}
export const VUEJS_DEVTOOLS: ExtensionReference = {
    id: "nhdogjmejiglipccpnnnanhbledajbpd"
}
export const VUEJS_DEVTOOLS_BETA: ExtensionReference = {
    id: "ljjemllljcmogpfapbkkighbhhppjdbg"
}
export const REDUX_DEVTOOLS: ExtensionReference = {
    id: "lmhkpmbekcpmknklioeibfkpmmfibljd"
}
export const MOBX_DEVTOOLS: ExtensionReference = {
    id: "pfgnfdagidkfgccljigdamigbcnndkod"
}

//#region electron-extension-installer by JonLuca De Caro

/**
 * @description Originated from https://github.com/jonluca/electron-extension-installer
 * Fixed Manifest V3 Compatibility
 *
 * @license MIT
 *
 * The MIT License (MIT)
 * Copyright (c) 2023-present JonLuca De Caro
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to
 * do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
 * IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import type { LoadExtensionOptions, Session } from "electron"
import { app, net, session } from "electron"
import fs from "fs"
import fsp from "fs/promises"
import jszip from "jszip"
import path from "path"

namespace ExtensionInstaller {
    namespace Unzip {
        // Credits for the original function go to Rob--W
        // https://github.com/Rob--W/crxviewer/blob/master/src/lib/crx-to-zip.js
        function calcLength(a: number, b: number, c: number, d: number) {
            let length = 0

            length += a << 0
            length += b << 8
            length += c << 16
            length += (d << 24) >>> 0
            return length
        }

        function crxToZip(buf: Buffer) {
            // 50 4b 03 04
            // This is actually a zip file
            if (buf[0] === 80 && buf[1] === 75 && buf[2] === 3 && buf[3] === 4) {
                return buf
            }

            // 43 72 32 34 (Cr24)
            if (buf[0] !== 67 || buf[1] !== 114 || buf[2] !== 50 || buf[3] !== 52) {
                throw new Error("Invalid header: Does not start with Cr24")
            }

            // 02 00 00 00
            // or
            // 03 00 00 00
            const isV3 = buf[4] === 3
            const isV2 = buf[4] === 2

            if ((!isV2 && !isV3) || buf[5] || buf[6] || buf[7]) {
                throw new Error("Unexpected crx format version number.")
            }

            if (isV2) {
                const publicKeyLength = calcLength(buf[8], buf[9], buf[10], buf[11])
                const signatureLength = calcLength(buf[12], buf[13], buf[14], buf[15])

                // 16 = Magic number (4), CRX format version (4), lengths (2x4)
                const zipStartOffset = 16 + publicKeyLength + signatureLength

                return buf.subarray(zipStartOffset, buf.length)
            }
            // v3 format has header size and then header
            const headerSize = calcLength(buf[8], buf[9], buf[10], buf[11])
            const zipStartOffset = 12 + headerSize

            return buf.subarray(zipStartOffset, buf.length)
        }

        async function ensureDir(dirPath: string) {
            try {
                await fsp.mkdir(dirPath, { recursive: true })
            } catch (error) {
                // If the directory already exists, that's fine
                if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
                    throw error
                }
            }
        }

        export async function unzip(crxFilePath: string, destination: string) {
            const filePath = path.resolve(crxFilePath)
            const extname = path.extname(crxFilePath)
            const basename = path.basename(crxFilePath, extname)
            const dirname = path.dirname(crxFilePath)

            destination = destination || path.resolve(dirname, basename)
            const buf = await fsp.readFile(filePath)
            const res = await jszip.loadAsync(crxToZip(buf))
            const { files } = res
            const zipFileKeys = Object.keys(files)

            return Promise.all(
                zipFileKeys.map(async (filename) => {
                    const isFile = !files[filename].dir
                    const fullPath = path.join(destination, filename)
                    const directory = (isFile && path.dirname(fullPath)) || fullPath
                    const content = await files[filename].async("nodebuffer")

                    await ensureDir(directory)
                    if (isFile) {
                        await fsp.writeFile(fullPath, content)
                    }
                })
            )
        }
    }

    namespace Utils {
        export const getExtensionPath = () => {
            const savePath = app.getPath("userData")
            return path.resolve(`${savePath}/chrome-extensions`)
        }

        export const fetchCrxFile = async (from: string, to: string): Promise<void> => {
            return new Promise<void>((resolve, reject) => {
                const request = net.request(from)

                request.on("response", (response) => {
                    if (response.statusCode !== 200) {
                        reject(new Error(`Failed to download file. Status code: ${response.statusCode}`))
                        return
                    }

                    const fileStream = fs.createWriteStream(to)
                    // @ts-ignore - pipe exists here, not sure why the type is wrong
                    response.pipe(fileStream)

                    fileStream.on("finish", () => {
                        fileStream.close()
                        resolve()
                    })

                    fileStream.on("error", (err) => {
                        fs.unlink(to, () => reject(err))
                    })

                    response.on("error", (err: any) => {
                        fs.unlink(to, () => reject(err))
                    })
                })

                request.on("error", (err) => {
                    reject(err)
                })

                request.end()
            })
        }
        export const changePermissions = (dir: string, mode: string | number) => {
            const files = fs.readdirSync(dir)
            files.forEach((file) => {
                const filePath = path.join(dir, file)
                fs.chmodSync(filePath, parseInt(`${mode}`, 8))
                if (fs.statSync(filePath).isDirectory()) {
                    changePermissions(filePath, mode)
                }
            })
        }
        const getIDMapPath = () => path.resolve(getExtensionPath(), "IDMap.json")
        export const getIdMap = () => {
            if (fs.existsSync(getIDMapPath())) {
                try {
                    return JSON.parse(fs.readFileSync(getIDMapPath(), "utf8"))
                } catch (err) {
                    console.error("electron-devtools-assembler: Invalid JSON present in the IDMap file")
                }
            }
            return {}
        }
    }

    namespace Index {
        const { unzip } = Unzip
        const { changePermissions, fetchCrxFile, getExtensionPath, getIdMap } = Utils

        async function ensureDir(dirPath: string) {
            try {
                await fsp.mkdir(dirPath, { recursive: true })
            } catch (error) {
                // If the directory already exists, that's fine
                if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
                    throw error
                }
            }
        }

        async function exists(filePath: string): Promise<boolean> {
            try {
                await fsp.access(filePath)
                return true
            } catch {
                return false
            }
        }

        async function downloadChromeExtension(
            chromeStoreID: string,
            forceDownload: boolean,
            attempts = 5
        ): Promise<string> {
            try {
                const extensionsStore = getExtensionPath()
                await ensureDir(extensionsStore)
                const extensionFolder = path.resolve(`${extensionsStore}/${chromeStoreID}`)
                const extensionDirExists = await exists(extensionFolder)
                if (!extensionDirExists || forceDownload) {
                    if (extensionDirExists) {
                        await fsp.rm(extensionFolder, { recursive: true, force: true })
                    }
                    const chromeVersion = process.versions.chrome || 32
                    let fileURL = `https://clients2.google.com/service/update2/crx?response=redirect&acceptformat=crx2,crx3&x=id%3D${chromeStoreID}%26uc&prodversion=${chromeVersion}`

                    const filePath = path.resolve(`${extensionFolder}.crx`)
                    await fetchCrxFile(fileURL, filePath)

                    try {
                        await unzip(filePath, extensionFolder)
                        changePermissions(extensionFolder, 755)
                        return extensionFolder
                    } catch (err: any) {
                        if (!(await exists(path.resolve(extensionFolder, "manifest.json")))) {
                            throw err
                        }
                    }
                } else {
                    return extensionFolder
                }
            } catch (err) {
                console.log(`Failed to fetch extension, trying ${attempts - 1} more times`)
                if (attempts <= 1) {
                    throw err
                }
                await new Promise((resolve) => setTimeout(resolve, 200))
                return downloadChromeExtension(chromeStoreID, forceDownload, attempts - 1)
            }

            throw new Error("Failed to fetch extension")
        }

        export interface ExtensionReference {
            /**
             * Extension ID
             */
            id: string
        }

        export interface ExtensionOptions {
            /**
             * Ignore whether the extension is already downloaded and redownload every time
             */
            forceDownload?: boolean
            /**
             * Options passed to session.loadExtension
             */
            loadExtensionOptions?: LoadExtensionOptions
            /**
             * The target session on which the extension shall be installed
             */
            session?: string | Session
        }

        /**
         * @param extensionReference Extension or extensions to install
         * @param options Installation options
         * @returns A promise resolving with the name or names of the extensions installed
         */
        export const installExtension = async (
            extensionReference: ExtensionReference | string | Array<ExtensionReference | string>,
            options: ExtensionOptions = {}
        ): Promise<string | string[]> => {
            const targetSession =
                typeof options.session === "string"
                    ? session.fromPartition(options.session)
                    : options.session || session.defaultSession
            const { forceDownload, loadExtensionOptions } = options

            if (process.type !== "browser") {
                throw new Error("electron-devtools-assembler can only be used from the main process")
            }

            if (Array.isArray(extensionReference)) {
                const installed = await Promise.all(
                    extensionReference.map((extension) => installExtension(extension, options))
                )
                return installed.flat()
            }
            let chromeStoreID: string
            if (typeof extensionReference === "object" && extensionReference.id) {
                chromeStoreID = extensionReference.id
            } else if (typeof extensionReference === "string") {
                chromeStoreID = extensionReference
            } else {
                throw new Error(`Invalid extensionReference passed in: "${extensionReference}"`)
            }

            const IDMap = getIdMap()
            const extensionName = IDMap[chromeStoreID]
            // todo - should we check id here?
            const installedExtension = targetSession.extensions.getAllExtensions().find((e) => e.name === extensionName)

            if (!forceDownload && installedExtension) {
                return IDMap[chromeStoreID]
            }

            const extensionFolder = await downloadChromeExtension(chromeStoreID, Boolean(forceDownload))
            // Use forceDownload, but already installed
            if (installedExtension) {
                targetSession.extensions.removeExtension(installedExtension.id)
            }

            const ext = await targetSession.extensions.loadExtension(extensionFolder, loadExtensionOptions)

            await new Promise((resolve) => setTimeout(resolve, 1000))

            const manifest = ext.manifest
            if (manifest.manifest_version === 3 && manifest?.background?.service_worker) {
                await targetSession.serviceWorkers.startWorkerForScope(ext.url)
            }

            return ext.name
        }
    }

    export type ExtensionReference = Index.ExtensionReference
    export type ExtensionOptions = Index.ExtensionOptions
    export const installExtension = Index.installExtension
}

//#endregion
