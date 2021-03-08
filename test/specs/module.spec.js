import Chart from 'chart.js';

describe('module', function() {
  it ('should be globally exported in ChartZoom', function() {
    expect(typeof window.ChartZoom).toBe('object');
  });

  it ('should be referenced with id "zoom"', function() {
    expect(window.ChartZoom.id).toBe('zoom');
  });

  it ('should be globally registered', function() {
    var plugin = Chart.registry.getPlugin('zoom');
    expect(plugin).toBe(window.ChartZoom);
  });
});
