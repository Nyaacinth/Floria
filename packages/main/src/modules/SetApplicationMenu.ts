import { Menu } from "electron"

import type { AppModule } from "../AppModule"
import type { ModuleContext } from "../ModuleContext"

export class SetApplicationMenu implements AppModule {
    private menu: Menu | null

    constructor(menu: Menu | null) {
        this.menu = menu
    }

    enable(_ctx: ModuleContext): void {
        Menu.setApplicationMenu(this.menu)
    }
}

export function initWithGivenMenu(...args: ConstructorParameters<typeof SetApplicationMenu>) {
    return new SetApplicationMenu(...args)
}
