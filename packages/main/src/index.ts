import type { AppInitConfig } from "./AppInitConfig"
import { createModuleRunner } from "./ModuleRunner"
import { terminateAppOnLastWindowClose } from "./modules/ApplicationTerminatorOnLastWindowClose"
import { serveStatics } from "./modules/AppServe"
import { autoUpdater } from "./modules/AutoUpdater"
import { allowInternalOrigins } from "./modules/BlockNotAllowdOrigins"
import { allowExternalUrls } from "./modules/ExternalUrls"
import { hardwareAccelerationMode } from "./modules/HardwareAccelerationModule"
import { initWithGivenMenu } from "./modules/SetApplicationMenu"
import { disallowMultipleAppInstance } from "./modules/SingleInstanceApp"
import { createWindowManagerModule } from "./modules/WindowManager"

export async function initApp(initConfig: AppInitConfig) {
    const moduleRunner = createModuleRunner()
        .init(serveStatics(initConfig))
        .init(createWindowManagerModule({ initConfig, withDevTools: import.meta.env.DEV }))
        .init(disallowMultipleAppInstance())
        .init(terminateAppOnLastWindowClose())
        .init(hardwareAccelerationMode({ enable: true }))
        .init(initWithGivenMenu(null))
        .init(autoUpdater())

        // Security
        .init(allowInternalOrigins(new Set(initConfig.renderer instanceof URL ? [initConfig.renderer.origin] : [])))
        .init(allowExternalUrls(new Set([])))

    await moduleRunner
}
