/* playground-hide */
import Chart from '../../scripts/register.js';
import * as Utils from '../../scripts/utils.js';
/* playground-hide-end */
// data
/* playground-fold */
const DATA_COUNT = 20;
const NUMBER_CFG = {count: DATA_COUNT, min: -100, max: 100};
const data = {
  labels: Utils.months({count: DATA_COUNT}),
  datasets: [{
    label: 'Dataset 1',
    borderColor: Utils.randomColor(0.7),
    backgroundColor: Utils.randomColor(0.5),
    data: Utils.numbers(NUMBER_CFG),
  }, {
    label: 'Dataset 2',
    borderColor: Utils.randomColor(0.7),
    backgroundColor: Utils.randomColor(0.5),
    data: Utils.numbers(NUMBER_CFG),
  }, {
    label: 'Dataset 3',
    borderColor: Utils.randomColor(0.7),
    backgroundColor: Utils.randomColor(0.5),
    data: Utils.numbers(NUMBER_CFG),
  }]
};
/* playground-fold-end */

// scales
/* playground-fold */
const scaleOpts = {
  grid: {
    borderColor: Utils.randomColor(1),
    color: 'rgba( 0, 0, 0, 0.1)',
  },
  title: {
    display: true,
    text: (ctx) => ctx.scale.axis + ' axis',
  }
};
const scales = {
  x: {
    type: 'category',
  },
  y: {
    type: 'linear',
    ticks: {
      callback: (val, index, ticks) => index === 0 || index === ticks.length - 1 ? null : val,
    },
  },
};
Object.keys(scales).forEach(scale => Object.assign(scales[scale], scaleOpts));
/* playground-fold-end */

// chart
const ctx = document.querySelector('canvas');
const chart = new Chart(ctx, {
  type: 'bar',
  data: data,
  options: {
    scales: scales,
    plugins: {
      tooltip: false,
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
          modifierKey: 'ctrl',
        },
        zoom: {
          drag: {
            enabled: true
          },
          mode: 'x',
        },
      }
    },
  }
});

// button
/* playground-fold */
const btn = document.createElement('button');
btn.textContent = 'Reset zoom';
btn.addEventListener('click', () => chart.resetZoom());
document.body.append(btn);
/* playground-fold-end */
