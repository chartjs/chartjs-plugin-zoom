import { Chart } from 'chart.js';
import Zoom, { doPan, doZoom, resetZoom } from '../index';

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
        range: {
          x: {
            min: 1,
            max: 2,
            range: 1
          },
          y: {
            min: 1,
            max: 2,
            range: 1
          }
        },
        zoom: {
          enabled: true,
          mode: 'x',

        }
      },
    }
  },
  plugins: [Zoom]
});

chart.resetZoom();
chart.zoom(1.1);
chart.zoom({ x: 1, y: 1.1, focalPoint: { x: 10, y: 10 } }, true);

chart.pan(10);
chart.pan({ x: 10, y: 20 }, [chart.scales.x]);

doPan(chart, -42);
doZoom(chart, { x: 1, y: 1.1, focalPoint: { x: 10, y: 10 } }, true);
resetZoom(chart);
