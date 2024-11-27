# Usage

Using the zoom and pan plugin is very simple. Once the plugin is [registered](./integration) zoom options provided to the chart will be used. In this example, scroll zoom is enabled.

```js chart-editor
/* <block:config:0> */
const config = {
  type: 'line',
  data: {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [{
      label: 'My First Dataset',
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  },
  options: {
    plugins: {
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true
          },
          mode: 'xy',
        }
      }
    }
  }
}
/* </block:config> */

module.exports = {
  actions: [
    {
      name: 'Reset zoom',
      handler: function(chart) {
        chart.resetZoom()
      }
    }
  ],
  config
}
```
