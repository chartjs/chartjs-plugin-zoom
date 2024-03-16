/* playground-hide */
import Chart from '../scripts/register.js';
import * as Utils from '../scripts/utils.js';
/* playground-hide-end */
// data
/* playground-fold */
const NUMBER_CFG = {count: 20, min: -100, max: 100};
const data = {
  datasets: [{
    label: 'My First dataset',
    borderColor: Utils.randomColor(0.4),
    backgroundColor: Utils.randomColor(0.1),
    pointBorderColor: Utils.randomColor(0.7),
    pointBackgroundColor: Utils.randomColor(0.5),
    pointBorderWidth: 1,
    data: Utils.points(NUMBER_CFG),
  }, {
    label: 'My Second dataset',
    borderColor: Utils.randomColor(0.4),
    backgroundColor: Utils.randomColor(0.1),
    pointBorderColor: Utils.randomColor(0.7),
    pointBackgroundColor: Utils.randomColor(0.5),
    pointBorderWidth: 1,
    data: Utils.points(NUMBER_CFG),
  }]
};
/* playground-fold-end */

// scales
/* playground-fold */
const scaleOpts = {
  reverse: true,
  ticks: {
    callback: (val, index, ticks) => index === 0 || index === ticks.length - 1 ? null : val,
  },
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
    position: 'top',
  },
  y: {
    position: 'right',
  },
};
Object.keys(scales).forEach(scale => Object.assign(scales[scale], scaleOpts));
/* playground-fold-end */

// zoom
const zoomOptions = {
  limits: {
    x: {min: -200, max: 200, minRange: 50},
    y: {min: -200, max: 200, minRange: 50}
  },
  pan: {
    enabled: true,
    mode: 'xy',
  },
  zoom: {
    wheel: {
      enabled: true,
    },
    pinch: {
      enabled: true
    },
    mode: 'xy',
    onZoomComplete({chart}) {
      // This update is needed to display up to date zoom level in the title.
      // Without this, previous zoom level is displayed.
      // The reason is: title uses the same beforeUpdate hook, and is evaluated before zoom.
      chart.update('none');
    }
  }
};

// chart
/* playground-fold */
const panStatus = () => zoomOptions.pan.enabled ? 'enabled' : 'disabled';
const zoomStatus = (chart) => (zoomOptions.zoom.wheel.enabled ? 'enabled' : 'disabled') + ' (' + chart.getZoomLevel() + 'x)';

const ctx = document.querySelector('canvas')
const chart = new Chart(ctx, {
  type: 'scatter',
  data: data,
  options: {
    scales: scales,
    plugins: {
      zoom: zoomOptions,
      title: {
        display: true,
        position: 'bottom',
        text: (ctx) => 'Zoom: ' + zoomStatus(ctx.chart) + ', Pan: ' + panStatus()
      }
    },
    onClick(e) {
      console.log(e.type);
    }
  }
});
/* playground-fold-end */

// buttons
/* playground-fold */
createButton('Toggle zoom', () => {
  zoomOptions.zoom.wheel.enabled = !zoomOptions.zoom.wheel.enabled;
  zoomOptions.zoom.pinch.enabled = !zoomOptions.zoom.pinch.enabled;
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
