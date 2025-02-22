/* playground-hide */
import Chart from '../../scripts/register.js';
import * as Utils from '../../scripts/utils.js';
/* playground-hide-end */
// data
/* playground-fold */
const DATA_COUNT = 70;
const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 100};

const labels = Utils.months({count: DATA_COUNT});
const data = {
  labels: labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.randomColor(0.4),
      backgroundColor: Utils.randomColor(0.1),
      stack: 'combined',
      type: 'bar'
    },
    {
      label: 'Dataset 2',
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.randomColor(0.4),
      backgroundColor: Utils.randomColor(0.1),
      pointBorderColor: Utils.randomColor(0.7),
      pointBackgroundColor: Utils.randomColor(0.5),
      stack: 'combined'
    }
  ]
};
/* playground-fold-end */

// zoom
const zoomOptions = {
  limits: {
    y: {min: 0, max: 200, minRange: 50}
  },
  pan: {
    enabled: true,
    mode: 'xy',
  },
  zoom: {
    wheel: {
      enabled: false,
    },
    pinch: {
      enabled: false
    },
    mode: 'xy',
  }
};

// border
/* playground-fold */
const borderPlugin = {
  id: 'chartAreaBorder',
  beforeDraw(chart, args, options) {
    const {ctx, chartArea: {left, top, width, height}} = chart;
    if (chart.options.plugins.zoom.zoom.wheel.enabled) {
      ctx.save();
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 1;
      ctx.strokeRect(left, top, width, height);
      ctx.restore();
    }
  }
};

const zoomStatus = () => 'Zoom: ' + (zoomOptions.zoom.wheel.enabled ? 'enabled' : 'disabled');
/* playground-fold-end */

// chart
/* playground-fold */
const ctx = document.querySelector('canvas');
const chart = new Chart(ctx, {
  type: 'line',
  data: data,
  options: {
    scales: {y: {stacked: true, min: 0}},
    plugins: {
      zoom: zoomOptions,
      title: {
        display: true,
        position: 'bottom',
        text: zoomStatus
      }
    },
    onClick(e) {
      const chart = e.chart;
      chart.options.plugins.zoom.zoom.wheel.enabled = !chart.options.plugins.zoom.zoom.wheel.enabled;
      chart.options.plugins.zoom.zoom.pinch.enabled = !chart.options.plugins.zoom.zoom.pinch.enabled;
      chart.update();
    }
  },
  plugins: [borderPlugin]
});
/* playground-fold-end */

// buttons
/* playground-fold */
createButton('Randomize', () => {
  chart.data.datasets.forEach(dataset => {
    dataset.data = Utils.numbers(NUMBER_CFG);
  });
  chart.update();
});
createButton('Toggle zoom', () => {
  zoomOptions.zoom.wheel.enabled = !zoomOptions.zoom.wheel.enabled;
  chart.update();
});
createButton('Toggle pan', () => {
  zoomOptions.pan.enabled = !zoomOptions.pan.enabled;
  chart.update();
});
createButton('Reset zoom', () => chart.resetZoom());

function createButton(label, handler) {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.addEventListener('click', handler);
  document.body.append(btn);
}
/* playground-fold-end */