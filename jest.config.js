/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    coveragePathIgnorePatterns: ["tests", "node_modules"],
    setupFilesAfterEnv: ["./jest.setup.js"],
};
