import { Menu } from "electron"

import type { AppModule } from "../AppModule"
import type { ModuleContext } from "../ModuleContext"

export class SetApplicationMenu implements AppModule {
    private menu: Menu | null
    private menuOnDarwin?: Menu | false

    constructor(menu: Menu | null, menuOnDarwin?: Menu | false) {
        this.menu = menu
        this.menuOnDarwin = menuOnDarwin
    }

    enable(_ctx: ModuleContext): void {
        if (process.platform !== "darwin") {
            Menu.setApplicationMenu(this.menu)
        } else {
            if (this.menuOnDarwin === false) return
            if (this.menuOnDarwin == null) {
                Menu.setApplicationMenu(this.menu)
                return
            }
            Menu.setApplicationMenu(this.menuOnDarwin)
        }
    }
}

export function initWithGivenMenu(...args: ConstructorParameters<typeof SetApplicationMenu>) {
    return new SetApplicationMenu(...args)
}
