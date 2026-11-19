import { Chart, registerables } from 'chart.js'
import { setup } from 'chartjs-test-utils'
import 'chartjs-adapter-date-fns'

// Registers the plugin, like the UMD bundle Karma used to load.
import '../src/index.umd'

// Karma loaded the Chart.js UMD bundle, which registers every component.
Chart.register(...registerables)

// Registers the matchers and the per-spec chart cleanup, and pins
// devicePixelRatio to 1 so the reference images stay comparable on
// high-res/retina displays (https://github.com/chartjs/Chart.js/issues/4515).
setup({ Chart })

// Disable colors plugin for tests.
Chart.defaults.plugins.colors.enabled = false
