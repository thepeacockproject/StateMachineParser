/*!
 * lodash (Custom Build) <https://lodash.com/>
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 *
 * See https://github.com/lodash/lodash/blob/ddfd9b11a0126db2302cb70ec9973b66baec0975/LICENSE for the full license text.
 *
 * MODIFIED VERSION OF https://github.com/lodash/lodash/blob/4.3.2-npm-packages/lodash.set/index.js
 * Much smaller, and has statemachine-parser specific tweaks.
 */

// @ts-nocheck

const HASH_UNDEFINED = "__peacock_lodash_hash_undefined__"

const INFINITY = 1 / 0,
    MAX_SAFE_INTEGER = 9007199254740991

const reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/,
    reLeadingDot = /^\./,
    rePropName =
        /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g

const reEscapeChar = /\\(\\)?/g
const reIsUint = /^(?:0|[1-9]\d*)$/

const objectProto = Object.prototype

const hasOwnProperty = objectProto.hasOwnProperty
const objectToString = objectProto.toString

const symbolToString = Symbol.prototype.toString

function Hash(entries) {
    let index = -1,
        length = entries ? entries.length : 0

    this.clear()
    while (++index < length) {
        const entry = entries[index]
        this.set(entry[0], entry[1])
    }
}

function hashClear(): void {
    this.__data__ = Object.create(null)
}

function hashDelete(key) {
    return this.has(key) && delete this.__data__[key]
}

function hashGet(key) {
    const data = this.__data__
    const result = data[key]
    return result === HASH_UNDEFINED ? undefined : result
}

function hashHas(key): boolean {
    const data = this.__data__
    return data[key] !== undefined
}

function hashSet(key, value) {
    const data = this.__data__
    data[key] = value === undefined ? HASH_UNDEFINED : value
    return this
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear
Hash.prototype["delete"] = hashDelete
Hash.prototype.get = hashGet
Hash.prototype.has = hashHas
Hash.prototype.set = hashSet

function MapCache(entries) {
    let index = -1,
        length = entries ? entries.length : 0

    this.clear()
    while (++index < length) {
        const entry = entries[index]
        this.set(entry[0], entry[1])
    }
}

function mapCacheClear() {
    this.__data__ = {
        hash: new Hash(),
        map: new Map(),
        string: new Hash(),
    }
}

function mapCacheDelete(key) {
    return getMapData(this, key)["delete"](key)
}

function mapCacheGet(key) {
    return getMapData(this, key).get(key)
}

function mapCacheHas(key): boolean {
    return getMapData(this, key).has(key)
}

function mapCacheSet(key, value) {
    getMapData(this, key).set(key, value)
    return this
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear
MapCache.prototype["delete"] = mapCacheDelete
MapCache.prototype.get = mapCacheGet
MapCache.prototype.has = mapCacheHas
MapCache.prototype.set = mapCacheSet

function assignValue(object, key, value) {
    const objValue = object[key]
    if (
        !(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
        (value === undefined && !(key in object))
    ) {
        object[key] = value
    }
}

function baseSet(object, path, value, customizer) {
    if (!isObject(object)) {
        return object
    }
    path = isKey(path, object) ? [path] : castPath(path)

    let index = -1,
        length = path.length,
        lastIndex = length - 1,
        nested = object

    while (nested != null && ++index < length) {
        let key = toKey(path[index]),
            newValue = value

        if (index !== lastIndex) {
            let objValue = nested[key]
            newValue = customizer
                ? customizer(objValue, key, nested)
                : undefined
            if (newValue === undefined) {
                newValue = isObject(objValue)
                    ? objValue
                    : isIndex(path[index + 1])
                    ? []
                    : {}
            }
        }
        assignValue(nested, key, newValue)
        nested = nested[key]
    }
    return object
}

function baseToString(value) {
    // Exit early for strings to avoid a performance hit in some environments.
    if (typeof value === "string") {
        return value
    }
    if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : ""
    }
    const result = value + ""
    return result === "0" && 1 / value === -INFINITY ? "-0" : result
}

function castPath(value) {
    return isArray(value) ? value : stringToPath(value)
}

function getMapData(map, key) {
    const data = map.__data__
    return isKeyable(key)
        ? data[typeof key === "string" ? "string" : "hash"]
        : data.map
}

function isIndex(value, length): boolean {
    length = length == null ? MAX_SAFE_INTEGER : length
    return (
        !!length &&
        (typeof value == "number" || reIsUint.test(value)) &&
        value > -1 &&
        value % 1 === 0 &&
        value < length
    )
}

function isKey(value, object): boolean {
    if (isArray(value)) {
        return false
    }
    const type = typeof value
    if (
        type === "number" ||
        type === "symbol" ||
        type === "boolean" ||
        value === null ||
        isSymbol(value)
    ) {
        return true
    }
    return (
        reIsPlainProp.test(value) ||
        !reIsDeepProp.test(value) ||
        (object != null && value in Object(object))
    )
}

function isKeyable(value): boolean {
    const type = typeof value
    return type === "string" ||
        type === "number" ||
        type === "symbol" ||
        type === "boolean"
        ? value !== "__proto__"
        : value === null
}

const stringToPath = memoize((string) => {
    string = toString(string)

    const result = []
    if (reLeadingDot.test(string)) {
        result.push("")
    }
    string.replace(rePropName, (match, number, quote, string) => {
        result.push(
            quote ? string.replace(reEscapeChar, "$1") : number || match
        )
    })
    return result
})

function toKey(value): string {
    if (typeof value == "string" || isSymbol(value)) {
        return value
    }
    const result = value + ""
    return result === "0" && 1 / value === -INFINITY ? "-0" : result
}

function memoize(func, resolver) {
    if (
        typeof func != "function" ||
        (resolver && typeof resolver != "function")
    ) {
        throw new TypeError("Expected a function")
    }
    const memoized = function () {
        const args = arguments,
            key = resolver ? resolver.apply(this, args) : args[0],
            cache = memoized.cache

        if (cache.has(key)) {
            return cache.get(key)
        }
        const result = func.apply(this, args)
        memoized.cache = cache.set(key, result)
        return result
    }
    memoized.cache = new (memoize.Cache || MapCache)()
    return memoized
}

// Assign cache to `_.memoize`.
memoize.Cache = MapCache

function eq(value, other): boolean {
    return value === other || (value !== value && other !== other)
}

const isArray = Array.isArray

function isObject(value): boolean {
    const type = typeof value
    return !!value && (type === "object" || type === "function")
}

function isObjectLike(value): boolean {
    return !!value && typeof value === "object"
}

function isSymbol(value): boolean {
    return (
        typeof value === "symbol" ||
        (isObjectLike(value) &&
            objectToString.call(value) === "[object Symbol]")
    )
}

function toString(value): string {
    return value === null ? "" : baseToString(value)
}

function set(object: any, path: string, value: any) {
    return object === null ? object : baseSet(object, path, value)
}

export { set }
