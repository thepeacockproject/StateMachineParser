const { check } = require("../build/cjs/index")

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
            $Value: {
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
            $Value: {
                Objs: ["flute", "saxophone", "trumpet", "bass guitar", "drums"],
            },
        },
    ],
}

it("can find a string in a context array", () => {
    const [sm, globals] = data.Inarray1
    expect(check(sm, globals).bool).toBe(true)
})

it("returns false if the item isn't present", () => {
    const [sm, globals] = data.Inarray2
    expect(check(sm, globals).bool).toBe(false)
})
