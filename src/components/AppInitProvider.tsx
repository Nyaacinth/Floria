import { type FunctionComponent, type PropsWithChildren } from "react"
import { useTauriInit } from "../hooks/useTauriInit"

export const AppInitProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
    useTauriInit()

    return <>{children}</>
}
