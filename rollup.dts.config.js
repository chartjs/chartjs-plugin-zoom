import dts from 'rollup-plugin-dts'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json'))
const external = Object.keys(pkg.peerDependencies).concat('chart.js/helpers')

/**
 * Rolls the per-module declarations tsc wrote into build/types into the single
 * dist/index.d.ts the package points at. Emitting them one-to-one would publish
 * the source layout -- core, gestures, handlers, state, utils and the rest are
 * implementation detail, and nothing outside this package should be able to
 * import them.
 */
export default {
  input: 'build/types/src/index.d.ts',
  output: {
    file: 'dist/index.d.ts',
    format: 'es',
  },
  external,
  plugins: [dts()],
}
