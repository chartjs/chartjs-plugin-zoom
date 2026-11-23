import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

// Integration tests use what `npm run build` writes to dist, the way the
// package is used, so they need a build first. They are kept out of the browser
// suite, which tests the source: `npm run dev` there does not rebuild dist, and
// coverage of dist would not count for src.
export default defineConfig({
  test: {
    browser: {
      enabled: true,
      headless: true,
      instances: [{ browser: 'chromium' }, { browser: 'firefox' }],
      provider: playwright(),
      screenshotFailures: false,
    },
    globals: true,
    include: ['test/integration/**/*.spec.js'],
  },
})
