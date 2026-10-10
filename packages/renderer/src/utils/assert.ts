export class AssertionError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options)
        this.name = "AssertionError"
    }
}

export function assert(expr: unknown, msg: string): asserts expr {
    if (!expr) {
        throw new AssertionError(msg)
    }
}
