import { defaults } from 'chart.js'

defaults.set({
  datasets: {
    line: {
      tension: 0.4,
    },
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false,
  },
  plugins: {
    legend: false,
  },
})
