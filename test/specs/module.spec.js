describe('module', function() {
  it ('should be globally exported in ChartZoom', function() {
    expect(typeof window.ChartZoom).toBe('object');
  });

  it ('should be referenced with id "zoom"', function() {
    expect(window.ChartZoom.id).toBe('zoom');
  });

  it ('should expose zoomFunctions, zoomRectFunctions, and panFunctions', function() {
    expect(window.ChartZoom.zoomFunctions instanceof Object).toBe(true);
    expect(window.ChartZoom.zoomRectFunctions instanceof Object).toBe(true);
    expect(window.ChartZoom.panFunctions instanceof Object).toBe(true);
  });

  it ('should be globally registered', function() {
    const plugin = Chart.registry.getPlugin('zoom');
    expect(plugin).toBe(window.ChartZoom);
  });
});
