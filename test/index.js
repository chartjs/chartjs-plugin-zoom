import Chart from 'chart.js';
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

	Chart.helpers.merge(Chart.defaults, {
		animation: false,
		legend: {display: false},
		responsive: false,
		title: {display: false},
		tooltips: {enabled: false},
		elements: {
			arc: {
				backgroundColor: 'transparent',
				borderColor: 'rgba(0, 0, 0, 0.1)',
				borderWidth: 1
			},
			point: {
				backgroundColor: 'transparent',
				borderColor: 'rgba(0, 0, 0, 0.1)',
				borderWidth: 1
			},
			bar: {
				backgroundColor: 'transparent',
				borderColor: 'rgba(0, 0, 0, 0.1)',
				borderWidth: 1
			}
		}
	});

	Chart.helpers.merge(Chart.defaults.scale, {
		display: false,
		beginAtZero: true
	});
});

afterEach(function() {
	releaseCharts();
});
