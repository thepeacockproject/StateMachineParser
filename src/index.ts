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

function $referenceToData(reference: unknown, globalsHash: string): unknown | boolean {
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

//#region Math ($gt, $lt)

/**
 * A math based node.
 */
abstract class MathNode extends INode {
    protected constructor(data: unknown | unknown[], globalsHash: string) {
        super(data, globalsHash)
    }

    protected get items() {
        let item1 = this.data[0]
        let item2 = this.data[1]

        if (item1.isNode) {
            item1 = item1.solve()
        }

        if (item2.isNode) {
            item2 = item2.solve()
        }

        return [item1, item2]
    }
}

class LeNode extends MathNode {
    public constructor(data: unknown | unknown[], globalsHash: string) {
        super(data, globalsHash)
    }

    override solve(): boolean {
        const [item1, item2] = this.items

        return item1 <= item2
    }
}

class GeNode extends MathNode {
    public constructor(data: unknown | unknown[], globalsHash: string) {
        super(data, globalsHash)
    }

    override solve(): boolean {
        const [item1, item2] = this.items

        return item1 >= item2
    }
}

//#endregion

class TimerAfterNode extends INode {
    public constructor(data: unknown | unknown[], globalsHash: string) {
        super(data, globalsHash)
    }

    solve(): boolean {
        // timers will run out eventually
        return true
    }
}

class OrNode extends INode {
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

            if (item === true) {
                return true
            }

            i++
        }

        return false
    }
}

function getNewNodes(parent: unknown, globalsHash: string): undefined | INode {
    const node = parent as {
        $eq?: unknown
        $and?: unknown
        $not?: unknown
        $pushunique?: unknown
        $mul?: unknown
        $ge?: unknown
        $le?: unknown
        $after?: unknown
        $or?: unknown
        in?: string
        "?"?: unknown
    }

    if (node.$eq) {
        return new EqNode(node.$eq, globalsHash)
    }

    if (node.$and) {
        return new AndNode(node.$and, globalsHash)
    }

    if (node.$not) {
        return new NotNode(node.$not, globalsHash)
    }

    if (node.$pushunique) {
        return new PushUniqueNode(node.$pushunique, globalsHash)
    }

    if (node.$mul) {
        return new MulNode(node.$mul, globalsHash)
    }

    if (node.$ge) {
        return new GeNode(node.$ge, globalsHash)
    }

    if (node.$le) {
        return new LeNode(node.$le, globalsHash)
    }

    if (node.$after) {
        return new TimerAfterNode(node.$after, globalsHash)
    }

    if (node.$or) {
        return new OrNode(node.$or, globalsHash)
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
