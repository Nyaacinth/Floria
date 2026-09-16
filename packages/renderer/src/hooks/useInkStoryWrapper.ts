import { InkList, Story } from "inkjs"
import { ErrorType } from "inkjs/engine/Error"
import type { Path as InkPath } from "inkjs/engine/Path"
import { useCallback, useEffect, useRef, useState } from "react"

const noOpHandler = () => {}

/**
 * Create a ink story instance and wire it up with React
 *
 * @param storyArchiveJson Ink story json exported by ink compiler
 * @param historyHandler Usually a history recorder returned by `useInkMessageCollection`
 * @returns A story wrapper wired up with React with raw access (`story`, `setStory()`)
 */
export function useInkStoryWrapper(storyArchiveJson: string, historyHandler: (newText: string) => void = noOpHandler) {
    const storyArchiveJsonRef = useRef(storyArchiveJson) // traces storyArchiveJson

    // late init
    const [story, setStory] = useState<Story>(() => {
        const s = new Story(storyArchiveJson)
        s.onError = defaultHandlerOnError
        return s
    })

    // markDirty, don't expose forceUpdate
    const [, forceUpdate] = useState(0)
    const markDirty = useCallback(() => {
        forceUpdate((prev) => (prev < 256 ? prev + 1 : 0))
    }, [])

    // traces & re-init
    useEffect(() => {
        if (storyArchiveJson !== storyArchiveJsonRef.current) {
            const newStory = new Story(storyArchiveJson)
            newStory.onError = defaultHandlerOnError
            setStory(newStory)
            storyArchiveJsonRef.current = storyArchiveJson
        }
    }, [storyArchiveJson])

    const continueStory = useCallback(() => {
        markDirty()
        const ret = story.Continue()
        if (ret != null && ret.trim() !== "") historyHandler(ret)
        return ret
    }, [story, markDirty, historyHandler])

    const chooseChoiceIndex = useCallback(
        (...args: Parameters<(typeof story)["ChooseChoiceIndex"]>) => {
            markDirty()
            return story.ChooseChoiceIndex(...args)
        },
        [story, markDirty]
    )

    const choosePathString = useCallback(
        (...args: Parameters<(typeof story)["ChoosePathString"]>) => {
            markDirty()
            return story.ChoosePathString(...args)
        },
        [story, markDirty]
    )

    const warning = useCallback(
        (...args: Parameters<(typeof story)["Warning"]>) => {
            markDirty()
            return story.Warning(...args)
        },
        [story, markDirty]
    )

    const error = useCallback(
        (...args: Parameters<(typeof story)["Error"]>) => {
            markDirty()
            return story.Error(...args)
        },
        [story, markDirty]
    )

    const setVariableState = useCallback(
        (name: string, value: boolean | string | number | InkList | InkPath | null) => {
            markDirty()
            return story.variablesState.$(name, value)
        },
        [story, markDirty]
    )

    const evaluateFunction = useCallback(
        (...args: Parameters<(typeof story)["EvaluateFunction"]>) => {
            markDirty()
            return story.EvaluateFunction(...args)
        },
        [story, markDirty]
    )

    const recoverFromStateJson = useCallback(
        (json: string, systemMessageOnLoad: string | false = "Loaded from Save File") => {
            markDirty()
            const ret = story.state.LoadJson(json)
            if (systemMessageOnLoad !== false) historyHandler(systemMessageOnLoad)
            const currentText = story.currentText
            if (currentText != null && currentText.trim() !== "") historyHandler(currentText)
            return ret
        },
        [story, markDirty, historyHandler]
    )

    // Non-mutating methods that only read from the story – no state update needed
    const getVariableState = useCallback(
        (name: string) => {
            return story.variablesState.$(name)
        },
        [story]
    )

    const getCurrentVisitCountAtPathString = useCallback(
        (...args: Parameters<(typeof story)["state"]["VisitCountAtPathString"]>) => {
            return story.state.VisitCountAtPathString(...args)
        },
        [story]
    )

    const addVariableObserver = useCallback(
        (...args: Parameters<(typeof story)["ObserveVariable"]>) => {
            story.ObserveVariable(...args)
        },
        [story]
    )

    const removeVariableObserver = useCallback(
        (...args: Parameters<(typeof story)["RemoveVariableObserver"]>) => {
            story.RemoveVariableObserver(...args)
        },
        [story]
    )

    const bindExternalFunction = useCallback(
        (...args: Parameters<(typeof story)["BindExternalFunction"]>) => {
            return story.BindExternalFunction(...args)
        },
        [story]
    )

    const unbindExternalFunction = useCallback(
        (...args: Parameters<(typeof story)["UnbindExternalFunction"]>) => {
            return story.UnbindExternalFunction(...args)
        },
        [story]
    )

    const saveToStateJson = useCallback(
        (...args: Parameters<(typeof story)["state"]["ToJson"]>) => {
            return story.state.ToJson(...args)
        },
        [story]
    )

    const getTagsForContentAtPath = useCallback(
        (...args: Parameters<(typeof story)["TagsForContentAtPath"]>) => {
            return story.TagsForContentAtPath(...args)
        },
        [story]
    )

    // Deriveds
    const currentText = story.currentText
    const canContinue = story.canContinue
    const currentChoices = story.currentChoices
    const globalTags = story.globalTags
    const currentTags = story.currentTags

    return {
        // Raw access

        /** Non-reactive inner story instance, see also: `markDirty()` */
        story,

        /** Non-reactive inner story instance, see also: `markDirty()` */
        setStory,

        /** Mark state as dirty after external non-reactive changes */
        markDirty,

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
        continueStory,

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

        /** Add an error in story, by default will be logged in browser console */
        error,

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

        /** Remove a variable observer, you would usually need this for integration */
        removeVariableObserver,

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
}

const defaultHandlerOnError = (message: string, errorType: ErrorType) => {
    switch (errorType) {
        case ErrorType.Warning: {
            console.warn(`Ink Warning: ${message}`)
            break
        }
        case ErrorType.Author: {
            console.error(`Ink Error from Author: ${message}`)
            break
        }
        case ErrorType.Error: {
            const oMsg = `Ink Error: ${message}`
            console.error(oMsg)
            alert(oMsg)
            throw new Error(oMsg)
        }
    }
}
