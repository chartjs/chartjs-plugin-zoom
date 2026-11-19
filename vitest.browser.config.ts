import { playwright } from '@vitest/browser-playwright'
import { createSaveFixtureImage } from 'chartjs-test-utils/node'
import { defineConfig } from 'vitest/config'

// Reference images can only be produced by a real browser, so producing them is
// a mode of this suite: `npm run fixtures:update` sets the flag and runs
// Chromium alone, so one browser is the source of truth.
//
// The command is registered only in that mode, and its presence is what
// chartjs-test-utils checks. Do not pass the flag through `define` instead:
// Vitest re-encodes it, `false` arrives in the browser as the truthy string
// "false", and every fixture rewrites itself while reporting a pass.
const updating = process.env.UPDATE_FIXTURES === '1'

export default defineConfig({
  test: {
    browser: {
      commands: updating ? { saveFixtureImage: createSaveFixtureImage() } : {},
      enabled: true,
      headless: true,
      instances: updating ? [{ browser: 'chromium' }] : [{ browser: 'chromium' }, { browser: 'firefox' }],
      // Explicitly disable hardware acceleration to make image diff more
      // stable across CI and dev machines, as karma.conf.cjs did.
      // https://github.com/chartjs/Chart.js/pull/5629
      // Since FF 110 https://github.com/chartjs/Chart.js/issues/11164
      //
      // These belong to the provider: Vitest silently ignores launch options
      // set on an instance.
      provider: playwright({
        launchOptions: {
          args: ['--disable-accelerated-2d-canvas'],
          firefoxUserPrefs: {
            'gfx.canvas.accelerated': false,
            'layers.acceleration.disabled': true,
          },
        },
      }),
      screenshotFailures: false,
    },
    // Istanbul, not v8: v8 coverage is collected over the Chrome DevTools
    // Protocol, so it cannot cover the Firefox instance.
    coverage: {
      exclude: ['**/*.test.ts'],
      include: ['src/**/*.ts'],
      provider: 'istanbul',
      reporter: ['text-summary', 'lcov'],
      reportsDirectory: 'coverage/browser',
    },
    globals: true,
    include: ['test/specs/**/*.spec.js'],
    // Jasmine removed its spies after each spec; this does the same for vi.spyOn.
    restoreMocks: true,
    setupFiles: ['test/setup.js'],
    testTimeout: 10000,
  },
})
