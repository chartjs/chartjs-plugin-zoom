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
  tolerance: 0.02,
  config: {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        barPercentage: 1,
        categoryPercentage: 1,
        backgroundColor: c => c.index < 50 ? 'blue' : 'red'
      }]
    },
    options: {
      events: [],
      scales: {
        x: {
          display: false,
          min: 'Label 1',
          max: 'Label 5'
        },
        y: {display: false, max: 10}
      },
      plugins: {
        legend: false,
        tooltip: false,
        zoom: {
          pan: {
            enabled: true,
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
    spriteText: true,
    run(chart) {
      const steps = 16;
      const n = Math.sqrt(steps);
      const side = 512 / n;
      return new Promise((resolve) => {
        let i = 0;
        const next = () => {
          if (i < steps) {
            const col = i % n;
            const row = Math.floor(i / n);
            i++;

            ctx.drawImage(chart.canvas, col * side, row * side, side, side);
            Simulator.gestures.pan(chart.canvas, {deltaX: -350, deltaY: 0, duration: 50}, next);
          } else {
            Chart.helpers.clearCanvas(chart.canvas);
            chart.ctx.drawImage(canvas, 0, 0);
            resolve();
          }
        };
        next();
      });
    }
  }
};
