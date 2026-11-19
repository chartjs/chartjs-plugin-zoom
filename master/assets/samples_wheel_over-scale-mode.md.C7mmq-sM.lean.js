import{_ as a,C as t,o as l,c as s,j as o,a as r,E as d}from"./chunks/framework.CKPyYSYA.js";const x=JSON.parse('{"title":"Over Scale Mode","description":"","frontmatter":{},"headers":[],"relativePath":"samples/wheel/over-scale-mode.md","filePath":"samples/wheel/over-scale-mode.md","lastUpdated":1795121882000}'),c={name:"samples/wheel/over-scale-mode.md"};function i(m,n,p,b,h,u){const e=t("ChartEditor");return l(),s("div",null,[n[0]||(n[0]=o("h1",{id:"over-scale-mode",tabindex:"-1"},[r("Over Scale Mode "),o("a",{class:"header-anchor",href:"#over-scale-mode","aria-label":'Permalink to "Over Scale Mode"'},"​")],-1)),n[1]||(n[1]=o("p",null,"Pan and Zoom are allowed only when mouse is over the axis.",-1)),d(e,{code:`// <block:data:1>
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
  reverse: true,
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
  zoom: {
    wheel: {
      enabled: true,
    },
    pinch: {
      enabled: true,
    },
    mode: 'xy',
    scaleMode: 'xy',
  },
  pan: {
    enabled: true,
    mode: 'xy',
    scaleMode: 'xy',
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
        text: () => 'Zoom: ' + zoomStatus() + ', Pan: ' + panStatus(),
      }
    },
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
  }
]

module.exports = {
  actions,
  config,
}
`})])}const z=a(c,[["render",i]]);export{x as __pageData,z as default};
