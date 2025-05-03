import { type FunctionComponent, type PropsWithChildren } from "react"
import { useTauriInit } from "../utils/tauri-init"

const AppInitProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
    useTauriInit()

    return <>{children}</>
}

export const AppInit = {
    Provider: AppInitProvider
} as const
