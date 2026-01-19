import { app } from "electron"
import { AppModule } from "./AppModule"
import { ModuleContext } from "./ModuleContext"

class ModuleRunner implements PromiseLike<void> {
    private currentPromise: Promise<void>

    constructor() {
        this.currentPromise = Promise.resolve()
    }

    then<TResult1 = void, TResult2 = never>(
        onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null | undefined,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined
    ): PromiseLike<TResult1 | TResult2> {
        return this.currentPromise.then(onfulfilled, onrejected)
    }

    init(module: AppModule) {
        const p = module.enable(this.createModuleContext())

        if (p instanceof Promise) {
            this.currentPromise = this.currentPromise.then(() => p)
        }

        return this
    }

    private createModuleContext(): ModuleContext {
        return {
            app
        }
    }
}

export function createModuleRunner() {
    return new ModuleRunner()
}
