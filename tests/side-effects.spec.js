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
    Inc1: [
        {
            $inc: ["Some.Context.Object", 6],
        },
        {
            Some: {
                Context: {
                    Object: 1,
                },
            },
        },
    ],
    Inc2: [
        {
            $inc: "Context.Object",
        },
        {
            Context: {
                Object: 150150,
            },
        },
    ],
    Dec1: [
        {
            $dec: ["Some.Context.Object", 6],
        },
        {
            Some: {
                Context: {
                    Object: 5,
                },
            },
        },
    ],
    Dec2: [
        {
            $dec: "Context.Object",
        },
        {
            Context: {
                Object: 150150,
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

describe("math nodes", () => {
    describe("$inc", () => {
        it("can increment a context object", () => {
            const [sm, globals] = data.Inc1
            const r = check(sm, globals)
            expect(r.globals.Some.Context.Object).toEqual(7)
        })

        it("can increment a context object with no amount specified", () => {
            const [sm, globals] = data.Inc2
            const r = check(sm, globals)
            expect(r.globals.Context.Object).toEqual(150151)
        })
    })

    describe("$dec", () => {
        it("can decrement a context object", () => {
            const [sm, globals] = data.Dec1
            const r = check(sm, globals)
            expect(r.globals.Some.Context.Object).toEqual(-1)
        })

        it("can decrement a context object with no amount specified", () => {
            const [sm, globals] = data.Dec2
            const r = check(sm, globals)
            expect(r.globals.Context.Object).toEqual(150149)
        })
    })
})
