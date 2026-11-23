// Loads the built package by name the way a CommonJS consumer does, through the
// "require" condition of package.json "exports". Needs `npm run build` first.
const assert = require('node:assert/strict')
const zoom = require('chartjs-plugin-zoom')

assert.equal(zoom.default.id, 'zoom')
for (const name of ['pan', 'zoom', 'zoomRect', 'zoomScale', 'resetZoom']) {
  assert.equal(typeof zoom[name], 'function', name)
}
