/* playground-hide */
import Chart from '../../scripts/register.js';
import * as Utils from '../../scripts/utils.js';
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
const dragColor = Utils.randomColor(0.4);
const zoomOptions = {
  pan: {
    enabled: true,
    mode: 'xy',
    modifierKey: 'ctrl',
  },
  zoom: {
    mode: 'xy',
    drag: {
      enabled: true,
      borderColor: 'rgb(54, 162, 235)',
      borderWidth: 1,
      backgroundColor: 'rgba(54, 162, 235, 0.3)'
    }
  }
};

// chart
/* playground-fold */
const zoomStatus = () => zoomOptions.zoom.drag.enabled ? 'enabled' : 'disabled';

const ctx = document.querySelector('canvas');
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
        text: (ctx) => 'Zoom: ' + zoomStatus()
      }
    },
  }
});
/* playground-fold-end */

// buttons
/* playground-fold */
createButton('Toggle zoom', () => {
  zoomOptions.zoom.drag.enabled = !zoomOptions.zoom.drag.enabled;
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
