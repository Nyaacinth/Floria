import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { MainApp } from "./MainApp"

import "@radix-ui/themes/styles.css"
import "./main.css"

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <MainApp />
    </StrictMode>
)
