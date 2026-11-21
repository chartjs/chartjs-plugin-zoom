import{_ as e,C as r,o as s,c as i,j as o,a,E as l}from"./chunks/framework.CKPyYSYA.js";const h=JSON.parse('{"title":"Linear Scales + maintainAspectRatio","description":"","frontmatter":{},"headers":[],"relativePath":"samples/drag/linear-ratio.md","filePath":"samples/drag/linear-ratio.md","lastUpdated":1795288291000}'),d={name:"samples/drag/linear-ratio.md"};function c(m,n,p,b,g,C){const t=r("ChartEditor");return s(),i("div",null,[n[0]||(n[0]=o("h1",{id:"linear-scales-maintainaspectratio",tabindex:"-1"},[a("Linear Scales + maintainAspectRatio "),o("a",{class:"header-anchor",href:"#linear-scales-maintainaspectratio","aria-label":'Permalink to "Linear Scales + maintainAspectRatio"'},"​")],-1)),n[1]||(n[1]=o("p",null,[a("Zooming is performed by clicking and selecting an area over the chart with the mouse. Pan is activated by keeping "),o("code",null,"shift"),a(" pressed.")],-1)),l(t,{code:`// <block:data:1>
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
    modifierKey: 'shift',
  },
  zoom: {
    mode: 'xy',
    drag: {
      enabled: true,
      borderColor: 'rgb(54, 162, 235)',
      borderWidth: 1,
      backgroundColor: 'rgba(54, 162, 235, 0.3)',
      maintainAspectRatio: true,
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
`})])}const k=e(d,[["render",c]]);export{h as __pageData,k as default};
