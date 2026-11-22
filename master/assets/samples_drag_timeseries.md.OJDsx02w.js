import{_ as a,C as s,o as r,c as i,j as e,a as o,E as l}from"./chunks/framework.CKPyYSYA.js";const k=JSON.parse('{"title":"Timeseries Scale","description":"","frontmatter":{},"headers":[],"relativePath":"samples/drag/timeseries.md","filePath":"samples/drag/timeseries.md","lastUpdated":1795369612000}'),d={name:"samples/drag/timeseries.md"};function c(m,n,p,b,u,g){const t=s("ChartEditor");return r(),i("div",null,[n[0]||(n[0]=e("h1",{id:"timeseries-scale",tabindex:"-1"},[o("Timeseries Scale "),e("a",{class:"header-anchor",href:"#timeseries-scale","aria-label":'Permalink to "Timeseries Scale"'},"​")],-1)),n[1]||(n[1]=e("p",null,[o("Zooming is performed by clicking and selecting an area over the chart with the mouse. Pan is activated by keeping "),e("code",null,"ctrl"),o(" pressed.")],-1)),l(t,{code:`// <block:data:1>
const NUMBER_CFG = {count: 200, min: 0, max: 100}
const data = {
  datasets: [{
    label: 'My First dataset',
    borderColor: Utils.randomColor(0.4),
    backgroundColor: Utils.randomColor(0.1),
    pointBorderColor: Utils.randomColor(0.7),
    pointBackgroundColor: Utils.randomColor(0.5),
    pointBorderWidth: 1,
    data: Utils.officeHourPoints(NUMBER_CFG),
  }]
}
// </block:data>

// <block:scales:2>
const scales = {
  x: {
    position: 'bottom',
    type: 'timeseries',
    ticks: {
      autoSkip: true,
      autoSkipPadding: 50,
      maxRotation: 0,
      major: {
        enabled: true
      }
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
      enabled: true,
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
  }

]

module.exports = {
  actions,
  config,
}
`})])}const x=a(d,[["render",c]]);export{k as __pageData,x as default};
