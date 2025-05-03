import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Route, Router } from "wouter"
import { AppInitProvider } from "./components/AppInitProvider"
import { Splash } from "./views/Splash"

import "./main.css"

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AppInitProvider>
            <Router>
                <Route path="/" component={Splash} />
            </Router>
        </AppInitProvider>
    </StrictMode>
)
