import { isTauri } from "@tauri-apps/api/core"
import { useEffect } from "react"
import { doTauriInit } from "../utils/doTauriInit"

export function useTauriInit() {
    useEffect(() => {
        if (isTauri()) {
            return doTauriInit()
        }
    }, [])
}
