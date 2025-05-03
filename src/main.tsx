import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Route, Router } from "wouter"
import { AppInit } from "./components/AppInit.Provider"
import { Splash } from "./views/Splash"

import "./main.css"

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AppInit.Provider>
            <Router>
                <Route path="/" component={Splash} />
            </Router>
        </AppInit.Provider>
    </StrictMode>
)
