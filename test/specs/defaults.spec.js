describe('defaults', function() {
  const expected = {
    pan: {
      enabled: false,
      mode: 'xy',
      speed: 20,
      threshold: 10,
      modifierKey: null,
    },
    zoom: {
      enabled: false,
      mode: 'xy',
      speed: 0.1,
      wheelModifierKey: null
    }
  };

  it('should be registered as global plugin options', function() {
    expect(Chart.defaults.plugins.zoom).toEqual(expected);
  });

  it('should be called with default options', function() {
    const plugin = Chart.registry.getPlugin('zoom');
    const spy = spyOn(plugin, 'beforeUpdate');

    const chart = window.acquireChart({
      type: 'line',
      data: {
        datasets: [{
          data: []
        }]
      }
    });

    expect(spy).toHaveBeenCalledWith(chart, {cancelable: true, mode: undefined}, expected);
  });
});
