import {acquireChart, releaseChart, specsFromFixtures, triggerMouseEvent, addMatchers, releaseCharts} from 'chartjs-test-utils';

// force ratio=1 for tests on high-res/retina devices
// ref https://github.com/chartjs/Chart.js/issues/4515
window.devicePixelRatio = 1;

window.acquireChart = acquireChart;
window.releaseChart = releaseChart;

jasmine.fixture = {
  specs: specsFromFixtures
};
jasmine.triggerMouseEvent = triggerMouseEvent;

jasmine.triggerWheelEvent = function(chart, init = {}) {
  const node = chart.canvas;
  const rect = node.getBoundingClientRect();
  const event = new WheelEvent('wheel', Object.assign({}, init, {
    clientX: rect.left + init.x,
    clientY: rect.top + init.y,
    cancelable: true,
    bubbles: true,
    view: window
  }));

  node.dispatchEvent(event);
};

jasmine.dispatchEvent = function(chart, type, pt, init = {}) {
  const node = chart.canvas;
  const rect = node.getBoundingClientRect();
  const event = new MouseEvent(type, Object.assign({}, init, {
    clientX: rect.left + pt.x,
    clientY: rect.top + pt.y,
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

beforeAll(() => {
  // Disable colors plugin for tests.
  window.Chart.defaults.plugins.colors.enabled = false;
});
