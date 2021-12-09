/**
 *    Copyright 2021 The Peacock Project
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

import { createHash } from "crypto"
import arrayEqual from "array-equal"
import { set } from "./lodash-set.js"

export type Globals = any
export type NodeData =
    | string
    | INode
    | Record<string, unknown>
    | boolean
    | Array<NodeData>

/**
 * The globals cache is a map of the globals object's original hash (when stringified) to the current value.
 * This is needed because some nodes change the value, and we need the object to remain consistent, but also
 * because we don't want to have to pass the globals object to basically every function call.
 *
 * If you are using APIs such as {@link findObjectChild} or {@link setObjectChild}, you will need to inject
 * your own globals into this map. The hash doesn't really matter, as long as it doesn't collide with an existing
 * value in the map.
 */
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
        const eachItemPredicate = (item: NodeData) => {
            if (typeof item === "string" && item.includes(".")) {
                return findObjectChild(item, this.globalsHash)
            }

            if (typeof item === "object" && !Array.isArray(item)) {
                return getNewNodes(item, this.globalsHash) ?? item
            }

            return item
        }

        if (!Array.isArray(this.data)) {
            Object.keys(this.data).forEach((key) => {
                this.data[key] = eachItemPredicate(this.data[key])
            })

            return
        }

        this.data = this.data.map(eachItemPredicate)
    }

    abstract solve(): boolean | number
}

/**
 * Given a reference, find the value of a thing which is inside the globals object.
 *
 * @example
 *   // returns globalsObj["$Value"]["RepositoryId"]
 *   findObjectChild("$Value.RepositoryId", someGlobalsHash)
 *
 * @param reference The string that points to the target value.
 * @param globalsHash The hash of the value in the globals cache.
 * @returns The child object, if found, or undefined.
 * @see _globalsCache
 * @see setObjectChild
 */
export function findObjectChild(
    reference: string,
    globalsHash: string
): NodeData | boolean {
    if (reference.includes("#")) {
        return reference
    }

    let obj: any = _globalsCache.get(globalsHash)

    // if we have a global matching the exact name of the reference, this is probably what we want
    if (Object.prototype.hasOwnProperty.call(obj, "reference")) {
        return obj[reference]
    }

    // the thing has a dot in it, which means that its accessing a global
    const parts = reference.split(".")

    for (let part of parts) {
        obj = obj?.[part]
    }

    return obj as NodeData
}

/**
 * Given a reference, set the value of a thing which is inside the globals object.
 * Will throw an error if the globals object doesn't contain a value with the matching name.
 *
 * @example
 *   // sets globalsObj["$Value"]["RepositoryId"] to "hi world :)"
 *   // (and sets the globals cache to the new object)
 *   setObjectChild("$Value.RepositoryId", "hi world :)", someGlobalsHash)
 *
 * @param reference The string that points to the target value.
 * @param newData The thing that the target value should be assigned to.
 * @param globalsHash The hash of the value in the globals cache.
 * @see _globalsCache
 * @see findObjectChild
 * @throws TypeError
 */
export function setObjectChild(
    reference: string,
    newData: any,
    globalsHash: string
): void {
    let obj: any = _globalsCache.get(globalsHash)

    set(obj, reference, newData)

    _globalsCache.set(globalsHash, obj)
}

class EqNode extends INode {
    public constructor(data: NodeData[], globalsHash: string) {
        super(data, globalsHash)
        this.serialize()
    }

    override solve(): boolean {
        let item1 = this.data[0]
        let item2 = this.data[1]

        if (!item1 && item1 !== false) {
            return false
        }

        if (!item2 && item2 !== false) {
            return false
        }

        if (item1.isNode) {
            item1 = item1.solve()
        }

        if (item2.isNode) {
            item2 = item2.solve()
        }

        return Array.isArray(item1) || Array.isArray(item2)
            ? arrayEqual(item1, item2)
            : item1 === item2
    }
}

class AndNode extends INode {
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

            if (item === null || item === undefined) {
                throw new Error(
                    "Looks like your item is either null or undefined, that's not a boolean!!"
                )
            }

