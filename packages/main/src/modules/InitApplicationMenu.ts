import { Menu } from "electron"
import { AppModule } from "../AppModule"
import { ModuleContext } from "../ModuleContext"

export class InitApplicationMenu implements AppModule {
    private menu: Menu | null

    constructor(menu: Menu | null) {
        this.menu = menu
    }

    enable({ app }: ModuleContext): Promise<void> | void {
        Menu.setApplicationMenu(this.menu)
    }
}

export function initApplicationMenu(menu: Menu | null) {
    return new InitApplicationMenu(menu)
}
