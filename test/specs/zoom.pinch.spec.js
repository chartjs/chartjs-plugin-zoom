describe('pinch', () => {
  const data = {
    datasets: [{
      data: [{
        x: 1,
        y: 3
      }, {
        x: 2,
        y: 2
      }, {
        x: 3,
        y: 1
      }]
    }]
  };

  describe('events', () => {
    it('should call onZoomStart', function(done) {
      const startSpy = jasmine.createSpy('started');
      const chart = window.acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              zoom: {
                mode: 'xy',
                onZoomStart: startSpy,
                pinch: {
                  enabled: true,
                },
              },
            }
          }
        }
      });

      Simulator.gestures.pinch(chart.canvas, {pos: [chart.width / 2, chart.height / 2]}, function() {
        expect(startSpy).toHaveBeenCalled();
        expect(chart.scales.x.min).not.toBe(1);
        done();
      });
    });

    it('should call onZoomRejected when onStartZoom returns false', function(done) {
      const rejectSpy = jasmine.createSpy('rejected');
      const chart = window.acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              zoom: {
                mode: 'xy',
                onZoomStart: () => false,
                onZoomRejected: rejectSpy,
                pinch: {
                  enabled: true,
                }
              }
            }
          }
        }
      });

      Simulator.gestures.pinch(chart.canvas, {}, function() {
        expect(rejectSpy).toHaveBeenCalled();
        expect(chart.scales.x.min).toBe(1);
        done();
      });
    });

    it('should call onZoomComplete', function(done) {
      const chart = window.acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              zoom: {
                mode: 'xy',
                onZoomComplete(ctx) {
                  expect(ctx.chart.scales.x.min).not.toBe(1);
                  done();
                },
                pinch: {
                  enabled: true,
                },
              },
            }
          }
        }
      });
      Simulator.gestures.pinch(chart.canvas, {});
    });

  });
});
