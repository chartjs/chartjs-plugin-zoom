import { defineConfig } from 'vitest/config'

// Unit tests that need no DOM. The specs that need a real canvas live in
// test/specs and run through vitest.browser.config.ts.
export default defineConfig({
  test: {
    // No `include`: like c8 before it, this reports only the files the unit tests
    // load. The rest of src is covered by the browser suite.
    coverage: {
      exclude: ['**/*.test.ts'],
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage/unit',
    },
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
  },
})
