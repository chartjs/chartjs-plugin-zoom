import {acquireChart, releaseChart, specsFromFixtures, triggerMouseEvent, addMatchers, releaseCharts} from 'chartjs-test-utils';

jasmine.chart = {
  acquire: acquireChart,
  release: releaseChart
};

jasmine.fixture = {
  specs: specsFromFixtures
};
jasmine.triggerMouseEvent = triggerMouseEvent;

beforeEach(function() {
  addMatchers();
});

afterEach(function() {
  releaseCharts();
});
