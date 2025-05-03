import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Route, Router } from "wouter"
import { Splash } from "./views/Splash"

import "./main.css"

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Router>
            <Route path="/" component={Splash} />
        </Router>
    </StrictMode>
)
