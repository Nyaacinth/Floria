import { URL } from "node:url"

import * as Electron from "electron"

import { AbstractSecurityRule } from "./AbstractSecurityModule"

/**
 * Block navigation to origins not on the allowlist.
 *
 * Navigation exploits are quite common. If an attacker can convince the app to navigate away from its current page,
 * they can possibly force the app to open arbitrary web resources/websites on the web.
 *
 * @see https://www.electronjs.org/docs/latest/tutorial/security#13-disable-or-limit-navigation
 */
export class BlockNotAllowedOrigins extends AbstractSecurityRule {
    private readonly allowedDestinations: Array<URL>

    /**
     * Create BlockNotAllowedOrigins module
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

        super()
        this.allowedDestinations = dedupe(allowedDestinations)
    }

    applyRule(contents: Electron.WebContents): void {
        const filterFn = (event: Electron.Event, url: string) => {
            let dest: URL
            try {
                dest = new URL(url)
            } catch {
                event.preventDefault()
                return
            }
            const isOnAllowlist = this.allowedDestinations.some((item) => {
                if (String(item.origin) !== "null" && String(dest.origin) !== "null") {
                    return item.origin === dest.origin
                }
                return item.protocol === dest.protocol && item.hostname === dest.hostname && item.port === dest.port
            })

            if (isOnAllowlist) return

            // Prevent navigation
            event.preventDefault()

            if (import.meta.env.DEV) {
                console.warn(`Blocked navigating to disallowed destination: ${dest.href}`)
            }
        }
        contents.on("will-navigate", filterFn)
        contents.on("will-redirect", filterFn)
    }
}

/**
 * Create BlockNotAllowedOrigins module
 *
 * @param allowedDestinations Warn: Only { #protocol, #hostname, #port } OR { #origin } is used to test destinations
 */
export function allowInternalOrigins(
    ...args: ConstructorParameters<typeof BlockNotAllowedOrigins>
): BlockNotAllowedOrigins {
    return new BlockNotAllowedOrigins(...args)
}
