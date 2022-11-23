const data = [];
for (let i = 0; i < 100; i++) {
  data.push({x: i, y: Math.sin(i / 25 * Math.PI) * 10});
}

module.exports = {
  tolerance: 0.004,
  config: {
    type: 'line',
    data: {
      datasets: [{
        data,
        borderColor: 'red'
      }]
    },
    options: {
      scales: {
        x: {type: 'linear', display: false},
        y: {display: false}
      },
      plugins: {
        legend: false,
        zoom: {
          zoom: {
            drag: {
              enabled: true,
              backgroundColor: 'yellow',
              borderColor: 'black',
              borderWidth: 1,
              drawTime: 'afterDraw'
            },
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
      const scaleX = chart.scales.x;
      const scaleY = chart.scales.y;
      jasmine.triggerMouseEvent(chart, 'mousedown', {
        x: scaleX.getPixelForValue(5),
        y: scaleY.getPixelForValue(10)
      });
      jasmine.triggerMouseEvent(chart, 'mousemove', {
        x: scaleX.getPixelForValue(60),
        y: scaleY.getPixelForValue(0)
      });
      chart.render = function() { };
    }
  }
};