            if (item === false) {
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
        let bool: any = item

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

class LtNode extends MathNode {
    public constructor(data: NodeData[], globalsHash: string) {
        super(data, globalsHash)
        this.serialize()
    }

    override solve(): boolean {
        const [item1, item2] = this.items

        return item1 < item2
    }
}

class GtNode extends MathNode {
    public constructor(data: NodeData[], globalsHash: string) {
        super(data, globalsHash)
        this.serialize()
    }

    override solve(): boolean {
        const [item1, item2] = this.items

        return item1 > item2
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
        if (!Array.isArray(this.data)) {
            return false
        }

        return this.data.some((item) => {
            if ((item as INode).isNode) {
                item = (item as INode).solve() as boolean
            }

            return item === true
        })
    }
}

abstract class ISideEffectNode extends INode {
    abstract solveSideEffects(): void

    override solve(): boolean {
        this.solveSideEffects()

        return true
    }
}

export enum BasicMathOperator {
    Addition,
    Subtraction,
    Multiplication,
    Division,
}

class BasicMathOperationsNode extends ISideEffectNode {
    override data: NodeData | NodeData[]
    protected readonly mathOperator: BasicMathOperator

    public constructor(
        mathOperator: BasicMathOperator,
        data: NodeData | NodeData[],
        globalsHash: string
    ) {
        super(data, globalsHash)
        this.mathOperator = mathOperator
    }

    override solveSideEffects(): void {
        if (Array.isArray(this.data)) {
            if (this.data.length < 1) {
                throw new Error(
                    "That's not valid, you can't do $inc or $dec on an empty array!"
                )
            }

            if (this.data.length === 2) {
                // @ts-expect-error
                const curr = findObjectChild(this.data[0], this.globalsHash)
                // @ts-expect-error
                const target = findObjectChild(this.data[1], this.globalsHash)
                setObjectChild(
                    // @ts-expect-error
                    this.data[0],
                    this.mathOperator === BasicMathOperator.Addition
                        ? // @ts-expect-error
                          curr + target
                        : // @ts-expect-error
                          curr - target,
                    this.globalsHash
                )
                return
            }

            if (this.data.length === 3) {
                const [oc1, oc2]: number[] = [
                    findObjectChild(
                        this.data[0] as any,
                        this.globalsHash
                    ) as any,
                    findObjectChild(
                        this.data[1] as any,
                        this.globalsHash
                    ) as any,
                ]

                // 1 * 2 = 3
                setObjectChild(
                    this.data[2] as string,
                    this.mathOperator === BasicMathOperator.Multiplication
                        ? oc1 * oc2
                        : oc1 / oc2,
                    this.globalsHash
                )
                return
            }

            if (this.data.length === 1) {
                this.data = this.data[0]
            }
        }

        const n: number = findObjectChild(
            this.data as string,
            this.globalsHash
        ) as unknown as number

        setObjectChild(
            this.data as string,
            this.mathOperator === BasicMathOperator.Addition ? n + 1 : n - 1,
            this.globalsHash
        )
    }
}

class SetNode extends ISideEffectNode {
    public constructor(data: NodeData[], globalsHash: string) {
        super(data, globalsHash)
    }

    override solveSideEffects(): void {
        setObjectChild(
            this.data[0],
            typeof this.data[1] === "string"
                ? findObjectChild(this.data[1], this.globalsHash)
                : this.data[1],
            this.globalsHash
        )
    }
}

class PushNode extends ISideEffectNode {
    public constructor(data: NodeData[], globalsHash: string) {
        super(data, globalsHash)
    }

    override solveSideEffects(): void {
        const newArray: any[] = findObjectChild(
            this.data[0],
            this.globalsHash
        ) as any[]

        newArray.push(this.data[1])

        setObjectChild(this.data[0] as string, newArray, this.globalsHash)
    }
}

/**
 * The inarray node implementation is special, because it would be extremely difficult to account for
 * every node appearing as the condition inside the "?" key, we instead assume it's an $eq node, and
 * try to transform it into an or node containing an eq node for each item inside the target array.
 *
 * This is a messy solution, and it would be very cool if we didn't have to do this, but here we are.
 */
class InArrayNode extends INode {
    public constructor(data: NodeData, globalsHash: string) {
        super(data, globalsHash)
        this.serialize()
    }

    override solve(): boolean {
        const theArray = this.data["in"]

        const theItem = this.data["?"]

        const nodeCast = theItem as EqNode
        const nodeData = nodeCast.data as NodeData[]

        const arrayItemIndex = (nodeData[0] as string).includes("#") ? 0 : 1

        const e: string[][] = []

        theArray.forEach((val) => {
            if (arrayItemIndex === 0) {
                e.push([val, nodeData[1]])
            } else {
                e.push([nodeData[0], val])
            }
        })

        // it better be an equals node, or I will literally scream at the top of my lungs "WHYYY"
        this.data["?"] = new OrNode(
            e.map((conds) => new EqNode(conds, this.globalsHash)),
            this.globalsHash
        )

        return (this.data["?"] as OrNode).solve()
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
        $div?: D
        $inc?: D
        $dec?: D
        $gt?: D
        $lt?: D
        $after?: D
        $or?: D
        $set?: D
        $push?: D
        $inarray?: {
            in: D
            "?": D
        }
    }

    if (node === null) {
        return null
    }

    if ((node as INode).isNode) {
        // @ts-expect-error This node is already a class object.
        return node
    }

    if (node.$eq) {
        // @ts-expect-error Array.
        return new EqNode(node.$eq, globalsHash)
    }

    if (node.$and) {
        // @ts-expect-error Array.
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

    if (node.$gt) {
        // @ts-expect-error Array.
        return new GtNode(node.$gt, globalsHash)
    }

    if (node.$lt) {
        // @ts-expect-error Array.
        return new LtNode(node.$lt, globalsHash)
    }

    if (node.$inc) {
        return new BasicMathOperationsNode(
            BasicMathOperator.Addition,
            node.$inc,
            globalsHash
        )
    }

    if (node.$dec) {
        return new BasicMathOperationsNode(
            BasicMathOperator.Subtraction,
            node.$dec,
            globalsHash
        )
    }

    if (node.$mul) {
        return new BasicMathOperationsNode(
            BasicMathOperator.Multiplication,
            node.$mul,
            globalsHash
        )
    }

    if (node.$div) {
        return new BasicMathOperationsNode(
            BasicMathOperator.Division,
            node.$div,
            globalsHash
        )
    }

    if (node.$set) {
        // @ts-expect-error Array.
        return new SetNode(node.$set, globalsHash)
    }

    if (node.$push) {
        // @ts-expect-error Array.
        return new PushNode(node.$push, globalsHash)
    }

    if (node.$after) {
        return new TimerAfterNode(node.$after, globalsHash)
    }

    if (node.$or) {
        // @ts-expect-error Array.
        return new OrNode(node.$or, globalsHash)
    }

    if (node.$inarray) {
        return new InArrayNode(node.$inarray, globalsHash)
    }

    console.warn(`no possible solver for ${JSON.stringify(node)}`)
    return null
}

function calculateGlobalsHash(globals: Globals): string {
    const hash = createHash("sha256")

    hash.update(JSON.stringify(globals))

    return hash.digest("hex")
}

/**
 * The result returned by {@link check}.
 *
 * @see check
 */
export type CheckResult<Globals> = {
    /**
     * If the statemachine returned true or not.
     */
    bool: boolean
    /**
     * The new (and potentially modified) globals object.
     */
    globals: Globals
}

/**
 * Check if the given statemachine would return true, with globals as the context it is run in.
 *
 * @example
 *   check({ $eq: [true, true] }, {}).bool // -> true, since true equals true
 *
 * @param stateMachineConds The statemachine.
 * @param globals The context the statemachine is being run in (e.g. an event value or the `Context` object in an objective's definition).
 * @returns The result of the check.
 * @throws Error
 */
export function check<Globals = any>(
    stateMachineConds: any,
    globals: Globals
): CheckResult<Globals> {
    if (stateMachineConds === undefined || stateMachineConds === null) {
        throw new TypeError(
            "The statemachine conditions can't be null or undefined!"
        )
    }

    if (globals === undefined || globals === null) {
        throw new TypeError("Globals can't be null or undefined!")
    }

    const globalsHash = calculateGlobalsHash(globals)
    // @ts-expect-error Record mismatch.
    _globalsCache.set(globalsHash, globals)

    const n = getNewNodes(stateMachineConds, globalsHash)

    const result = n?.solve() as boolean // should be a boolean

    const finalGlobals = _globalsCache.get(globalsHash)

    _globalsCache.delete(globalsHash)

    return {
        bool: result,
        globals: finalGlobals as Globals,
    }
}
