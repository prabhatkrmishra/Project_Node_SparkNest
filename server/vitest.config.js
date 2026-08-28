import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      // Thresholds enforced in CI after more tests are added (target: 60% lines)
    },
  },
});
