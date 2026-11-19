import { defineConfig } from 'vitest/config'

// Unit tests that need no DOM. The specs that need a real canvas live in
// test/specs and run through vitest.browser.config.ts.
export default defineConfig({
  test: {
    coverage: {
      exclude: ['**/*.test.ts'],
      include: ['src/**/*.ts'],
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage/unit',
    },
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
  },
})
