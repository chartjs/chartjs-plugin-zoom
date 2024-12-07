import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import zoomPlugin from '../../dist/chartjs-plugin-zoom.esm.js';
import {defaults} from 'chart.js';

Chart.register(zoomPlugin)

Chart.register({
  id: 'version',
  afterDraw(chart) {
    const ctx = chart.ctx;
    ctx.save();
    ctx.font = '9px monospace';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(
      'Chart.js v' + Chart.version + ' + chartjs-plugin-zoom v' + zoomPlugin.version,
      chart.chartArea.right,
      0
    );
    ctx.restore();
  }
});

defaults.set({
  datasets: {
    line: {
      tension: 0.4
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  },
  plugins: {
    legend: false
  },
});

export default Chart;
