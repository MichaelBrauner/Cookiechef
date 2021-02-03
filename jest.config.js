/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

module.exports = {

    rootDir: "tests",
    testEnvironment: "jsdom",

    testPathIgnorePatterns: [
        "/node_modules/"
    ],

    "transform": {
        "^.+\\.js$": "babel-jest",
    },

};
