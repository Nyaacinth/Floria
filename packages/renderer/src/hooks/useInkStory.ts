import { Story } from "inkjs"
import { ErrorType } from "inkjs/engine/Error"
import { useCallback, useEffect, useRef, useState } from "react"
import type { SetReadonly } from "type-fest"

export type InkStoryRct = ReturnType<typeof useInkStory>

export function useInkStory(storyArchiveJson: string) {
    const storyArchiveJsonRef = useRef(storyArchiveJson) // traces storyArchiveJson

    // late init
    const [story, setStory] = useState<Story>(() => {
        const s = new Story(storyArchiveJson)
        s.onError = defaultHandlerOnError
        return s
    })

    // traces & re-init
    useEffect(() => {
        if (storyArchiveJson !== storyArchiveJsonRef.current) {
            const newStory = new Story(storyArchiveJson)
            newStory.onError = defaultHandlerOnError
            setStory(newStory)
            storyArchiveJsonRef.current = storyArchiveJson
        }
    }, [storyArchiveJson])

    // markDirty
    const [, forceUpdate] = useState(0)
    const markDirty = useCallback(() => {
        forceUpdate((prev) => prev + 1)
    }, [])

    const continueStory = useCallback(() => {
        markDirty()
        return story.Continue()
    }, [story, markDirty])

    const chooseChoiceIndex = useCallback(
        (choiceIdx: number) => {
            markDirty()
            return story.ChooseChoiceIndex(choiceIdx)
        },
        [story, markDirty]
    )

    const choosePathString = useCallback(
        (path: string, resetCallstack?: boolean, args?: any[]) => {
            markDirty()
            story.ChoosePathString(path, resetCallstack, args)
        },
        [story, markDirty]
    )

    const warning = useCallback(
        (message: string) => {
            markDirty()
            story.Warning(message)
        },
        [story, markDirty]
    )

    const setVariableState = useCallback(
        (name: string, value: any) => {
            markDirty()
            return story.variablesState.$(name, value)
        },
        [story, markDirty]
    )

    const evaluateFunction = useCallback(
        (functionName: string, args?: any[], returnTextOutput?: boolean) => {
            markDirty()
            return story.EvaluateFunction(functionName, args, returnTextOutput)
        },
        [story, markDirty]
    )

    const recoverFromStateJson = useCallback(
        (json: string) => {
            markDirty()
            return story.state.LoadJson(json)
        },
        [story, markDirty]
    )

    // Non-mutating methods that only read from the story – no state update needed
    const getVariableState = useCallback(
        (name: string) => {
            return story.variablesState.$(name)
        },
        [story]
    )

    const getCurrentVisitCountAtPathString = useCallback(
        (pathString: string) => {
            return story.state.VisitCountAtPathString(pathString)
        },
        [story]
    )

    const addVariableObserver = useCallback(
        (variableName: string, observer: Story.VariableObserver) => {
            story.ObserveVariable(variableName, observer)
        },
        [story]
    )

    const bindExternalFunction = useCallback(
        (functionName: string, externalFunction: (...args: any[]) => any, lookaheadSafe?: boolean) => {
            return story.BindExternalFunction(functionName, externalFunction, lookaheadSafe)
        },
        [story]
    )

    const saveToStateJson = useCallback(
        (indented?: boolean) => {
            return story.state.ToJson(indented)
        },
        [story]
    )

    const getTagsForContentAtPath = useCallback(
        (path: string) => {
            return story.TagsForContentAtPath(path)
        },
        [story]
    )

    // Deriveds
    const currentText = story.currentText
    const canContinue = story.canContinue
    const currentChoices = story.currentChoices
    const globalTags = story.globalTags
    const currentTags = story.currentTags

    const returnValue = {
        // Raw access
        get story() {
            return story
        },
        set story(value) {
            setStory(value)
        },
        markDirty,

        // Properties
        currentText,
        canContinue,
        currentChoices,
        globalTags,
        currentTags,

        // Mutating methods
        continue: continueStory,
        chooseChoiceIndex,
        choosePathString,
        warning,
        setVariableState,
        evaluateFunction,
        recoverFromStateJson,

        // Non-mutating methods
        getVariableState,
        getCurrentVisitCountAtPathString,
        addVariableObserver,
        bindExternalFunction,
        saveToStateJson,
        getTagsForContentAtPath
    }

    type InkStoryRct = SetReadonly<
        typeof returnValue,
        "currentText" | "canContinue" | "currentChoices" | "globalTags" | "currentTags"
    >

    return returnValue as InkStoryRct
}

const defaultHandlerOnError = (message: string, errorType: ErrorType) => {
    switch (errorType) {
        case ErrorType.Warning:
            console.warn(`Ink Warning: ${message}`)
            break
        case ErrorType.Author:
            console.error(`Ink Error from Author: ${message}`)
            break
        case ErrorType.Error:
            console.error(`Ink Error: ${message}`)
            break
    }
}
