import { createHash } from "crypto"

export type Globals = Record<string, string | boolean | number>

export const _globalsCache: Map<string, Record<string, unknown>> = new Map()

abstract class INode {
    protected constructor(data: unknown | unknown[], globalsHash: string) {
        this.data = data
        this.globalsHash = globalsHash
        this.serialize()
    }

    isNode = true

    data: unknown | unknown[]
    globalsHash: string

    protected serialize() {
        let i = 0

        while (this.data && this.data[i]) {
            let item = this.data[i]

            if (typeof item === "string" && item.includes(".")) {
                item = $referenceToData(item, this.globalsHash)
            }

            if (typeof item === "object") {
                item = getNewNodes(item, this.globalsHash)
            }

            this.data[i] = item
            i++
        }
    }

    abstract solve(): boolean | number
}

function $referenceToData(reference: unknown, globalsHash: string) {
    const clone = `${reference}`
    reference = _globalsCache.get(globalsHash)
    // the thing has a dot in it, which means that its accessing a global
    const parts = clone.split(".")

    // this should iterate through it until we have the final child
    for (const part of parts) {
        reference = reference?.[part]
    }

    return reference
}

class EqNode extends INode {
    public constructor(data: unknown | unknown[], globalsHash: string) {
        super(data, globalsHash)
    }

    override solve(): boolean {
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
    public constructor(data: unknown | unknown[], globalsHash: string) {
        super(data, globalsHash)
    }

    override solve(): boolean {
        let i = 0

        while (this.data && this.data[i]) {
            let item = this.data[i]

            if (item.isNode) {
                item = item.solve() as boolean
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
    public constructor(data: unknown | unknown[], globalsHash: string) {
        super(data, globalsHash)
    }

    override solve(): boolean {
        let item = this.data as INode
        let bool = false

        if ((item as INode).isNode) {
            bool = item.solve() as boolean
        }

        return !bool
    }
}

class PushUniqueNode extends INode {
    public constructor(data: unknown | unknown[], globalsHash: string) {
        super(data, globalsHash)
    }

    override solve(): boolean {
        let item1 = this.data[0]
        let item2 = this.data[1] as unknown[]

        const currentLength = item2.length

        return currentLength !== item2.push(item1)
    }
}

class MulNode extends INode {
    public constructor(data: unknown | unknown[], globalsHash: string) {
        super(data, globalsHash)
    }

    override solve(): number {
        let num = 1
        let i = 0

        while (this.data && this.data[i]) {
            num *= this.data[i] as number
            i++
        }

        return num
    }
}

function hasOwn(target: unknown, value: string): boolean {
    return Object.prototype.hasOwnProperty.call(target, value)
}

function getNewNodes(parent: unknown, globalsHash: string): undefined | INode {
    if (hasOwn(parent, "$eq")) {
        return new EqNode((parent as { $eq: unknown })["$eq"], globalsHash)
    }

    if (hasOwn(parent, "$and")) {
        return new AndNode(parent["$and"], globalsHash)
    }

    if (hasOwn(parent, "$not")) {
        return new NotNode(parent["$not"], globalsHash)
    }

    if (hasOwn(parent, "$pushunique")) {
        return new PushUniqueNode(parent["$pushunique"], globalsHash)
    }

    if (hasOwn(parent, "$mul")) {
        return new MulNode(parent["$mul"], globalsHash)
    }
}

function calculateGlobalsHash(globals: Globals): string {
    const hash = createHash("sha256")

    hash.update(JSON.stringify(globals))

    return hash.digest("hex")
}

export class StateMachine {
    protected _globalsHash: string

    public constructor(globals: Globals) {
        const globalsHash = (this._globalsHash = calculateGlobalsHash(globals))

        _globalsCache.set(globalsHash, globals)
    }

    public check(params: unknown): boolean {
        const n = getNewNodes(params, this._globalsHash)
        return n.solve() as boolean // should be a boolean
    }
}
