import type { FunctionComponent } from "react"
import { Suspense } from "react"

import { SplashAsync } from "./async-main-comp"

export const Splash: FunctionComponent = () => {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <SplashAsync />
        </Suspense>
    )
}

const LoadingFallback: FunctionComponent = () => {
    return (
        <div className="relative h-full w-full bg-mauve-600">
            <p className="absolute bottom-10 left-10 font-mono text-3xl font-extrabold text-white opacity-15">
                Loading...
            </p>
        </div>
    )
}
