// Registers Chart.js, the plugin under test and the shared sample defaults, and
// exposes the sample helpers under the names the fenced sample code expects.
// vuepress-theme-chartjs built this list from themeConfig.chart.imports and
// injected it through a global mixin; a plain module is enough here.
import '../../scripts/register.js'
import '../../scripts/defaults.js'
import * as Utils from '../../scripts/utils.js'

export const imports = { Utils }
