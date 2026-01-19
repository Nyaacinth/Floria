import { app, Extension, LoadExtensionOptions, Session, session } from "electron"
import * as fs from "fs"
import * as https from "https"
import * as path from "path"
import { AppModule } from "../AppModule"
import { ModuleContext } from "../ModuleContext"

// @ts-expect-error
import unzip from "unzip-crx-3"

export type ExtensionReference = ElectronDevToolsInstaller.ExtensionReference

export interface ChromeDevToolsExtensionInstallOptions extends ElectronDevToolsInstaller.InstallExtensionOptions {
    installEvenInProduction?: boolean
}

export class ChromeDevToolsExtension implements AppModule {
    private readonly options?: ElectronDevToolsInstaller.InstallExtensionOptions
    private readonly shouldInstall: boolean

    constructor(
        private readonly extensions:
            | ElectronDevToolsInstaller.ExtensionReference
            | string
            | (ElectronDevToolsInstaller.ExtensionReference | string)[],
        options?: ChromeDevToolsExtensionInstallOptions
    ) {
        this.options = options
        this.shouldInstall = options?.installEvenInProduction || import.meta.env.DEV
    }

    async enable({ app }: ModuleContext): Promise<void> {
        if (!this.shouldInstall) return
        await app.whenReady()
        await ElectronDevToolsInstaller.installExtension(this.extensions, this.options)
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

/* -------------------------------- */

/**
 * @description Originated from https://github.com/MarshallOfSound/electron-devtools-installer.
 * Fixed deprecations, modernized, fit in one namespace
 *
 * @license MIT
 *
 * The MIT License (MIT)
 * Copyright (c) 2016 Samuel Attard
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
namespace ElectronDevToolsInstaller {
    export interface ExtensionReference {
        /**
         * Extension ID
         */
        id: string
    }

    export interface InstallExtensionOptions {
        /**
         * Ignore whether the extension is already downloaded and redownload every time
         */
        forceDownload?: boolean
        /**
         * Options passed to session.loadExtension
         */
        loadExtensionOptions?: LoadExtensionOptions
        /**
         * Optionally specify the session to install devtools into, by default devtools
         * will be installed into the "defaultSession". See the Electron Session docs
         * for more info.
         *
         * https://electronjs.org/docs/api/session
         */
        session?: Session
    }

    /**
     * @param extensionReference Extension or extensions to install
     * @param options Installation options
     * @returns A promise resolving with the name or names of the extensions installed
     */
    export async function installExtension(
        extensionReference: ExtensionReference | string | (ExtensionReference | string)[],
        options: InstallExtensionOptions = {}
    ): Promise<Extension[]> {
        const extensionsNeedingProcess: string[] = []
        if (Array.isArray(extensionReference)) {
            for (const singleRefOrId of extensionReference) {
                let id: string
                if (typeof singleRefOrId != "string") {
                    id = singleRefOrId.id
                } else {
                    id = singleRefOrId
                }
                extensionsNeedingProcess.push(id)
            }
        } else {
            if (typeof extensionReference == "string") {
                extensionsNeedingProcess.push(extensionReference)
            } else {
                extensionsNeedingProcess.push(extensionReference.id)
            }
        }
        return Promise.all(extensionsNeedingProcess.map((id) => installIndividualExtension(id, options)))
    }

    async function installIndividualExtension(
        chromeStoreID: string,
        options: InstallExtensionOptions
    ): Promise<Extension> {
        const { forceDownload, loadExtensionOptions, session: _session } = options
        const targetSession = _session || session.defaultSession

        if (process.type !== "browser") {
            return Promise.reject(new Error("electron-devtools-installer can only be used from the main process"))
        }

        const installedExtension = targetSession.extensions.getAllExtensions().find((e) => e.id === chromeStoreID)

        if (!forceDownload && installedExtension) {
            return installedExtension
        }
        const extensionFolder = await downloadChromeExtension(chromeStoreID, {
            forceDownload: forceDownload || false
        })
        // Use forceDownload, but already installed
        if (installedExtension?.id) {
            const unloadPromise = new Promise<void>((resolve) => {
                const handler = (_: unknown, ext: Extension) => {
                    if (ext.id === installedExtension.id) {
                        targetSession.removeListener("extension-unloaded", handler)
                        resolve()
                    }
                }
                targetSession.on("extension-unloaded", handler)
            })
            targetSession.extensions.removeExtension(installedExtension.id)
            await unloadPromise
        }

        return targetSession.extensions.loadExtension(extensionFolder, loadExtensionOptions)
    }

    export const downloadChromeExtension = async (
        chromeStoreID: string,
        {
            forceDownload = false,
            attempts = 5
        }: {
            forceDownload?: boolean
            attempts?: number
        } = {}
    ): Promise<string> => {
        const extensionsStore = Utils.getPath()
        if (!fs.existsSync(extensionsStore)) {
            await fs.promises.mkdir(extensionsStore, { recursive: true })
        }
        const extensionFolder = path.resolve(`${extensionsStore}/${chromeStoreID}`)

        if (!fs.existsSync(extensionFolder) || forceDownload) {
            if (fs.existsSync(extensionFolder)) {
                await fs.promises.rm(extensionFolder, {
                    recursive: true
                })
            }
            const fileURL = `https://clients2.google.com/service/update2/crx?response=redirect&acceptformat=crx2,crx3&x=id%3D${chromeStoreID}%26uc&prodversion=${process.versions.chrome}` // eslint-disable-line
            const filePath = path.resolve(`${extensionFolder}.crx`)
            try {
                await Utils.downloadFile(fileURL, filePath)

                try {
                    await unzip(filePath, extensionFolder)
                    Utils.changePermissions(extensionFolder, 755)
                    return extensionFolder
                } catch (err) {
                    if (!fs.existsSync(path.resolve(extensionFolder, "manifest.json"))) {
                        throw err
                    }
                }
            } catch (err) {
                console.error(`Failed to fetch extension, trying ${attempts - 1} more times`) // eslint-disable-line
                if (attempts <= 1) {
                    throw err
                }
                await new Promise<void>((resolve) => setTimeout(resolve, 200))

                return await downloadChromeExtension(chromeStoreID, {
                    forceDownload,
                    attempts: attempts - 1
                })
            }
        }

        return extensionFolder
    }

    namespace Utils {
        export const getPath = () => {
            const savePath = app.getPath("userData")
            return path.resolve(`${savePath}/extensions`)
        }

        export const downloadFile = (from: string, to: string) => {
            return new Promise<void>((resolve, reject) => {
                const req = https.request(from)
                req.on("response", (res) => {
                    // Shouldn't handle redirect with `electron.net`, this is for https.get fallback
                    if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                        return downloadFile(res.headers.location, to).then(resolve).catch(reject)
                    }
                    res.pipe(fs.createWriteStream(to)).on("close", resolve)
                    res.on("error", reject)
                })
                req.on("error", reject)
                req.end()
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
    }
}
