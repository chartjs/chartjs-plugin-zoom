describe('pan', function() {
  const data = {
    labels: ['a', 'b', 'c', 'd', 'e'],
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

  describe('delta', function() {
    it('should be applied cumulatively', function() {
      const chart = window.acquireChart({
        type: 'line',
        data,
        options: {
          plugins: {
            zoom: {
              pan: {
                enabled: true,
                mode: 'x',
              }
            }
          },
          scales: {
            x: {
              min: 1,
              max: 2
            }
          }
        }
      });
      const scale = chart.scales.x;
      expect(scale.min).toBe(1);
      expect(scale.max).toBe(2);
      chart.pan(20);
      expect(scale.min).toBe(1);
      expect(scale.max).toBe(2);
      chart.pan(20);
      expect(scale.min).toBe(1);
      expect(scale.max).toBe(2);
      chart.pan(20);
      expect(scale.min).toBe(0);
      expect(scale.max).toBe(1);
    });

    it('should not give credit', function() {
      const chart = window.acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              limits: {
                x: {
                  max: 4
                }
              },
              pan: {
                enabled: true,
                mode: 'x',
              }
            }
          },
          scales: {
            x: {
              min: 1,
              max: 3
            }
          }
        }
      });
      const scale = chart.scales.x;
      expect(scale.min).toBe(1);
      expect(scale.max).toBe(3);
      chart.pan(-2000);
      expect(scale.min).toBe(2);
      expect(scale.max).toBe(4);
      chart.pan(-2000);
      expect(scale.min).toBe(2);
      expect(scale.max).toBe(4);
      chart.pan(50);
      expect(scale.min).toBeLessThan(2);
      expect(scale.max).toBe(scale.min + 2);
    });

    it('should handle zero-dimension scales', function() {
      const chart = window.acquireChart({
        type: 'line',
        data,
        options: {
          plugins: {
            zoom: {
              pan: {
                enabled: true,
                mode: 'y',
              }
            }
          },
          scales: {
            y: {
              type: 'linear',
              min: 2,
              max: 2
            }
          }
        }
      });
      const scale = chart.scales.y;
      expect(scale.min).toBe(2);
      expect(scale.max).toBe(2);
      chart.pan(50);
      expect(scale.min).toBe(2);
      expect(scale.max).toBe(2);
      expect(scale.options.min).toBe(2);
      expect(scale.options.max).toBe(2);
    });

    it('should respect original limits', function() {
      const chart = window.acquireChart({
        type: 'line',
        data,
        options: {
          plugins: {
            zoom: {
              pan: {
                enabled: true,
                mode: 'x',
              },
              limits: {
                x: {
                  min: 'original',
                  max: 'original',
                }
              },
            }
          },
          scales: {
            x: {
              min: 1,
              max: 2
            }
          }
        }
      });
      const scale = chart.scales.x;
      expect(scale.min).toBe(1);
      expect(scale.max).toBe(2);
      chart.pan(100);
      expect(scale.min).toBe(1);
      expect(scale.max).toBe(2);
    });

    it('should respect original limits for nonlinear scales', function() {
      const chart = window.acquireChart({
        type: 'line',
        data,
        options: {
          plugins: {
            zoom: {
              pan: {
                enabled: true,
                mode: 'x',
              },
              limits: {
                x: {
                  min: 'original',
                  max: 'original',
                }
              },
            }
          },
          scales: {
            x: {
              type: 'logarithmic',
              min: 1,
              max: 10
            }
          }
        }
      });
      const scale = chart.scales.x;
      expect(scale.min).toBe(1);
      expect(scale.max).toBe(10);
      chart.pan(100);
      expect(scale.min).toBe(1);
      expect(scale.max).toBe(10);
    });
  });

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

    it('should call onPanRejected when onStartPan returns false', function(done) {
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
                onPanStart: () => false,
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
