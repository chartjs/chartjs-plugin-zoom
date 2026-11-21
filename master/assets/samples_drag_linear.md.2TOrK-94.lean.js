import{_ as t,C as r,o as s,c as l,j as o,a as e,E as i}from"./chunks/framework.CKPyYSYA.js";const k=JSON.parse('{"title":"Linear Scales","description":"","frontmatter":{},"headers":[],"relativePath":"samples/drag/linear.md","filePath":"samples/drag/linear.md","lastUpdated":1795285674000}'),d={name:"samples/drag/linear.md"};function c(m,n,p,b,g,C){const a=r("ChartEditor");return s(),l("div",null,[n[0]||(n[0]=o("h1",{id:"linear-scales",tabindex:"-1"},[e("Linear Scales "),o("a",{class:"header-anchor",href:"#linear-scales","aria-label":'Permalink to "Linear Scales"'},"​")],-1)),n[1]||(n[1]=o("p",null,[e("Zooming is performed by clicking and selecting an area over the chart with the mouse. Pan is activated by keeping "),o("code",null,"ctrl"),e(" pressed.")],-1)),i(a,{code:`// <block:data:1>
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
  pan: {
    enabled: true,
    mode: 'xy',
    modifierKey: 'ctrl',
  },
  zoom: {
    mode: 'xy',
    drag: {
      enabled: true,
      borderColor: 'rgb(54, 162, 235)',
      borderWidth: 1,
      backgroundColor: 'rgba(54, 162, 235, 0.3)'
    }
  }
}
// </block:zoom>

const zoomStatus = () => zoomOptions.zoom.drag.enabled ? 'enabled' : 'disabled'

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
        text: () => 'Zoom: ' + zoomStatus()
      }
    },
  }
}
// </block:config>

const actions = [
  {
    name: 'Toggle zoom',
    handler(chart) {
      zoomOptions.zoom.drag.enabled = !zoomOptions.zoom.drag.enabled
      chart.update()
    }
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
`})])}const h=t(d,[["render",c]]);export{k as __pageData,h as default};
