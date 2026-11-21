import{_ as t,C as e,o as r,c as s,j as a,a as l,E as c}from"./chunks/framework.Czuc6okr.js";const u=JSON.parse('{"title":"API","description":"","frontmatter":{},"headers":[],"relativePath":"samples/api.md","filePath":"samples/api.md","lastUpdated":1795285674000}'),i={name:"samples/api.md"};function d(m,n,p,h,x,C){const o=e("ChartEditor");return r(),s("div",null,[n[0]||(n[0]=a("h1",{id:"api",tabindex:"-1"},[l("API "),a("a",{class:"header-anchor",href:"#api","aria-label":'Permalink to "API"'},"​")],-1)),c(o,{code:`// <block:data:1>
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

// <block:config:1>
const config = {
  type: 'scatter',
  data: data,
  options: {
    scales: scales,
  }
}
// </block:config>

// <block:actions:0>
// Note: changes to these actions are not applied to the buttons.
const actions = [
  {
    name: 'Zoom +10%',
    handler(chart) {
      chart.zoom(1.1)
    }
  }, {
    name: 'Zoom -10%',
    handler(chart) {
      chart.zoom(2 - 1 / 0.9)
    },
  }, {
    name: 'Zoom x +10%',
    handler(chart) {
      chart.zoom({x: 1.1})
    }
  }, {
    name: 'Zoom x -10%',
    handler(chart) {
      chart.zoom({x: 2 - 1 / 0.9})
    },
  }, {
    name: 'Pan x 100px (anim)',
    handler(chart) {
      chart.pan({x: 100}, undefined, 'default')
    }
  }, {
    name: 'Pan x -100px (anim)',
    handler(chart) {
      chart.pan({x: -100}, undefined, 'default')
    },
  }, {
    name: 'Zoom x: 0..-100, y: 0..100',
    handler(chart) {
      chart.zoomScale('x', {min: -100, max: 0}, 'default')
      chart.zoomScale('y', {min: 0, max: 100}, 'default')
    }
  }, {
    name: 'Reset zoom',
    handler(chart) {
      chart.resetZoom()
    }
  }
]
// </block:actions>

module.exports = {
  actions,
  config
}
`})])}const f=t(i,[["render",d]]);export{u as __pageData,f as default};
