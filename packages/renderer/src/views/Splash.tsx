import type { FunctionComponent } from "react"
import { useRef } from "react"

import { Typewriter } from "../components/Typewriter"
import type { StoryDefinition } from "../hooks/useInkIntegration"
import { useInkIntegration } from "../hooks/useInkIntegration"
import type { StorySaveFile } from "../utils/StorySaveFile"
import crimeDetectiveTestEntry from "./data.local/crime-detective-test.json?raw"

const testStoryDef: StoryDefinition = {
    entry: crimeDetectiveTestEntry,
    images: {},
    sounds: {},
    music: {},
    videos: {}
}

const fnHandlers = {}

export const Splash: FunctionComponent = () => {
    const saveDataRef = useRef<StorySaveFile>(null)
    const instance = useInkIntegration(testStoryDef, fnHandlers)

    return (
        <div className="h-full w-full overflow-x-hidden overflow-y-auto">
            <button
                className="m-4 rounded-md bg-blue-500 p-2 text-white"
                onClick={() => {
                    saveDataRef.current = instance.createSaveFile()
                    console.log(saveDataRef.current)
                }}
            >
                Create Save Data
            </button>
            <button
                className="m-4 rounded-md bg-blue-500 p-2 text-white"
                onClick={() => {
                    if (saveDataRef.current) instance.loadSaveFile(saveDataRef.current)
                }}
            >
                Load Save Data
            </button>
            {instance.messageCollection.map((item, index) => {
                switch (item.type) {
                    case "text": {
                        return (
                            <p key={index + "#" + JSON.stringify(item)}>
                                {
                                    <Typewriter
                                        richtextHtml={item.html}
                                        interval={200}
                                        onTyped={() => {}}
                                        onTypingEnd={() => {}}
                                    />
                                }
                            </p>
                        )
                    }
                    case "image": {
                        return "Wat? Image?"
                    }
                    case "sound": {
                        return "Wat? Sound?"
                    }
                    case "action": {
                        return "Wat? Action?"
                    }
                }
            })}
            {instance.canContinue ? (
                <button className="m-4 rounded-md bg-blue-500 p-2 text-white" onClick={() => instance.continueStory()}>
                    Continue
                </button>
            ) : instance.currentChoices.length > 0 ? (
                instance.currentChoices.map((value, index) => {
                    return (
                        <button
                            key={index}
                            className="m-4 rounded-md bg-blue-500 p-2 text-white"
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
