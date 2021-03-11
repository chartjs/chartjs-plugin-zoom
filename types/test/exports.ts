import { Chart } from 'chart.js';
import { Zoom } from '../index';

Chart.register(Zoom);
Chart.unregister(Zoom);

const chart = new Chart('id', {
	type: 'bar',
	data: {
		labels: [],
		datasets: [{
			data: []
		}]
	},
	options: {
		plugins: {
			zoom: {
				pan: {
					enabled: true,
					mode: 'x'
				},
				zoom: {	
					enabled: true,
					sensitivity: 0.5,
					mode: 'x',

				}
			},
		}
	},
	plugins: [Zoom]
});
