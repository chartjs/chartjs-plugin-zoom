import{_ as o,C as s,o as r,c as i,j as n,a,E as l}from"./chunks/framework.CKPyYSYA.js";const b=JSON.parse('{"title":"Usage","description":"","frontmatter":{},"headers":[],"relativePath":"guide/usage.md","filePath":"guide/usage.md","lastUpdated":1795464633000}'),d={name:"guide/usage.md"};function c(p,e,u,m,g,h){const t=s("ChartEditor");return r(),i("div",null,[e[0]||(e[0]=n("h1",{id:"usage",tabindex:"-1"},[a("Usage "),n("a",{class:"header-anchor",href:"#usage","aria-label":'Permalink to "Usage"'},"​")],-1)),e[1]||(e[1]=n("p",null,[a("Using the zoom and pan plugin is very simple. Once the plugin is "),n("a",{href:"./integration.html"},"registered"),a(" zoom options provided to the chart will be used. In this example, scroll zoom is enabled.")],-1)),l(t,{code:`/* <block:config:0> */
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
`})])}const _=o(d,[["render",c]]);export{b as __pageData,_ as default};
