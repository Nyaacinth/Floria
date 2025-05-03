import { type FunctionComponent, type PropsWithChildren } from "react"
import { useTauriInit } from "../utils/tauri-init"

export const AppInitProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
    useTauriInit()

    return <>{children}</>
}
