module.exports = {
  testRegex: ".*\\.test\\.ts$",
  reporters: ["default", "github-actions"],
  moduleFileExtensions: ["ts", "js", "mjs", "cjs", "json"],
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
};
