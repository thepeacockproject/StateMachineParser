const { handleActions } = require("../src/index")

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
    Mul1: [
        {
            $mul: ["Context.Object", 5, "Context.Object"],
        },
        {
            Context: {
                Object: 18,
            },
        },
    ],
    Div1: [
        {
            $div: ["Context.Object", 5, "Context.Object"],
        },
        {
            Context: {
                Object: 90,
            },
        },
    ],
}

describe("$set node", () => {
    it("can set a basic context object", () => {
        const [sm, globals] = data.Set1
        const r = handleActions(sm, globals)
        expect(r.MyContextObject).toEqual(5)
        expect(r.OtherContextObject).toEqual(5)
    })

    it("can set a basic context object to a literal value", () => {
        const [sm, globals] = data.Set2
        const r = handleActions(sm, globals)
        expect(r.Some.Context.Object).toEqual(103)
    })
})

describe("math nodes", () => {
    describe("$inc", () => {
        it("can increment a context object", () => {
            const [sm, globals] = data.Inc1
            const r = handleActions(sm, globals)
            expect(r.Some.Context.Object).toEqual(7)
        })

        it("can increment a context object with no amount specified", () => {
            const [sm, globals] = data.Inc2
            const r = handleActions(sm, globals)
            expect(r.Context.Object).toEqual(150151)
        })
    })

    describe("$dec", () => {
        it("can decrement a context object", () => {
            const [sm, globals] = data.Dec1
            const r = handleActions(sm, globals)
            expect(r.Some.Context.Object).toEqual(-1)
        })

        it("can decrement a context object with no amount specified", () => {
            const [sm, globals] = data.Dec2
            const r = handleActions(sm, globals)
            expect(r.Context.Object).toEqual(150149)
        })
    })

    describe("$mul", () => {
        it("can multiply a context object", () => {
            const [sm, globals] = data.Mul1
            const r = handleActions(sm, globals)
            expect(r.Context.Object).toEqual(90)
        })
    })

    describe("$div", () => {
        it("can divide a context object", () => {
            const [sm, globals] = data.Div1
            const r = handleActions(sm, globals)
            expect(r.Context.Object).toEqual(18)
        })
    })
})
