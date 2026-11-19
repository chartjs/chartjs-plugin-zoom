import { createFixtures } from 'chartjs-test-utils'

// import.meta.glob resolves against this file, so the maps are built here and
// handed to the package.
const specsFromFixtures = createFixtures({
  configs: import.meta.glob('../fixtures/**/*.js', { eager: true, import: 'default' }),
  images: import.meta.glob('../fixtures/**/*.png', { eager: true, import: 'default', query: '?url' }),
  prefix: '../fixtures/',
})

describe('fixtures', function () {
  describe('zoom', specsFromFixtures('zoom'))
  describe('pan', specsFromFixtures('pan'))
})
