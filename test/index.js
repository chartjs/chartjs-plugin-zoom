import {acquireChart, releaseChart, specsFromFixtures, triggerMouseEvent, addMatchers, releaseCharts} from 'chartjs-test-utils';

window.acquireChart = acquireChart;
window.releaseChart = releaseChart;

jasmine.fixture = {
  specs: specsFromFixtures
};
jasmine.triggerMouseEvent = triggerMouseEvent;

jasmine.triggerWheelEvent = function(chart, init = {}) {
  var node = chart.canvas;
  var rect = node.getBoundingClientRect();
  var event = new WheelEvent('wheel', Object.assign({}, init, {
    clientX: rect.left + init.x,
    clientY: rect.top + init.y,
    cancelable: true,
    bubbles: true,
    view: window
  }));

  node.dispatchEvent(event);
};

beforeEach(function() {
  addMatchers();
});

afterEach(function() {
  releaseCharts();
});
