/**
 *    Copyright 2022 The Peacock Project
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

// @ts-nocheck

/**
 * Dependency 'dset'.
 * @license MIT
 * @see https://github.com/lukeed/dset/blob/master/src/index.js
 * @internal
 */
export function set(obj, keys: string | string[], val): void {
    if (typeof keys === "string") {
        keys = keys.split(".")
    }

    let i = 0,
        len = keys.length,
        curr = obj,
        currKey,
        key

    while (i < len) {
        key = keys[i++]

        // prevent prototype pollution
        if (
            key === "__proto__" ||
            key === "constructor" ||
            key === "prototype"
        ) {
            break
        }

        if (i === len) {
            curr = curr[key] = val
            continue
        }

        // noinspection PointlessArithmeticExpressionJS
        curr = curr[key] =
            typeof (currKey = curr[key]) === typeof keys
                ? currKey
                : keys[i] * 0 !== 0 || !!~("" + keys[i]).indexOf(".")
                ? {}
                : []
    }
}

/**
 * SHA1 from tiny-hashes.
 * @license MIT
 * @see https://github.com/jbt/tiny-hashes/blob/master/sha1/sha1.js
 * @internal
 */
export function sha1(b: string) {
    let i,
        W = [],
        A,
        B: number,
        C: number,
        D: number,
        h: number[] = [(A = 0x67452301), (B = 0xefcdab89), ~A, ~B, 0xc3d2e1f0],
        words: number[] = [],
        s = decodeURI(encodeURI(b)) + "\x80",
        j = s.length

    words[(b = (--j / 4 + 2) | 15)] = j * 8

    for (; ~j; ) {
        words[j >> 2] |= s.charCodeAt(j) << (8 * ~j--)
    }

    for (i = j = 0; i < b; i += 16) {
        A = h

        for (
            ;
            j < 80;
            A = [
                A[4] +
                    (W[j] = j < 16 ? ~~words[i + j] : (s * 2) | (s < 0)) +
                    1518500249 +
                    [
                        (B & C) | (~B & D),
                        (s = (B ^ C ^ D) + 341275144),
                        ((B & C) | (B & D) | (C & D)) + 882459459,
                        s + 1535694389,
                    ][(j++ / 5) >> 2] +
                    (((s = A[0]) << 5) | (s >>> 27)),
                s,
                (B << 30) | (B >>> 2),
                C,
                D,
            ]
        ) {
            s = W[j - 3] ^ W[j - 8] ^ W[j - 14] ^ W[j - 16]
            B = A[1]
            C = A[2]
            D = A[3]
        }

        for (j = 5; j; ) {
            h[--j] += A[j]
        }
    }

    for (s = ""; j < 40; ) {
        s += ((h[j >> 3] >> ((7 - j++) * 4)) & 15).toString(16)
    }

    return s
}
