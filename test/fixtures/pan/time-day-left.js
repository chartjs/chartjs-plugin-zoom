const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext('2d');

module.exports = {
  config: {
    type: 'bar',
    data: {
      labels: [new Date(2020, 0, 2), new Date(2020, 0, 3), new Date(2020, 0, 4), new Date(2020, 0, 5)],
      datasets: [
        {
          backgroundColor: ['red', 'green', 'blue', 'orange'],
          data: [1, 2, 3, 4]
        }
      ]
    },
    options: {
      animation: false,
      events: [],
      scales: {
        y: {
          display: false,
          max: 5
        },
        x: {
          type: 'time',
          min: new Date(2020, 0, 3),
          max: new Date(2020, 0, 5),
          time: {
            unit: 'day',
            round: 'day',
          }
        }
      },
      plugins: {
        legend: false,
        zoom: {
          pan: {
            enabled: true,
            mode: 'x',
          }
        }
      }
    }
  },
  options: {
    spriteText: true,
    run(chart) {
      const steps = 4;
      const n = Math.sqrt(steps);
      const side = 512 / n;
      for (let i = 0; i < steps; i++) {
        const col = i % n;
        const row = Math.floor(i / n);
        if (i > 0) {
          chart.pan({x: 150});
          chart.update();
        }
        ctx.drawImage(chart.canvas, col * side, row * side, side, side);
      }
      Chart.helpers.clearCanvas(chart.canvas);
      chart.ctx.drawImage(canvas, 0, 0);
    }
  }
};
