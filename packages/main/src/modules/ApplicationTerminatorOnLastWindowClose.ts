import { AppModule } from "../AppModule"
import { ModuleContext } from "../ModuleContext"

class ApplicationTerminatorOnLastWindowClose implements AppModule {
    private terminateOnDarwin: boolean

    constructor({ terminateOnDarwin = false }: { terminateOnDarwin: boolean }) {
        this.terminateOnDarwin = terminateOnDarwin
    }

    enable({ app }: ModuleContext): Promise<void> | void {
        app.on("window-all-closed", () => {
            if (process.platform !== "darwin" || this.terminateOnDarwin) app.quit()
        })
    }
}

export function terminateAppOnLastWindowClose(
    ...args: ConstructorParameters<typeof ApplicationTerminatorOnLastWindowClose>
) {
    return new ApplicationTerminatorOnLastWindowClose(...args)
}
