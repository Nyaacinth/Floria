import { execSync } from "node:child_process"
import { resolve as resolvePath } from "node:path"

function getElectronEnv() {
    if (globalThis.Bun && Bun.spawnSync) {
        const { stdout } = Bun.spawnSync({
            cmd: [resolvePath(__dirname, "../../node_modules/.bin/electron"), "-p", "JSON.stringify(process.versions)"],
            stdout: "pipe",
            stderr: "ignore",
            env: {
                ELECTRON_RUN_AS_NODE: 1
            }
        })

        return JSON.parse(stdout.toString())
    } else {
        const stdout = execSync(
            `"${resolvePath(import.meta.dirname, "../../node_modules/.bin/electron")}" -p "JSON.stringify(process.versions)"`,
            {
                encoding: "utf-8",
                env: {
                    ELECTRON_RUN_AS_NODE: 1
                }
            }
        )

        return JSON.parse(stdout)
    }
}

function createElectronEnvLoader() {
    let inMemoryCache = null

    return () => {
        if (inMemoryCache) {
            return inMemoryCache
        }

        return (inMemoryCache = getElectronEnv())
    }
}

const envLoader = createElectronEnvLoader()

export function getElectronVersions() {
    return envLoader()
}

export function getChromeVersion() {
    return getElectronVersions().chrome
}

export function getChromeMajorVersion() {
    return getMajorVersion(getChromeVersion())
}

export function getNodeVersion() {
    return getElectronVersions().node
}

export function getNodeMajorVersion() {
    return getMajorVersion(getNodeVersion())
}

function getMajorVersion(version) {
    return parseInt(version.split(".")[0])
}
