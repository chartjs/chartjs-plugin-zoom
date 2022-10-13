describe('defaults', function() {
  const expected = {
    pan: {
      enabled: false,
      mode: 'xy',
      threshold: 10,
      modifierKey: null,
    },
    zoom: {
      wheel: {
        enabled: false,
        speed: 0.1,
        modifierKey: null
      },
      drag: {
        enabled: false,
        drawTime: 'beforeDatasetsDraw',
        modifierKey: null
      },
      pinch: {
        enabled: false
      },
      mode: 'xy'
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
