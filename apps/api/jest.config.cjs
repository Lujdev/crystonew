module.exports = {
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": ["ts-jest", { tsconfig: "<rootDir>/../tsconfig.json" }],
  },
  moduleFileExtensions: ["js", "json", "ts"],
  testEnvironment: "node",
};
