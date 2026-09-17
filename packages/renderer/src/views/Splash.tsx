import type { FunctionComponent } from "react"
import { useRef } from "react"

import type { StoryDefinition } from "../hooks/useInkIntegration"
import { useInkIntegration } from "../hooks/useInkIntegration"
import type { StorySaveData } from "../utils/createStorySaveData"
import crimeDetectiveTestEntry from "./data.local/crime-detective-test.json?raw"

const testStoryDef: StoryDefinition = {
    entry: crimeDetectiveTestEntry,
    images: {},
    sounds: {}
}

const fnHandlers = {}

export const Splash: FunctionComponent = () => {
    const saveDataRef = useRef<StorySaveData>(null)
    const instance = useInkIntegration(testStoryDef, fnHandlers)

    return (
        <div className="h-full w-full overflow-x-hidden overflow-y-auto">
            <button
                className="m-4 p-2 bg-blue-500 text-white rounded-md"
                onClick={() => {
                    saveDataRef.current = instance.createSaveData()
                    console.log(saveDataRef.current)
                }}
            >
                Create Save Data
            </button>
            <button
                className="m-4 p-2 bg-blue-500 text-white rounded-md"
                onClick={() => {
                    if (saveDataRef.current) instance.loadSaveData(saveDataRef.current)
                }}
            >
                Load Save Data
            </button>
            {instance.messageCollection.map((item, _index) => {
                switch (item.type) {
                    case "text": {
                        return <p key={JSON.stringify(item)}>{item.elmTree}</p>
                    }
                    case "image": {
                        return "Wat? Image?"
                    }
                    case "sound": {
                        return "Wat? Sound?"
                    }
                }
            })}
            {instance.canContinue ? (
                <button className="m-4 p-2 bg-blue-500 text-white rounded-md" onClick={() => instance.continueStory()}>
                    Continue
                </button>
            ) : instance.currentChoices.length > 0 ? (
                instance.currentChoices.map((value, index) => {
                    return (
                        <button
                            key={index}
                            className="m-4 p-2 bg-blue-500 text-white rounded-md"
                            onClick={() => instance.chooseChoiceIndex(value.index)}
                        >
                            {value.text}
                        </button>
                    )
                })
            ) : (
                <p>End of Story</p>
            )}
        </div>
    )
}
