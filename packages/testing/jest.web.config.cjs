module.exports = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  testMatch: ["**/*.test.{ts,tsx}"],
  collectCoverageFrom: ["**/*.{ts,tsx}", "!**/*.d.ts", "!**/*.config.{js,cjs}"],
  coverageThreshold: { global: { lines: 0, branches: 0 }, "./apps/web/**": { lines: 0, branches: 0 } }
};
