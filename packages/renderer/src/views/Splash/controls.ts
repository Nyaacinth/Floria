import { showAboutPage } from "@app/preload"
import type { FunctionComponent } from "react"

import { IconMaterialSymbolInfoOutlineRounded } from "../../components/IconMaterialSymbolInfoOutlineRounded"

interface LikelySvgCompProps {
    size: number
}

type ControlsList = Array<[label: string, likelySvgComp: FunctionComponent<LikelySvgCompProps>, callback: () => void]>

export const controls: ControlsList = [["About", IconMaterialSymbolInfoOutlineRounded, () => showAboutPage()]]
