import{_ as a,C as r,o as s,c as l,j as o,a as t,E as i}from"./chunks/framework.CKPyYSYA.js";const C=JSON.parse('{"title":"Reject outside chartArea","description":"","frontmatter":{},"headers":[],"relativePath":"samples/drag/reject-outside.md","filePath":"samples/drag/reject-outside.md","lastUpdated":1795281397000}'),d={name:"samples/drag/reject-outside.md"};function c(m,n,p,b,u,g){const e=r("ChartEditor");return s(),l("div",null,[n[0]||(n[0]=o("h1",{id:"reject-outside-chartarea",tabindex:"-1"},[t("Reject outside chartArea "),o("a",{class:"header-anchor",href:"#reject-outside-chartarea","aria-label":'Permalink to "Reject outside chartArea"'},"​")],-1)),n[1]||(n[1]=o("p",null,[t("Zooming is performed by clicking and selecting an area over the chart with the mouse. Pan is activated by keeping "),o("code",null,"ctrl"),t(" pressed.")],-1)),i(e,{code:`// <block:data:1>
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
    // here is the magic!
    onZoomStart: ({chart, point}) => chart.isPointInArea(point),
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
`})])}const k=a(d,[["render",c]]);export{C as __pageData,k as default};
