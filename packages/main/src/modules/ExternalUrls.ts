import { URL } from "node:url"

import { shell } from "electron"

import type { AppModule } from "../AppModule"
import type { ModuleContext } from "../ModuleContext"

export class ExternalUrls implements AppModule {
    private readonly allowedDestinations: Array<URL>

    /**
     * Create ExternalUrls module
     *
     * @param allowedDestinations Warn: Only { #protocol, #hostname, #port } OR { #origin } is used to test destinations
     */
    constructor(allowedDestinations: Array<URL> = []) {
        function dedupe(a: Array<URL>) {
            const seen: Record<string, boolean> = {}
            return a.filter((item) => {
                const key = `${item.protocol}#AND#${item.hostname}#AND#${item.port}#AND#${item.origin}`
                return seen.hasOwnProperty(key) ? false : (seen[key] = true)
            })
        }

        this.allowedDestinations = dedupe(allowedDestinations)
    }

    enable({ app }: ModuleContext): void {
        app.on("web-contents-created", (_, contents) => {
            contents.setWindowOpenHandler(({ url }) => {
                let dest: URL
                try {
                    dest = new URL(url)
                } catch {
                    return { action: "deny" } // prevent creating a new window
                }
                const isOnAllowlist = this.allowedDestinations.some((item) => {
                    if (String(item.origin) !== "null" && String(dest.origin) !== "null") {
                        return item.origin === dest.origin
                    }
                    return item.protocol === dest.protocol && item.hostname === dest.hostname && item.port === dest.port
                })

                if (isOnAllowlist) {
                    shell.openExternal(url).catch(console.error)
                } else if (import.meta.env.DEV) {
                    console.warn(`Blocked the opening of a disallowed external destination: ${url}`)
                }

                return { action: "deny" } // prevent creating a new window
            })
        })
    }
}

export function allowExternalUrls(...args: ConstructorParameters<typeof ExternalUrls>) {
    return new ExternalUrls(...args)
}
