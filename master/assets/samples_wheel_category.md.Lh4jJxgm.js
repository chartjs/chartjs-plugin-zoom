import{_ as o,C as t,o as s,c as r,j as e,a as l,E as c}from"./chunks/framework.CKPyYSYA.js";const u=JSON.parse('{"title":"Category Scale","description":"","frontmatter":{},"headers":[],"relativePath":"samples/wheel/category.md","filePath":"samples/wheel/category.md","lastUpdated":1795369612000}'),d={name:"samples/wheel/category.md"};function i(m,n,b,p,C,g){const a=t("ChartEditor");return s(),r("div",null,[n[0]||(n[0]=e("h1",{id:"category-scale",tabindex:"-1"},[l("Category Scale "),e("a",{class:"header-anchor",href:"#category-scale","aria-label":'Permalink to "Category Scale"'},"​")],-1)),c(a,{code:`// <block:data:1>
const DATA_COUNT = 20
const NUMBER_CFG = {count: DATA_COUNT, min: -100, max: 100}
const data = {
  labels: Utils.months({count: DATA_COUNT}),
  datasets: [{
    label: 'Dataset 1',
    borderColor: Utils.randomColor(0.7),
    backgroundColor: Utils.randomColor(0.5),
    data: Utils.numbers(NUMBER_CFG),
  }, {
    label: 'Dataset 2',
    borderColor: Utils.randomColor(0.7),
    backgroundColor: Utils.randomColor(0.5),
    data: Utils.numbers(NUMBER_CFG),
  }, {
    label: 'Dataset 3',
    borderColor: Utils.randomColor(0.7),
    backgroundColor: Utils.randomColor(0.5),
    data: Utils.numbers(NUMBER_CFG),
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
    type: 'category',
    min: 5,
    max: 11,
  },
  y: {
    type: 'linear'
  },
}
Object.keys(scales).forEach(scale => Object.assign(scales[scale], scaleOpts))
// </block:scales>

// <block:config:0>
const config = {
  type: 'bar',
  data: data,
  options: {
    scales: scales,
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'xy',
          threshold: 5,
        },
        zoom: {
          wheel: {
            enabled: true
          },
          pinch: {
            enabled: true
          },
          mode: 'xy',
        },
      }
    },
  }
}
// </block:config>

const actions = [
  {
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
`})])}const U=o(d,[["render",i]]);export{u as __pageData,U as default};
