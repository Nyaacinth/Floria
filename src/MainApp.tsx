import { Theme } from "@radix-ui/themes"
import type { FunctionComponent } from "react"
import { Route, Router } from "wouter"
import { useTauriInit } from "./hooks/useTauriInit"
import { Splash } from "./views/Splash"

export const MainApp: FunctionComponent = () => {
    useTauriInit()

    return (
        <Theme accentColor="mint" panelBackground="translucent">
            <Router>
                <Route path="/" component={Splash} />
            </Router>
        </Theme>
    )
}
