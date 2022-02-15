const { test } = require("../src/index")

const data = {
    Inarray1: [
        {
            $inarray: {
                in: "$Value.Objs",
                "?": {
                    $eq: ["$.#", "quiet"],
                },
            },
        },
        {
            Value: {
                Objs: ["the", "world", "is", "quiet", "here"],
            },
        },
    ],
    Inarray2: [
        {
            $inarray: {
                in: "$Value.Objs",
                "?": {
                    $eq: ["$.#", "clarinet"],
                },
            },
        },
        {
            Value: {
                Objs: ["flute", "saxophone", "trumpet", "bass guitar", "drums"],
            },
        },
    ],
}

describe("$inarray", () => {
    it("can find a string in a context array", () => {
        const [sm, globals] = data.Inarray1
        expect(test(sm, globals)).toBe(true)
    })

    it("returns false if the item isn't present", () => {
        const [sm, globals] = data.Inarray2
        expect(test(sm, globals)).toBe(false)
    })
})
