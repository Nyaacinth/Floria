import type { FunctionComponent } from "react"
import { Router, Route } from "wouter"

import { Splash } from "./views/Splash"

export const App: FunctionComponent = () => {
    return (
        <Router>
            <Route path="/" component={Splash} />
        </Router>
    )
}
