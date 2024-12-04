import Chart from 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import zoomPlugin from '../../dist/chartjs-plugin-zoom.esm.js'

Chart.register(zoomPlugin)

Chart.register({
  id: 'version',
  afterDraw(chart) {
    const ctx = chart.ctx
    ctx.save()
    ctx.font = '9px monospace'
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'top'
    ctx.fillText(
      'Chart.js v' + Chart.version + ' + chartjs-plugin-zoom v' + zoomPlugin.version,
      chart.chartArea.right,
      0
    )
    ctx.restore()
  },
})
