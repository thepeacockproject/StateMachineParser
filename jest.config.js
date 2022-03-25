module.exports = {
    verbose: true,
    testEnvironment: "node",
    transform: {
        "^.+\\.ts?$": "ts-jest",
    },
    resolver: "jest-ts-webcompat-resolver",
}
