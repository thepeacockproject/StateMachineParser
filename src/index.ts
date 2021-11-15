export type Globals = Record<string, string | boolean | number>

abstract class INode {
    protected constructor(data: unknown[], globals: Globals) {
        this.data = data
        this.globals = globals
    }

    isNode = true

    data: unknown[]
    globals: Globals

    serialize() {
        let i = 0

        while (this.data && this.data[i]) {
            let item = this.data[i]

            if (typeof item === "string" && item.includes(".")) {
                item = $referenceToData(item, this.globals)
            }

            if (typeof item === "object") {
                item = getNewNodes(item, this.globals)
            }

            this.data[i] = item
            i++
        }
    }

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
        this.serialize()
    }

    solve(): boolean {
        let item1 = this.data[0]
        let item2 = this.data[1]

        if (item1.isNode) {
            item1 = item1.solve()
        }

        if (item2.isNode) {
            item2 = item2.solve()
        }

        return item1 === item2
    }
}

class AndNode extends INode {
    public constructor(data: unknown[], globals: Globals) {
        super(data, globals)
        this.serialize()
    }

    solve(): boolean {
        let i = 0

        while (this.data && this.data[i]) {
            let item = this.data[i]

            if (item.isNode) {
                item = item.solve()
            }

            if (!item) {
                return false
            }

            i++
        }

        return true
    }
}

class NotNode extends INode {
    public constructor(data: unknown[], globals: Globals) {
        super(data, globals)
        this.serialize()
    }

    solve(): boolean {
        let item = this.data as INode
        let bool = false

        if ((item as INode).isNode) {
            bool = item.solve()
        }

        return !bool
    }
}

function hasOwn(target: unknown, value: string): boolean {
    return Object.prototype.hasOwnProperty.call(target, value)
}

function getNewNodes(parent: unknown, globals: Globals): undefined | INode {
    if (hasOwn(parent, "$eq")) {
        return new EqNode(parent.$eq, globals)
    }

    if (hasOwn(parent, "$and")) {
        return new AndNode(parent.$and, globals)
    }

    if (hasOwn(parent, "$not")) {
        return new NotNode(parent.$not, globals)
    }
}

export class StateMachine {
    globals: Globals

    constructor(globals: Globals) {
        this.globals = globals
    }

    check(params: unknown): boolean {
        const n = getNewNodes(params, this.globals)
        return n.solve() // should be a boolean
    }
}
