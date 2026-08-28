import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["routes/**/*.js", "middlewares/**/*.js", "services/**/*.js", "validators/**/*.js", "utils/**/*.js"],
      exclude: ["tests/**", "db/migrations/**", "db/scripts/**"],
      thresholds: {
        lines: 5,
        functions: 5,
        branches: 5,
        statements: 5,
      },
    },
  },
});
