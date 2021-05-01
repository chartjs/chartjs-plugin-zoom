describe('pan', function() {
  describe('auto', jasmine.fixture.specs('pan'));

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

  describe('events', function() {
    it('should call onPanStart', function(done) {
      const startSpy = jasmine.createSpy('started');
      const chart = window.acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              pan: {
                enabled: true,
                mode: 'xy',
                onPanStart: startSpy
              }
            }
          }
        }
      });

      Simulator.gestures.pan(chart.canvas, {deltaX: -350, deltaY: 0, duration: 50}, function() {
        expect(startSpy).toHaveBeenCalled();
        expect(chart.scales.x.min).not.toBe(1);
        done();
      });
    });

    it('should call onPanRejected when onStartPan returns true', function(done) {
      const rejectSpy = jasmine.createSpy('rejected');
      const chart = window.acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              pan: {
                enabled: true,
                mode: 'xy',
                onPanStart: () => true,
                onPanRejected: rejectSpy
              }
            }
          }
        }
      });

      Simulator.gestures.pan(chart.canvas, {deltaX: -350, deltaY: 0, duration: 50}, function() {
        expect(rejectSpy).toHaveBeenCalled();
        expect(chart.scales.x.min).toBe(1);
        done();
      });
    });

    it('should call onPanComplete', function(done) {
      const chart = window.acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              pan: {
                enabled: true,
                mode: 'xy',
                onPanComplete(ctx) {
                  expect(ctx.chart.scales.x.min).not.toBe(1);
                  done();
                }
              }
            }
          }
        }
      });
      Simulator.gestures.pan(chart.canvas, {deltaX: -350, deltaY: 0, duration: 50});
    });
  });
});
