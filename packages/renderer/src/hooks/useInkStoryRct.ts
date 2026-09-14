import { Story } from "inkjs"
import { ErrorType } from "inkjs/engine/Error"
import { useCallback, useEffect, useRef, useState } from "react"
import type { SetReadonly } from "type-fest"

export type InkStoryRct = ReturnType<typeof useInkStoryRct>

/**
 * Create a ink story instance and wire it up with React
 *
 * @param storyArchiveJson Ink story json exported by ink compiler
 * @param historyHandler Usually a history recorder returned by `useInkMessageCollection`
 * @returns A story wrapper wired up with React with raw access (`story`, `setStory()`), destructuring is not
 *   recommended because most of the time you would use everything it contains
 */
export function useInkStoryRct(storyArchiveJson: string, historyHandler: (newText: string) => void = () => {}) {
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

    // markDirty, don't expose forceUpdate
    const [, forceUpdate] = useState(0)
    const markDirty = useCallback(() => {
        forceUpdate((prev) => (prev < 256 ? prev + 1 : 0))
    }, [])
    const prevText = useRef<string>(null)
    const tryRecordHistory = useCallback(() => {
        if (story.currentText !== null && story.currentText !== "") {
            if (prevText.current !== story.currentText) {
                historyHandler(story.currentText)
            }
            prevText.current = story.currentText
        }
    }, [historyHandler, story.currentText])

    const continueStory = useCallback(() => {
        markDirty()
        const ret = story.Continue()
        tryRecordHistory()
        return ret
    }, [story, markDirty, tryRecordHistory])

    const chooseChoiceIndex = useCallback(
        (choiceIdx: number) => {
            markDirty()
            const ret = story.ChooseChoiceIndex(choiceIdx)
            tryRecordHistory()
            return ret
        },
        [story, markDirty, tryRecordHistory]
    )

    const choosePathString = useCallback(
        (path: string, resetCallstack?: boolean, args?: any[]) => {
            markDirty()
            const ret = story.ChoosePathString(path, resetCallstack, args)
            tryRecordHistory()
            return ret
        },
        [story, markDirty, tryRecordHistory]
    )

    const warning = useCallback(
        (message: string) => {
            markDirty()
            const ret = story.Warning(message)
            tryRecordHistory()
            return ret
        },
        [story, markDirty, tryRecordHistory]
    )

    const setVariableState = useCallback(
        (name: string, value: any) => {
            markDirty()
            const ret = story.variablesState.$(name, value)
            tryRecordHistory()
            return ret
        },
        [story, markDirty, tryRecordHistory]
    )

    const evaluateFunction = useCallback(
        (functionName: string, args?: any[], returnTextOutput?: boolean) => {
            markDirty()
            const ret = story.EvaluateFunction(functionName, args, returnTextOutput)
            tryRecordHistory()
            return ret
        },
        [story, markDirty, tryRecordHistory]
    )

    const recoverFromStateJson = useCallback(
        (json: string) => {
            markDirty()
            const ret = story.state.LoadJson(json)
            tryRecordHistory()
            return ret
        },
        [story, markDirty, tryRecordHistory]
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

    const unbindExternalFunction = useCallback(
        (functionName: string) => {
            story.UnbindExternalFunction(functionName)
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

        /** Non-reactive inner story instance, see also: `markDirty()` */
        story,

        /** Non-reactive inner story instance, see also: `markDirty()` */
        setStory,

        /**
         * Mark state as dirty after external non-reactive changes, please pair it with a `tryRecordHistory()` after the
         * mutation if called outside
         */
        markDirty,

        /**
         * Pair it with external mutations (where you would call `markDirty()`) or anywhere that you suspect will
         * generate a new `currentText`, this function will not record if `currentText` doesn't change, so if in doubt,
         * use it
         */
        tryRecordHistory,

        // Properties

        /**
         * Current text, possibly null or empty before calling first `continue()` or at the end or in other
         * circumstances
         */
        currentText,

        /**
         * True if `continue()` can be called. Please check this before calling `continue()`, otherwise error would be
         * thrown in ink instance and text/choices would be empty
         */
        canContinue,

        /** Current choice instances, empty if no choices (e.g. plain text plot) */
        currentChoices,

        /**
         * Global story tags, not knot tags, you can include (for example) top level story metadata there
         *
         * Example Ink Script Snippet:
         *
         * ```plaintext
         * # author: Joseph Humfrey
         * # title: My Wonderful Ink Story
         * ```
         */
        globalTags,

        /**
         * Current story tags in scope
         *
         * Example Ink Script Snippet:
         *
         * ```plaintext
         * Ipsum Lorem... # theTags
         * ```
         */
        currentTags,

        // Mutating methods

        /** Continue, please check `canContinue` before calling */
        continue: continueStory,

        /** Choose a choice with a choice index, you can get those from `currentChoices` */
        chooseChoiceIndex,

        /**
         * Choose a path defined in story (by knot tags)
         *
         * Example Ink Script Snippet:
         *
         * ```plaintext
         * === Munich ==
         * Ipsum Lorum...
         * ```
         */
        choosePathString,

        /** Add a warning in story, by default will be logged in browser console */
        warning,

        /** Modify an ink variable reactively */
        setVariableState,

        /** Evaluate a ink function in current scope reactively */
        evaluateFunction,

        /** Recover from saved state and refresh hook state, would be used in S/L */
        recoverFromStateJson,

        // Non-mutating methods

        /** Get the value of a ink variable */
        getVariableState,

        /**
         * Get the times of encountering for a path in story, returns `yourKnot` for knots, and `yourKnot.yourStitch`
         * for stitches
         */
        getCurrentVisitCountAtPathString,

        /** Add a variable observer, you would usually need this for integration */
        addVariableObserver,

        /**
         * Bind an external function handler for corresponding ink function, be aware that ink function needs to be
         * defined in ink story as external
         */
        bindExternalFunction,

        /** Unbinds an existing function handler */
        unbindExternalFunction,

        /** Get a saved state of current story progress, would be used in S/L */
        saveToStateJson,

        /**
         * Get the knot tags for specified path
         *
         * Example Ink Script Snippet:
         *
         * ```plaintext
         * === Munich ==
         * Ipsum Lorum...
         * ```
         */
        getTagsForContentAtPath
    }

    type InkStoryRct = SetReadonly<
        typeof returnValue,
        "story" | "currentText" | "canContinue" | "currentChoices" | "globalTags" | "currentTags"
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
            alert(`Ink Runtime Error: ${message}`)
            break
    }
}
