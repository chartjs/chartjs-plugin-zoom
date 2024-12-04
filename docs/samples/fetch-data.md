# Fetch Data

```js chart-editor
// <block:data:2>
const start = new Date().valueOf()
const end = start + 1000 * 60 * 60 * 24 * 2
const allData = []
let y = 100
for (let x = start; x <= end; x += 1000) {
  y += 5 - Math.random() * 10
  allData.push({x, y})
}

function fetchData(x1, x2) {
  const step = Math.max(1, Math.round((x2 - x1) / 100000))
  const data = []
  let i = 0
  while (i < allData.length && allData[i].x < x1) {
    i++
  }
  while (i < allData.length && allData[i].x <= x2) {
    data.push(allData[i])
    i += step
  }
  return data
}
// </block:data>

// <block:fetch:1>
let timer
function startFetch({chart}) {
  const {min, max} = chart.scales.x
  clearTimeout(timer)
  timer = setTimeout(() => {
    console.log('Fetched data between ' + min + ' and ' + max)
    chart.data.datasets[0].data = fetchData(min, max)
    chart.stop() // make sure animations are not running
    chart.update('none')
  }, 500)
}
// </block:fetch>

// <block:scales:3>
const scales = {
  x: {
    position: 'bottom',
    min: start,
    max: end,
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
    type: 'linear',
    position: 'left',
  },
}
// </block:scales>

// <block:zoom:0>
const zoomOptions = {
  limits: {
    x: {min: 'original', max: 'original', minRange: 60 * 1000},
  },
  pan: {
    enabled: true,
    mode: 'x',
    modifierKey: 'ctrl',
    onPanComplete: startFetch
  },
  zoom: {
    wheel: {
      enabled: true,
    },
    drag: {
      enabled: true,
    },
    pinch: {
      enabled: true
    },
    mode: 'x',
    onZoomComplete: startFetch
  }
}
// </block:zoom>

const zoomStatus = (chart) => 'zoom level: ' + chart.getZoomLevel() + ''

// <block:config:1>
const config = {
  type: 'line',
  data: {
    datasets: [{
      label: 'My First dataset',
      borderColor: Utils.randomColor(0.4),
      backgroundColor: Utils.randomColor(0.1),
      pointBorderColor: Utils.randomColor(0.7),
      pointBackgroundColor: Utils.randomColor(0.5),
      pointBorderWidth: 1,
      data: fetchData(start, end),
    }]
  },
  options: {
    scales: scales,
    plugins: {
      zoom: zoomOptions,
      title: {
        display: true,
        position: 'bottom',
        text: (ctx) => zoomStatus(ctx.chart)
      }
    },
    transitions: {
      zoom: {
        animation: {
          duration: 100
        }
      }
    }
  }
}
// </block:config>

const actions = [
  {
    name: 'Reset zoom',
    handler(chart) {
      chart.resetZoom('zoom')
    }
  }
]

module.exports = {
  actions,
  config,
  output: 'console.log output'
}
```
