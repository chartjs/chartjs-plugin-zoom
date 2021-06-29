const labels = ['a', 'b', 'c', 'd'];
const data = [2, 4, 8, 16];

const canvas = document.createElement('canvas');
const side = 256;
canvas.height = 768;
canvas.width = 768;
const ctx = canvas.getContext('2d');

let x = 0;
let y = 0;
function snapshot(chart, descr) {
  ctx.drawImage(chart.canvas, x, y, side, side);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.font = 'normal normal 12px arial';
  ctx.fillText(descr, x + side / 2, y + side / 2);

  x += side;
  if (x + side > canvas.width) {
    y += side;
    x = 0;
  }
}

module.exports = {
  tolerance: 0.0018,
  config: {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: 'red',
        borderWidth: 10
      }]
    },
    options: {
      scales: {
        y: {}
      },
      plugins: {
        legend: false,
      },
    }
  },
  options: {
    spriteText: true,
    run(chart) {
      snapshot(chart, 'original');

      chart.zoomScale('y', {min: 3, max: 9});
      snapshot(chart, 'zoom 3..9');

      chart.resetZoom();
      snapshot(chart, 'reset');

      chart.options.scales.y = {
        min: 0,
        max: 25
      };
      chart.update();
      snapshot(chart, 'update 0..25');

      chart.resetZoom();
      snapshot(chart, 'reset');

      chart.zoomScale('y', {min: 5, max: 15});
      snapshot(chart, 'zoom 5..15');

      chart.resetZoom();
      snapshot(chart, 'reset');

      chart.options.scales.y = {
        min: 1,
        max: 10
      };
      chart.update();
      snapshot(chart, 'update 1..10');

      chart.resetZoom();
      snapshot(chart, 'reset');

      Chart.helpers.clearCanvas(chart.canvas);
      chart.ctx.drawImage(canvas, 0, 0, 512, 512);
    }
  }
};

