# Category Scale

```js chart-editor
// <block:data:1>
const DATA_COUNT = 20
const NUMBER_CFG = {count: DATA_COUNT, min: -100, max: 100}
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
}
// </block:data>

// <block:scales:2>
const scaleOpts = {
  grid: {
    borderColor: Utils.randomColor(1),
    color: 'rgba( 0, 0, 0, 0.1)',
  },
  title: {
    display: true,
    text: (ctx) => ctx.scale.axis + ' axis',
  }
}
const scales = {
  x: {
    type: 'category',
    min: 5,
    max: 11,
  },
  y: {
    type: 'linear'
  },
}
Object.keys(scales).forEach(scale => Object.assign(scales[scale], scaleOpts))
// </block:scales>

// <block:config:0>
const config = {
  type: 'bar',
  data: data,
  options: {
    scales: scales,
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'xy',
          threshold: 5,
        },
        zoom: {
          wheel: {
            enabled: true
          },
          pinch: {
            enabled: true
          },
          mode: 'xy',
        },
      }
    },
  }
}
// </block:config>

const actions = [
  {
    name: 'Reset zoom',
    handler(chart) {
      chart.resetZoom()
    }
  }
]

module.exports = {
  actions,
  config,
}
```
