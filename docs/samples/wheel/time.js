/* playground-hide */
import Chart from '../../scripts/register.js';
import * as Utils from '../../scripts/utils.js';
/* playground-hide-end */
// data
/* playground-fold */
const NUMBER_CFG = {count: 500, min: 0, max: 1000};
const data = {
  datasets: [{
    label: 'My First dataset',
    borderColor: Utils.randomColor(0.4),
    backgroundColor: Utils.randomColor(0.1),
    pointBorderColor: Utils.randomColor(0.7),
    pointBackgroundColor: Utils.randomColor(0.5),
    pointBorderWidth: 1,
    data: Utils.hourlyPoints(NUMBER_CFG),
  }]
};
/* playground-fold-end */

// scales
/* playground-fold */
const scales = {
  x: {
    position: 'bottom',
    type: 'time',
    ticks: {
      autoSkip: true,
      autoSkipPadding: 50,
      maxRotation: 0
    },
    time: {
      displayFormats: {
        hour: 'HH:mm',
        minute: 'HH:mm',
        second: 'HH:mm:ss'
      }
    }
  },
  y: {
    position: 'right',
    ticks: {
      callback: (val, index, ticks) => index === 0 || index === ticks.length - 1 ? null : val,
    },
    grid: {
      borderColor: Utils.randomColor(1),
      color: 'rgba( 0, 0, 0, 0.1)',
    },
    title: {
      display: true,
      text: (ctx) => ctx.scale.axis + ' axis',
    }
  },
};
/* playground-fold-end */

// zoom
const zoomOptions = {
  zoom: {
    wheel: {
      enabled: true,
    },
    pinch: {
      enabled: true,
    },
    mode: 'xy',
  },
  pan: {
    enabled: true,
    mode: 'xy',
  }
};

// chart
/* playground-fold */
const panStatus = () => zoomOptions.pan.enabled ? 'enabled' : 'disabled';
const zoomStatus = () => zoomOptions.zoom.wheel.enabled ? 'enabled' : 'disabled';

const ctx = document.querySelector('canvas');
const chart = new Chart(ctx, {
  type: 'scatter',
  data: data,
  options: {
    scales: scales,
    plugins: {
      zoom: zoomOptions,
      title: {
        display: true,
        position: 'bottom',
        text: (ctx) => 'Zoom: ' + zoomStatus() + ', Pan: ' + panStatus()
      }
    },
    onClick(e) {
      console.log(e.type);
    }
  }
});
/* playground-fold-end */

// buttons
/* playground-fold */
createButton('Toggle zoom', () => {
  zoomOptions.zoom.wheel.enabled = !zoomOptions.zoom.wheel.enabled;
  zoomOptions.zoom.pinch.enabled = !zoomOptions.zoom.pinch.enabled;
  chart.update();
});
createButton('Toggle pan', () => {
  zoomOptions.pan.enabled = !zoomOptions.pan.enabled;
  chart.update();
});
createButton('Reset zoom', () => chart.resetZoom());
createButton('Zoom to next week', () => {
  chart.zoomScale('x', Utils.nextWeek(), 'default');
  chart.update();
});
createButton('Zoom to 400-600', () => {
  chart.zoomScale('y', {min: 400, max: 600}, 'default');
  chart.update();
});

function createButton(label, handler) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.addEventListener('click', handler);
    document.body.append(btn);
  }
/* playground-fold-end */
