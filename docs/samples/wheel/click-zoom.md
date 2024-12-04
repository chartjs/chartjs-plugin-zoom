# Click to Zoom

::: tip NOTE

The following text is there on purpose, so the page is scrollable.
This demos that the chart does not consume the wheel until clicked.

:::

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Fringilla ut morbi tincidunt augue interdum velit euismod. Elit pellentesque habitant morbi tristique senectus et netus. Consectetur adipiscing elit pellentesque habitant morbi. Id faucibus nisl tincidunt eget nullam non nisi est sit. Blandit turpis cursus in hac habitasse. Vulputate eu scelerisque felis imperdiet proin fermentum leo vel. Ornare massa eget egestas purus. A diam sollicitudin tempor id eu nisl nunc. Augue mauris augue neque gravida in fermentum et sollicitudin. Dolor purus non enim praesent elementum facilisis leo vel fringilla. Habitant morbi tristique senectus et netus et malesuada. Nulla pharetra diam sit amet nisl suscipit adipiscing bibendum est. Gravida dictum fusce ut placerat orci nulla pellentesque.

Semper viverra nam libero justo laoreet sit. Pretium vulputate sapien nec sagittis aliquam malesuada bibendum arcu vitae. Risus ultricies tristique nulla aliquet enim tortor at auctor urna. Consequat semper viverra nam libero justo laoreet sit amet. Magna ac placerat vestibulum lectus mauris ultrices eros. Dolor purus non enim praesent elementum facilisis leo vel. Enim eu turpis egestas pretium aenean pharetra. Vitae purus faucibus ornare suspendisse sed nisi lacus. Senectus et netus et malesuada fames. Nec feugiat in fermentum posuere urna nec tincidunt praesent. Accumsan lacus vel facilisis volutpat. Lectus quam id leo in vitae turpis massa. Cras sed felis eget velit aliquet. Volutpat maecenas volutpat blandit aliquam.

Volutpat lacus laoreet non curabitur. Diam donec adipiscing tristique risus. Fusce id velit ut tortor pretium viverra suspendisse. Dui ut ornare lectus sit amet est. Pharetra sit amet aliquam id. Porttitor massa id neque aliquam vestibulum morbi blandit. Viverra adipiscing at in tellus integer feugiat scelerisque varius morbi. Quam elementum pulvinar etiam non quam. Congue quisque egestas diam in arcu cursus euismod quis. Dictum fusce ut placerat orci nulla pellentesque. Ut placerat orci nulla pellentesque dignissim enim sit amet. Sagittis id consectetur purus ut faucibus pulvinar elementum integer. Dui ut ornare lectus sit amet est.

Ut tortor pretium viverra suspendisse potenti nullam ac tortor. Mauris a diam maecenas sed enim. Tellus in hac habitasse platea dictumst vestibulum rhoncus. Cras sed felis eget velit aliquet. Purus viverra accumsan in nisl nisi. Sed risus ultricies tristique nulla aliquet enim tortor at. Integer quis auctor elit sed vulputate mi sit amet mauris. Adipiscing elit duis tristique sollicitudin nibh sit amet commodo. Risus feugiat in ante metus dictum at. Posuere urna nec tincidunt praesent semper. Auctor elit sed vulputate mi sit amet mauris commodo. Senectus et netus et malesuada fames ac turpis egestas integer. Varius morbi enim nunc faucibus a pellentesque. Sed felis eget velit aliquet sagittis id. Ac auctor augue mauris augue neque gravida. Etiam erat velit scelerisque in dictum non consectetur a erat.

Tortor condimentum lacinia quis vel eros donec ac. Phasellus vestibulum lorem sed risus ultricies tristique. Vitae tortor condimentum lacinia quis vel eros donec. Morbi tempus iaculis urna id volutpat lacus laoreet non curabitur. Ut pharetra sit amet aliquam id diam. Eu non diam phasellus vestibulum lorem. Pharetra pharetra massa massa ultricies mi. Donec ultrices tincidunt arcu non. Sagittis orci a scelerisque purus semper eget duis. In iaculis nunc sed augue lacus viverra. Vitae proin sagittis nisl rhoncus mattis rhoncus urna neque. Consequat mauris nunc congue nisi vitae suscipit tellus mauris a. Massa placerat duis ultricies lacus sed turpis tincidunt id. Sit amet tellus cras adipiscing enim eu turpis. Amet porttitor eget dolor morbi non arcu risus quis varius. Potenti nullam ac tortor vitae purus.

