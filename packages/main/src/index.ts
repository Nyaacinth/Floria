import type { AppInitConfig } from "./AppInitConfig"
import { createModuleRunner } from "./ModuleRunner"
import { terminateAppOnLastWindowClose } from "./modules/ApplicationTerminatorOnLastWindowClose"
import { serveStatics } from "./modules/AppServe"
import { allowInternalOrigins } from "./modules/BlockNotAllowedOrigins"
import { allowExternalUrls } from "./modules/ExternalUrls"
import { handleIpcMessagesWithPredefinedActions } from "./modules/HandleIpcMessagesWithPredefinedActions"
import { hardwareAccelerationMode } from "./modules/HardwareAccelerationModule"
import { initWithGivenMenu } from "./modules/SetApplicationMenu"
import { disallowMultipleAppInstance } from "./modules/SingleInstanceApp"
import { createWindowManagerModule } from "./modules/WindowManager"

export async function initApp(initConfig: AppInitConfig) {
    const moduleRunner = createModuleRunner()
        .init(serveStatics(initConfig))
        .init(disallowMultipleAppInstance())
        .init(createWindowManagerModule({ initConfig, withDevTools: import.meta.env.DEV }))
        .init(terminateAppOnLastWindowClose({ terminateOnDarwin: true }))
        .init(hardwareAccelerationMode({ enable: true }))
        .init(initWithGivenMenu(null))

        // Security
        .init(allowInternalOrigins(new Set(initConfig.renderer instanceof URL ? [initConfig.renderer.origin] : [])))
        .init(allowExternalUrls(new Set([])))

        // IPC
        .init(handleIpcMessagesWithPredefinedActions())

    await moduleRunner
}
