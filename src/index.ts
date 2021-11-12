export type Globals = Record<string, string | boolean | number>

abstract class INode {
    protected constructor(data: unknown, globals: Globals) {
        this.data = data
        this.isSolved = false
        this.globals = globals
    }

    data
    globals: Globals
    isSolved: boolean

    abstract solve(): boolean
}

function $referenceToData(reference: unknown, globals: Globals) {
    const clone = `${reference}`
    reference = globals
    // the thing has a dot in it, which means that its accessing a global
    const parts = clone.split(".")

    // this should iterate through it until we have the final child
    for (const part of parts) {
        reference = reference?.[part]
    }

    return reference
}

class EqNode extends INode {
    data: unknown[]

    public constructor(data: unknown[], globals: Globals) {
        super(data, globals)
    }

    solve(): boolean {
        let item1 = this.data[0]
        let item2 = this.data[1]

        if (typeof item1 === "string" && item1.includes(".")) {
            item1 = $referenceToData(item1, this.globals)
        }

        if (typeof item2 === "string" && item2.includes(".")) {
            item2 = $referenceToData(item2, this.globals)
        }

        return item1 === item2
    }
}

function hasOwn(target: unknown, value: string): boolean {
    return Object.prototype.hasOwnProperty.call(target, value)
}

function getNewNodes(parent: unknown, globals: Globals, callback): undefined | INode {
    if (hasOwn(parent, "$eq")) {
        return new EqNode(parent.$eq, globals)
    }
}

export class StateMachine {
    globals: Globals

    constructor(globals: Globals) {
        this.globals = globals
    }

    check<T = unknown>(params: T): boolean {
        const pendingNodes = []

        const n = getNewNodes(params, this.globals, (o) => pendingNodes.push(o))

        if (n) {
            pendingNodes.push(n)
        }

        let allAreEq = true

        return allAreEq
    }
}