```js chart-editor
// <block:data:1>
const DATA_COUNT = 70
const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 100}

const labels = Utils.months({count: DATA_COUNT})
const data = {
  labels: labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.randomColor(0.4),
      backgroundColor: Utils.randomColor(0.1),
      stack: 'combined',
      type: 'bar'
    },
    {
      label: 'Dataset 2',
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.randomColor(0.4),
      backgroundColor: Utils.randomColor(0.1),
      pointBorderColor: Utils.randomColor(0.7),
      pointBackgroundColor: Utils.randomColor(0.5),
      stack: 'combined'
    }
  ]
}
// </block:data>

// <block:zoom:0>
const zoomOptions = {
  limits: {
    y: {min: 0, max: 200, minRange: 50}
  },
  pan: {
    enabled: true,
    mode: 'xy',
  },
  zoom: {
    wheel: {
      enabled: false,
    },
    pinch: {
      enabled: false
    },
    mode: 'xy',
  }
}
// </block:zoom>

// <block:border:3>
const borderPlugin = {
  id: 'chartAreaBorder',
  beforeDraw(chart) {
    const {ctx, chartArea: {left, top, width, height}} = chart
    if (chart.options.plugins.zoom.zoom.wheel.enabled) {
      ctx.save()
      ctx.strokeStyle = 'red'
      ctx.lineWidth = 1
      ctx.strokeRect(left, top, width, height)
      ctx.restore()
    }
  }
}
// </block:border>

const zoomStatus = () => 'Zoom: ' + (zoomOptions.zoom.wheel.enabled ? 'enabled' : 'disabled')

// <block:config:1>
const config = {
  type: 'line',
  data: data,
  options: {
    scales: {y: {stacked: true, min: 0}},
    plugins: {
      zoom: zoomOptions,
      title: {
        display: true,
        position: 'bottom',
        text: zoomStatus
      }
    },
    onClick(e) {
      const chart = e.chart
      chart.options.plugins.zoom.zoom.wheel.enabled = !chart.options.plugins.zoom.zoom.wheel.enabled
      chart.options.plugins.zoom.zoom.pinch.enabled = !chart.options.plugins.zoom.zoom.pinch.enabled
      chart.update()
    }
  },
  plugins: [borderPlugin]
}
// </block:config>

const actions = [
  {
    name: 'Randomize',
    handler(chart) {
      chart.data.datasets.forEach(dataset => {
        dataset.data = Utils.numbers(NUMBER_CFG)
      })
      chart.update()
    }
  }, {
    name: 'Toggle zoom',
    handler(chart) {
      zoomOptions.zoom.wheel.enabled = !zoomOptions.zoom.wheel.enabled
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
  }
]

module.exports = {
  actions,
  config,
}
```

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Fringilla ut morbi tincidunt augue interdum velit euismod. Elit pellentesque habitant morbi tristique senectus et netus. Consectetur adipiscing elit pellentesque habitant morbi. Id faucibus nisl tincidunt eget nullam non nisi est sit. Blandit turpis cursus in hac habitasse. Vulputate eu scelerisque felis imperdiet proin fermentum leo vel. Ornare massa eget egestas purus. A diam sollicitudin tempor id eu nisl nunc. Augue mauris augue neque gravida in fermentum et sollicitudin. Dolor purus non enim praesent elementum facilisis leo vel fringilla. Habitant morbi tristique senectus et netus et malesuada. Nulla pharetra diam sit amet nisl suscipit adipiscing bibendum est. Gravida dictum fusce ut placerat orci nulla pellentesque.

Semper viverra nam libero justo laoreet sit. Pretium vulputate sapien nec sagittis aliquam malesuada bibendum arcu vitae. Risus ultricies tristique nulla aliquet enim tortor at auctor urna. Consequat semper viverra nam libero justo laoreet sit amet. Magna ac placerat vestibulum lectus mauris ultrices eros. Dolor purus non enim praesent elementum facilisis leo vel. Enim eu turpis egestas pretium aenean pharetra. Vitae purus faucibus ornare suspendisse sed nisi lacus. Senectus et netus et malesuada fames. Nec feugiat in fermentum posuere urna nec tincidunt praesent. Accumsan lacus vel facilisis volutpat. Lectus quam id leo in vitae turpis massa. Cras sed felis eget velit aliquet. Volutpat maecenas volutpat blandit aliquam.

Volutpat lacus laoreet non curabitur. Diam donec adipiscing tristique risus. Fusce id velit ut tortor pretium viverra suspendisse. Dui ut ornare lectus sit amet est. Pharetra sit amet aliquam id. Porttitor massa id neque aliquam vestibulum morbi blandit. Viverra adipiscing at in tellus integer feugiat scelerisque varius morbi. Quam elementum pulvinar etiam non quam. Congue quisque egestas diam in arcu cursus euismod quis. Dictum fusce ut placerat orci nulla pellentesque. Ut placerat orci nulla pellentesque dignissim enim sit amet. Sagittis id consectetur purus ut faucibus pulvinar elementum integer. Dui ut ornare lectus sit amet est.

Ut tortor pretium viverra suspendisse potenti nullam ac tortor. Mauris a diam maecenas sed enim. Tellus in hac habitasse platea dictumst vestibulum rhoncus. Cras sed felis eget velit aliquet. Purus viverra accumsan in nisl nisi. Sed risus ultricies tristique nulla aliquet enim tortor at. Integer quis auctor elit sed vulputate mi sit amet mauris. Adipiscing elit duis tristique sollicitudin nibh sit amet commodo. Risus feugiat in ante metus dictum at. Posuere urna nec tincidunt praesent semper. Auctor elit sed vulputate mi sit amet mauris commodo. Senectus et netus et malesuada fames ac turpis egestas integer. Varius morbi enim nunc faucibus a pellentesque. Sed felis eget velit aliquet sagittis id. Ac auctor augue mauris augue neque gravida. Etiam erat velit scelerisque in dictum non consectetur a erat.

Tortor condimentum lacinia quis vel eros donec ac. Phasellus vestibulum lorem sed risus ultricies tristique. Vitae tortor condimentum lacinia quis vel eros donec. Morbi tempus iaculis urna id volutpat lacus laoreet non curabitur. Ut pharetra sit amet aliquam id diam. Eu non diam phasellus vestibulum lorem. Pharetra pharetra massa massa ultricies mi. Donec ultrices tincidunt arcu non. Sagittis orci a scelerisque purus semper eget duis. In iaculis nunc sed augue lacus viverra. Vitae proin sagittis nisl rhoncus mattis rhoncus urna neque. Consequat mauris nunc congue nisi vitae suscipit tellus mauris a. Massa placerat duis ultricies lacus sed turpis tincidunt id. Sit amet tellus cras adipiscing enim eu turpis. Amet porttitor eget dolor morbi non arcu risus quis varius. Potenti nullam ac tortor vitae purus.
