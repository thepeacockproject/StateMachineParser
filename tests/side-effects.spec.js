const { check } = require("../build/cjs/index")

const data = {
    Set1: [
        {
            $set: ["MyContextObject", "OtherContextObject"],
        },
        {
            MyContextObject: 1,
            OtherContextObject: 5,
        },
    ],
    Set2: [
        {
            $set: ["Some.Context.Object", 103],
        },
        {
            Some: {
                Context: {
                    Object: 0,
                },
            },
        },
    ],
}

describe("$set node", () => {
    it("can set a basic context object", () => {
        const [sm, globals] = data.Set1
        const r = check(sm, globals)
        expect(r.globals.MyContextObject).toEqual(5)
        expect(r.globals.OtherContextObject).toEqual(5)
    })

    it("can set a basic context object to a literal value", () => {
        const [sm, globals] = data.Set2
        const r = check(sm, globals)
        expect(r.globals.Some.Context.Object).toEqual(103)
    })
})
