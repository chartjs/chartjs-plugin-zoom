import Chart from 'chart.js';

describe('defaults', function() {
	it('should be registered as global plugin options', function() {
		expect(Chart.Zoom.defaults).toEqual({
			pan: {
				enabled: true,
				mode: 'xy',
				speed: 20,
				threshold: 10
			},
			zoom: {
				enabled: true,
				mode: 'xy',
				sensitivity: 3
			}
		});
	});
});
