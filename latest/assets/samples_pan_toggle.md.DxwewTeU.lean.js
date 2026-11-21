import{_ as t,C as e,o as s,c as l,j as o,a as r,E as i}from"./chunks/framework.Czuc6okr.js";const u=JSON.parse('{"title":"Pan Toggle","description":"","frontmatter":{},"headers":[],"relativePath":"samples/pan/toggle.md","filePath":"samples/pan/toggle.md","lastUpdated":1795285674000}'),c={name:"samples/pan/toggle.md"};function d(p,n,m,g,b,C){const a=e("ChartEditor");return s(),l("div",null,[n[0]||(n[0]=o("h1",{id:"pan-toggle",tabindex:"-1"},[r("Pan Toggle "),o("a",{class:"header-anchor",href:"#pan-toggle","aria-label":'Permalink to "Pan Toggle"'},"​")],-1)),n[1]||(n[1]=o("p",null,"In this example pan is initially disabled.",-1)),i(a,{code:`// <block:data:1>
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
    enabled: false,
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
}
// </block:config>

const actions = [
  {
    name: 'Toggle pan',
    handler(chart) {
      chart.options.plugins.zoom.pan.enabled = !chart.options.plugins.zoom.pan.enabled
      chart.update()
    }
  },
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
}
`})])}const x=t(c,[["render",d]]);export{u as __pageData,x as default};
