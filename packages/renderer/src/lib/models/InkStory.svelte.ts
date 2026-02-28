import { Story } from "inkjs"
import { ErrorType } from "inkjs/engine/Error"

export class ReactiveInkStory {
    private story: [version: number, Story] = $state.raw([0, null as unknown as Story /* Init in Ctor */])

    getInnerStoryWithoutReactivity() {
        return this.story[1]
    }

    private markStateAsDirty() {
        const newState: [version: number, Story] = [...this.story]
        newState[0]++
        if (newState[0] > 255) newState[0] = 0
        this.story = newState
    }

    markStateAsDirtyFromExternal({ Justification }: { Justification: string }) {
        if (typeof Justification !== "string" || Justification.length <= 3)
            throw new Error("You need your justification to mark the state as dirty from external libs")
        this.markStateAsDirty()
    }

    private constructor(storyContent: string) {
        this.story[1] = new Story(storyContent)
        this.story[1].onError = this.defaultHandler_onError
    }

    static new(storyContent: string) {
        return new ReactiveInkStory(storyContent)
    }

    private defaultHandler_onError = (message: string, type: ErrorType) => {
        switch (type) {
            case ErrorType.Warning:
                console.warn(`Ink Warning: ${message}`)
                break
            case ErrorType.Author:
                console.error(`Ink Error from Author: ${message}`)
                break
            case ErrorType.Error:
                console.error(`Ink Error: ${message}`)
                break
            default:
                console.error(`Ink Unknown Error Type: ${type}, Message: ${message}`)
                break
        }
    }

    get currentText() {
        return this.story[1].currentText
    }

    get canContinue() {
        return this.story[1].canContinue
    }

    continue() {
        this.markStateAsDirty()
        return this.story[1].Continue()
    }

    get currentChoices() {
        return this.story[1].currentChoices
    }

    chooseChoiceIndex(choiceIdx: number) {
        this.markStateAsDirty()
        return this.story[1].ChooseChoiceIndex(choiceIdx)
    }

    get globalTags() {
        return this.story[1].globalTags
    }

    get currentTags() {
        return this.story[1].currentTags
    }

    getTagsForContentAtPath(path: string) {
        return this.story[1].TagsForContentAtPath(path)
    }

    warning(message: string) {
        this.markStateAsDirty()
        this.story[1].Warning(message)
    }

    // Justification: To mimic the original behavior, here we choose `any[]` for the `args` parameter.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    choosePathString(path: string, resetCallstack?: boolean, args?: any[]) {
        this.markStateAsDirty()
        this.story[1].ChoosePathString(path, resetCallstack, args)
    }

    getVariableState(name: string) {
        return this.story[1].variablesState.$(name)
    }

    // Justification: To mimic the original behavior, here we choose `any` for the `value` parameter.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setVariableState(name: string, value: any) {
        this.markStateAsDirty()
        return this.story[1].variablesState.$(name, value)
    }

    getCurrentVisitCountAtPathString(pathString: string) {
        return this.story[1].state.VisitCountAtPathString(pathString)
    }

    addVariableObserver(variableName: string, observer: Story.VariableObserver) {
        this.story[1].ObserveVariable(variableName, observer)
    }

    // Justification: To mimic the original behavior, here we choose `any[]` for the `args` parameter.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    evaluateFunction(functionName: string, args?: any[], returnTextOutput?: boolean) {
        this.markStateAsDirty()
        return this.story[1].EvaluateFunction(functionName, args, returnTextOutput)
    }

    // Justification: To mimic the original behavior, here we choose `any[]` and `any` for the `externalFunction` parameter.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bindExternalFunction(functionName: string, externalFunction: (...args: any[]) => any, lookaheadSafe?: boolean) {
        return this.story[1].BindExternalFunction(functionName, externalFunction, lookaheadSafe)
    }

    saveToStateJson(indented?: boolean) {
        return this.story[1].state.ToJson(indented)
    }

    recoverFromStateJson(json: string) {
        this.markStateAsDirty()
        return this.story[1].state.LoadJson(json)
    }
}
