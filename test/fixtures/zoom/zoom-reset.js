const labels = [];
const data = [];
for (let i = 1; i <= 100; i++) {
  labels.push('Label ' + i);
  data.push(Math.sin(i / 100 * Math.PI) * 10);
}

const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext('2d');

module.exports = {
  config: {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        barPercentage: 1,
        categoryPercentage: 1,
        backgroundColor: 'red'
      }]
    },
    options: {
      scales: {
        x: {display: false},
        y: {display: false}
      },
      plugins: {
        legend: false,
        zoom: {
          zoom: {
            wheel: {
              enabled: true
            },
            mode: 'x',
          }
        }
      },
      layout: {
        padding: 2
      }
    }
  },
  options: {
    run(chart) {
      const steps = 4;
      const n = Math.sqrt(steps);
      const side = 512 / n;
      for (let i = 0; i < steps; i++) {
        const col = i % n;
        const row = Math.floor(i / n);
        if (i > 0 && i < steps - 1) {
          jasmine.triggerWheelEvent(chart, {
            x: 255,
            y: 255,
            deltaY: -1
          });
        } else {
          chart.resetZoom();
        }
        ctx.drawImage(chart.canvas, col * side, row * side, side, side);
      }

      Chart.helpers.clearCanvas(chart.canvas);
      chart.ctx.drawImage(canvas, 0, 0);
    }
  }
};
