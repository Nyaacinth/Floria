import { app } from "electron"

import type { AppModule } from "./AppModule"
import type { ModuleContext } from "./ModuleContext"

class ModuleRunner implements PromiseLike<void> {
    private currentPromise: Promise<void>

    constructor() {
        this.currentPromise = Promise.resolve()
    }

    // Reason: It is meant to be awaitable so that we are confident that the app is fully initialized after the `init`
    // chain call and awaiting of the returned value
    // oxlint-disable-next-line unicorn/no-thenable
    then<TResult1 = void, TResult2 = never>(
        onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
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
