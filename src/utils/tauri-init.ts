import { isTauri } from "@tauri-apps/api/core"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { useEffect } from "react"

const EDITABLE_SELECTORS = [
    'input[type="text"]',
    'input[type="password"]',
    'input[type="email"]',
    'input[type="tel"]',
    'input[type="url"]',
    'input[type="search"]',
    'input[type="number"]',
    "input:not([type])",
    "textarea",
    '[contenteditable="true"]'
]

// Paired with <div id="root" style="display: contents" />
const WEBVIEW_NATIVEIFY_CSS = `
    html {
        overscroll-behavior: none;
        overflow: hidden;
        width: 100vw;
        height: 100vh;
    }
    @supports (height: 100dvh) and (width: 100dvw) {
        html {
            width: 100dvw;
            height: 100dvh;
        }
    }
    body {
        overflow: auto;
        width: 100%;
        height: 100%;
    }
    html {
        -webkit-user-select: none;
        user-select: none;
        cursor: default;
    }
    ${EDITABLE_SELECTORS.join(", ")} {
        -webkit-user-select: text;
        user-select: text;
        cursor: text;
    }
`
    .replaceAll(/\s+/g, " ")
    .trim()

function isEditableElement(elm: HTMLElement) {
    for (const selector of EDITABLE_SELECTORS) {
        if (elm.matches(selector)) {
            return true
        }
    }
    return false
}

const doTauriInit = (() => {
    let didTauriInit = false

    return function doTauriInit() {
        if (didTauriInit) return
        // Inject stylesheet that nativefies tauri webview
        const styleElement = document.createElement("style")
        styleElement.innerHTML = WEBVIEW_NATIVEIFY_CSS
        document.head.appendChild(styleElement)

        // Disable F5, Ctrl+R, and Cmd+R from reloading the page
        document.addEventListener("keydown", (event) => {
            if (event.key === "F5" || (event.ctrlKey && event.key === "r") || (event.metaKey && event.key === "r")) {
                event.preventDefault()
            }
        })

        // Only allow context menu on editable elements
        document.addEventListener("contextmenu", (event) => {
            if (isEditableElement(event.target as HTMLElement)) return
            event.preventDefault()
        })

        // Paired with `"visible": false` in `tauri.conf.json` to show window after page loaded to avoid flickers
        const thisWindow = getCurrentWindow()
        thisWindow.show()
        thisWindow.setFocus()

        didTauriInit = true
    }
})()

// Wrapper, making sure it only runs once after page load in tauri, use your own `useEffect` alternative respectively.
export function useTauriInit() {
    useEffect(() => {
        if (isTauri()) doTauriInit()
    }, [])
}
