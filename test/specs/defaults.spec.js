import Chart from 'chart.js';

describe('defaults', function() {
	const expected = {
		pan: {
			enabled: false,
			mode: 'xy',
			speed: 20,
			threshold: 10
		},
		zoom: {
			enabled: false,
			mode: 'xy',
			sensitivity: 3,
			speed: 0.1
		}
	};

	it('should be registered as global plugin options', function() {
		expect(Chart.defaults.global.plugins.zoom).toEqual(expected);
	});

	it('should be called with default options', function() {
		const plugin = Chart.plugins.getAll().filter(p => p.id === 'zoom')[0];
		const spy = spyOn(plugin, 'beforeUpdate');

		const chart = jasmine.chart.acquire({
			type: 'line',
			data: {
				datasets: [{
					data: []
				}]
			}
		});

		expect(spy).toHaveBeenCalledWith(chart, expected);
	});
});
