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

// chart
/* playground-fold */
const ctx = document.querySelector('canvas');
const chart = new Chart(ctx, {
  type: 'scatter',
  data: data,
  options: {
    scales: scales,
  }
});
/* playground-fold-end */

// buttons
createButton('Zoom +10%', () => chart.zoom(1.1));
createButton('Zoom -10%', () => chart.zoom(0.9));
createButton('Zoom x +10%', () => chart.zoom({x: 1.1}));
createButton('Zoom x -10%', () => chart.zoom({x: 0.9}));
createButton('Pan x 100px (anim)', () => chart.pan({x: 100}, undefined, 'default'));
createButton('Pan x -100px (anim)', () => chart.pan({x: -100}, undefined, 'default'));
createButton('Zoom x: 0..-100, y: 0..100', () => {
  chart.zoomScale('x', {min: -100, max: 0}, 'default');
  chart.zoomScale('y', {min: 0, max: 100}, 'default');
});
createButton('Reset zoom', () => chart.resetZoom());

function createButton(label, handler) {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.addEventListener('click', handler);
  document.body.append(btn);
}
