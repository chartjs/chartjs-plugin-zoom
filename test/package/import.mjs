// Loads the built package by name the way an ESM consumer does, through the
// "import" condition of package.json "exports". Needs `npm run build` first.
import assert from 'node:assert/strict'
import plugin, * as zoom from 'chartjs-plugin-zoom'

assert.equal(plugin.id, 'zoom')
for (const name of ['pan', 'zoom', 'zoomRect', 'zoomScale', 'resetZoom']) {
  assert.equal(typeof zoom[name], 'function', name)
}
