/* playground-hide */
import Chart from './register.js';
/* playground-hide-end */
const ctx = document.querySelector('canvas');

const chart = new Chart(ctx, {
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
            enabled: true,
          },
          mode: 'xy',
        }
      }
    }
  }
});

const btnResetZoom = document.createElement('button');
btnResetZoom.textContent = 'Reset zoom';
document.body.append(btnResetZoom);
btnResetZoom.addEventListener('click', () => {
  chart.resetZoom();
})