import type { AppInitConfig } from "./AppInitConfig"
import { createModuleRunner } from "./ModuleRunner"
import { terminateAppOnLastWindowClose } from "./modules/ApplicationTerminatorOnLastWindowClose"
import { appServe } from "./modules/AppServe"
import { autoUpdater } from "./modules/AutoUpdater"
import { allowInternalOrigins } from "./modules/BlockNotAllowdOrigins"
import { chromeDevToolsExtension, REACT_DEVELOPER_TOOLS } from "./modules/ChromeDevToolsExtension"
import { allowExternalUrls } from "./modules/ExternalUrls"
import { hardwareAccelerationMode } from "./modules/HardwareAccelerationModule"
import { disallowMultipleAppInstance } from "./modules/SingleInstanceApp"
import { createWindowManagerModule } from "./modules/WindowManager"

export async function initApp(initConfig: AppInitConfig) {
    const moduleRunner = createModuleRunner()
        .init(appServe(initConfig))
        .init(createWindowManagerModule({ initConfig, openDevTools: import.meta.env.DEV }))
        .init(disallowMultipleAppInstance())
        .init(terminateAppOnLastWindowClose())
        .init(hardwareAccelerationMode({ enable: true }))
        .init(autoUpdater())

        // Install DevTools extension if necessary
        .init(chromeDevToolsExtension(REACT_DEVELOPER_TOOLS))

        // Security
        .init(allowInternalOrigins(new Set(initConfig.renderer instanceof URL ? [initConfig.renderer.origin] : [])))
        .init(allowExternalUrls(new Set([])))

    await moduleRunner
}
