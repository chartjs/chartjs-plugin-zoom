import{_ as a,C as s,o as r,c as l,j as o,a as t,E as i}from"./chunks/framework.CKPyYSYA.js";const k=JSON.parse('{"title":"Time Scale","description":"","frontmatter":{},"headers":[],"relativePath":"samples/drag/time.md","filePath":"samples/drag/time.md","lastUpdated":1795371336000}'),d={name:"samples/drag/time.md"};function c(m,n,p,u,b,h){const e=s("ChartEditor");return r(),l("div",null,[n[0]||(n[0]=o("h1",{id:"time-scale",tabindex:"-1"},[t("Time Scale "),o("a",{class:"header-anchor",href:"#time-scale","aria-label":'Permalink to "Time Scale"'},"​")],-1)),n[1]||(n[1]=o("p",null,[t("Zooming is performed by clicking and selecting an area over the chart with the mouse. Pan is activated by keeping "),o("code",null,"ctrl"),t(" pressed.")],-1)),i(e,{code:`// <block:data:1>
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
  pan: {
    enabled: true,
    modifierKey: 'ctrl',
  },
  zoom: {
    drag: {
      enabled: true
    },
    mode: 'xy',
  },
}
// </block>

const panStatus = () => zoomOptions.pan.enabled ? 'enabled' : 'disabled'
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
        text: () => 'Zoom: ' + zoomStatus() + ', Pan: ' + panStatus()
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
}
`})])}const x=a(d,[["render",c]]);export{k as __pageData,x as default};
