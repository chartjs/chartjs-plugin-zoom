# Pan Region

In this example pan is only accepted at the middle region (50%) of the chart. This region is highlighted by a red border.

```js chart-editor
// <block:data:1>
const NUMBER_CFG = {count: 20, min: -100, max: 100}
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
}
// </block:data>

// <block:scales:2>
const scaleOpts = {
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
}
const scales = {
  x: {
    position: 'top',
  },
  y: {
    position: 'right',
  },
}
Object.keys(scales).forEach(scale => Object.assign(scales[scale], scaleOpts))
// </block:scales>

// <block:zoom:0>
const zoomOptions = {
  limits: {
    x: {min: -200, max: 200, minRange: 50},
    y: {min: -200, max: 200, minRange: 50}
  },
  pan: {
    enabled: true,
    onPanStart({chart, point}) {
      const area = chart.chartArea
      const w25 = area.width * 0.25
      const h25 = area.height * 0.25
      if (point.x < area.left + w25 || point.x > area.right - w25
        || point.y < area.top + h25 || point.y > area.bottom - h25) {
        return false // abort
      }
    },
    mode: 'xy',
  },
  zoom: {
    wheel: {
      enabled: false,
    },
    pinch: {
      enabled: true
    },
  }
}
// </block:zoom>

// <block:border:3>
const borderPlugin = {
  id: 'panAreaBorder',
  beforeDraw(chart) {
    const {ctx, chartArea: {left, top, width, height}} = chart
    ctx.save()
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)'
    ctx.lineWidth = 1
    ctx.strokeRect(left + width * 0.25, top + height * 0.25, width / 2, height / 2)
    ctx.restore()
  }
}
// </block:border>

// <block:config:1>
const config = {
  type: 'scatter',
  data: data,
  options: {
    scales: scales,
    plugins: {
      zoom: zoomOptions,
    },
  },
  plugins: [borderPlugin]
}
// </block:config>

module.exports = {
  config,
}
```
