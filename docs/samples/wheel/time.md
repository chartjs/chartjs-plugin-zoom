# Time Scale

```js chart-editor
// <block:data:1>
const NUMBER_CFG = {count: 500, min: 0, max: 1000}
const data = {
  datasets: [{
    label: 'My First dataset',
    borderColor: Utils.randomColor(0.4),
    backgroundColor: Utils.randomColor(0.1),
    pointBorderColor: Utils.randomColor(0.7),
    pointBackgroundColor: Utils.randomColor(0.5),
    pointBorderWidth: 1,
    data: Utils.hourlyPoints(NUMBER_CFG),
  }]
}
// </block:data>

// <block:scales:2>
const scales = {
  x: {
    position: 'bottom',
    type: 'time',
    ticks: {
      autoSkip: true,
      autoSkipPadding: 50,
      maxRotation: 0
    },
    time: {
      displayFormats: {
        hour: 'HH:mm',
        minute: 'HH:mm',
        second: 'HH:mm:ss'
      }
    }
  },
  y: {
    position: 'right',
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
  },
}
// </block:scales>

// <block:zoom:0>
const zoomOptions = {
  zoom: {
    wheel: {
      enabled: true,
    },
    pinch: {
      enabled: true,
    },
    mode: 'xy',
  },
  pan: {
    enabled: true,
    mode: 'xy',
  }
}
// </block>

const panStatus = () => zoomOptions.pan.enabled ? 'enabled' : 'disabled'
const zoomStatus = () => zoomOptions.zoom.wheel.enabled ? 'enabled' : 'disabled'

// <block:config:1>
const config = {
  type: 'scatter',
  data: data,
  options: {
    scales: scales,
    plugins: {
      zoom: zoomOptions,
      title: {
        display: true,
        position: 'bottom',
        text: () => 'Zoom: ' + zoomStatus() + ', Pan: ' + panStatus()
      }
    },
    onClick(e) {
      console.log(e.type)
    }
  }
}
// </block:config>

const actions = [
  {
    name: 'Toggle zoom',
    handler(chart) {
      zoomOptions.zoom.wheel.enabled = !zoomOptions.zoom.wheel.enabled
      zoomOptions.zoom.pinch.enabled = !zoomOptions.zoom.pinch.enabled
      chart.update()
    }
  }, {
    name: 'Toggle pan',
    handler(chart) {
      zoomOptions.pan.enabled = !zoomOptions.pan.enabled
      chart.update()
    },
  }, {
    name: 'Reset zoom',
    handler(chart) {
      chart.resetZoom()
    }
  }, {
    name: 'Zoom to next week',
    handler(chart) {
      chart.zoomScale('x', Utils.nextWeek(), 'default')
      chart.update()
    }
  }, {
    name: 'Zoom to 400-600',
    handler(chart) {
      chart.zoomScale('y', {min: 400, max: 600}, 'default')
      chart.update()
    }
  }

]

module.exports = {
  actions,
  config,
  output: 'Clicks are logged here'
}
```
