import { createHash } from "crypto"

export type Globals = Record<string, string | boolean | number>
export type NodeData =
    | string
    | INode
    | Record<string, unknown>
    | boolean
    | Array<NodeData>

export const _globalsCache: Map<string, Record<string, unknown>> = new Map()

abstract class INode {
    protected constructor(data: NodeData, globalsHash: string) {
        this.data = data
        this.globalsHash = globalsHash
    }

    /**
     * Used to determine if a data object is a node instance or not.
     */
    isNode = true

    data: NodeData
    globalsHash: string

    /**
     * Modifies the data fields to match what they would at runtime.
     * Also transforms object children into INode instances.
     *
     * @protected
     */
    protected serialize(): void {
        let i = 0

        while (this.data && this.data[i]) {
            let item: NodeData = this.data[i]

            if (typeof item === "string" && item.includes(".")) {
                item = $referenceToData(item, this.globalsHash)
            }

            if (typeof item === "object") {
                item = getNewNodes(item, this.globalsHash)!

                if (item === undefined) {
                    continue
                }
            }

            this.data[i] = item
            i++
        }
    }

    abstract solve(): boolean | number
}

function $referenceToData(
    reference: unknown,
    globalsHash: string
): NodeData | boolean {
    const clone = `${reference}`
    reference = _globalsCache.get(globalsHash)
    // the thing has a dot in it, which means that its accessing a global
    const parts = clone.split(".")

    // this should iterate through it until we have the final child
    for (const part of parts) {
        reference = reference?.[part]
    }

    // @ts-expect-error Literal object child finding.
    return reference
}

class EqNode extends INode {
    public constructor(data: NodeData, globalsHash: string) {
        super(data, globalsHash)
        this.serialize()
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
    public constructor(data: NodeData | NodeData[], globalsHash: string) {
        super(data, globalsHash)
        this.serialize()
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
    public constructor(data: NodeData, globalsHash: string) {
        super(data, globalsHash)
        this.serialize()
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
    public constructor(data: NodeData[], globalsHash: string) {
        super(data, globalsHash)
        this.serialize()
    }

    override solve(): boolean {
        let item1 = this.data[0]
        let item2 = this.data[1] as unknown[]

        const currentLength = item2.length

        return currentLength !== item2.push(item1)
    }
}

class MulNode extends INode {
    public constructor(data: NodeData[], globalsHash: string) {
        super(data, globalsHash)
        this.serialize()
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
    protected constructor(data: NodeData[], globalsHash: string) {
        super(data, globalsHash)
        this.serialize()
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
    public constructor(data: NodeData[], globalsHash: string) {
        super(data, globalsHash)
        this.serialize()
    }

    override solve(): boolean {
        const [item1, item2] = this.items

        return item1 <= item2
    }
}

class GeNode extends MathNode {
    public constructor(data: NodeData[], globalsHash: string) {
        super(data, globalsHash)
        this.serialize()
    }

    override solve(): boolean {
        const [item1, item2] = this.items

        return item1 >= item2
    }
}

//#endregion

class TimerAfterNode extends INode {
    public constructor(data: NodeData, globalsHash: string) {
        super(data, globalsHash)
        this.serialize()
    }

    solve(): boolean {
        // timers will run out eventually
        return true
    }
}

class OrNode extends INode {
    public constructor(data: NodeData[], globalsHash: string) {
        super(data, globalsHash)
        this.serialize()
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
    type D = NodeData

    const node = parent as {
        $eq?: D
        $and?: D
        $not?: D
        $pushunique?: D
        $mul?: D
        $ge?: D
        $le?: D
        $after?: D
        $or?: D
        $inarray: {
            in?: D
            "?"?: D
        }
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
        // @ts-expect-error Array.
        return new PushUniqueNode(node.$pushunique, globalsHash)
    }

    if (node.$mul) {
        // @ts-expect-error Array.
        return new MulNode(node.$mul, globalsHash)
    }

    if (node.$ge) {
        // @ts-expect-error Array.
        return new GeNode(node.$ge, globalsHash)
    }

    if (node.$le) {
        // @ts-expect-error Array.
        return new LeNode(node.$le, globalsHash)
    }

    if (node.$after) {
        return new TimerAfterNode(node.$after, globalsHash)
    }

    if (node.$or) {
        // @ts-expect-error Array.
        return new OrNode(node.$or, globalsHash)
    }

    console.warn(`no possible solver for ${JSON.stringify(node)}`)
    return null
}

function calculateGlobalsHash(globals: Globals): string {
    const hash = createHash("sha256")

    hash.update(JSON.stringify(globals))

    return hash.digest("hex")
}

export function check(stateMachineConds: unknown, globals: Globals): boolean {
    const globalsHash = calculateGlobalsHash(globals)
    _globalsCache.set(globalsHash, globals)

    const n = getNewNodes(stateMachineConds, globalsHash)

    const result = n?.solve() as boolean // should be a boolean

    _globalsCache.delete(globalsHash)

    return result
}
