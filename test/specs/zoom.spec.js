describe('zoom', function() {
  describe('auto', jasmine.fixture.specs('zoom'));

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

  describe('with drag', function() {
    describe('on linear scale', function() {
      let chart, scaleX, scaleY;

      it('should be applied on X scale when mode = x', function() {
        chart = window.acquireChart({
          type: 'line',
          data,
          options: {
            scales: {
              xScale0: {
                id: 'xScale0',
                type: 'linear'
              },
              yScale0: {
                id: 'yScale0',
                type: 'linear'
              }
            },
            plugins: {
              zoom: {
                zoom: {
                  enabled: true,
                  drag: true,
                  mode: 'x'
                }
              }
            }
          }
        });

        scaleX = chart.scales.xScale0;
        scaleY = chart.scales.yScale0;

        jasmine.triggerMouseEvent(chart, 'mousedown', {
          x: scaleX.getPixelForValue(1.5),
          y: scaleY.getPixelForValue(1.1)
        });
        jasmine.triggerMouseEvent(chart, 'mouseup', {
          x: scaleX.getPixelForValue(2.8),
          y: scaleY.getPixelForValue(1.7)
        });

        expect(scaleX.options.min).toBeCloseTo(1.5);
        expect(scaleX.options.max).toBeCloseTo(2.8);
        expect(scaleY.options.min).toBeUndefined();
        expect(scaleY.options.max).toBeUndefined();
      });

      it('should be applied on X scale when mode = f() => x', function() {
        chart = window.acquireChart({
          type: 'line',
          data,
          options: {
            scales: {
              xScale0: {
                id: 'xScale0',
                type: 'linear'
              },
              yScale0: {
                id: 'yScale0',
                type: 'linear'
              }
            },
            plugins: {
              zoom: {
                zoom: {
                  enabled: true,
                  drag: true,
                  mode: function() {
                    return 'x';
                  }
                }
              }
            }
          }
        });

        scaleX = chart.scales.xScale0;
        scaleY = chart.scales.yScale0;

        jasmine.triggerMouseEvent(chart, 'mousedown', {
          x: scaleX.getPixelForValue(1.5),
          y: scaleY.getPixelForValue(1.1)
        });
        jasmine.triggerMouseEvent(chart, 'mouseup', {
          x: scaleX.getPixelForValue(2.8),
          y: scaleY.getPixelForValue(1.7)
        });

        expect(scaleX.options.min).toBeCloseTo(1.5);
        expect(scaleX.options.max).toBeCloseTo(2.8);
        expect(scaleY.options.min).toBeUndefined();
        expect(scaleY.options.max).toBeUndefined();
      });

      it('should be applied on Y scale when mode = y', function() {
        chart = window.acquireChart({
          type: 'line',
          data,
          options: {
            scales: {
              xScale0: {
                id: 'xScale0',
                type: 'linear'
              },
              yScale0: {
                id: 'yScale0',
                type: 'linear'
              }
            },
            plugins: {
              zoom: {
                zoom: {
                  enabled: true,
                  drag: true,
                  mode: 'y'
                }
              }
            }
          }
        });

        scaleX = chart.scales.xScale0;
        scaleY = chart.scales.yScale0;

        jasmine.triggerMouseEvent(chart, 'mousedown', {
          x: scaleX.getPixelForValue(1.5),
          y: scaleY.getPixelForValue(1.1)
        });
        jasmine.triggerMouseEvent(chart, 'mouseup', {
          x: scaleX.getPixelForValue(2.8),
          y: scaleY.getPixelForValue(1.7)
        });

        expect(scaleX.options.min).toBeUndefined();
        expect(scaleX.options.max).toBeUndefined();
        expect(scaleY.options.min).toBeCloseTo(1.1);
        expect(scaleY.options.max).toBeCloseTo(1.7);
      });

      it('should be applied on Y scale when mode = f() => y', function() {
        chart = window.acquireChart({
          type: 'line',
          data,
          options: {
            scales: {
              xScale0: {
                id: 'xScale0',
                type: 'linear'
              },
              yScale0: {
                id: 'yScale0',
                type: 'linear'
              }
            },
            plugins: {
              zoom: {
                zoom: {
                  enabled: true,
                  drag: true,
                  mode: function() {
                    return 'y';
                  }
                }
              }
            }
          }
        });

        scaleX = chart.scales.xScale0;
        scaleY = chart.scales.yScale0;

        jasmine.triggerMouseEvent(chart, 'mousedown', {
          x: scaleX.getPixelForValue(1.5),
          y: scaleY.getPixelForValue(1.1)
        });
        jasmine.triggerMouseEvent(chart, 'mouseup', {
          x: scaleX.getPixelForValue(2.8),
          y: scaleY.getPixelForValue(1.7)
        });

        expect(scaleX.options.min).toBeUndefined();
        expect(scaleX.options.max).toBeUndefined();
        expect(scaleY.options.min).toBeCloseTo(1.1);
        expect(scaleY.options.max).toBeCloseTo(1.7);
      });

      it('should be applied on X and Y scales when mode = xy', function() {
        chart = window.acquireChart({
          type: 'line',
          data,
          options: {
            scales: {
              xScale0: {
                id: 'xScale0',
                type: 'linear'
              },
              yScale0: {
                id: 'yScale0',
                type: 'linear'
              }
            },
            plugins: {
              zoom: {
                zoom: {
                  enabled: true,
                  drag: true,
                  mode: 'xy'
                }
              }
            }
          }
        });

        scaleX = chart.scales.xScale0;
        scaleY = chart.scales.yScale0;

        jasmine.triggerMouseEvent(chart, 'mousedown', {
          x: scaleX.getPixelForValue(1.5),
          y: scaleY.getPixelForValue(1.1)
        });
        jasmine.triggerMouseEvent(chart, 'mouseup', {
          x: scaleX.getPixelForValue(2.8),
          y: scaleY.getPixelForValue(1.7)
        });

        expect(scaleX.options.min).toBeCloseTo(1.5);
        expect(scaleX.options.max).toBeCloseTo(2.8);
        expect(scaleY.options.min).toBeCloseTo(1.1);
        expect(scaleY.options.max).toBeCloseTo(1.7);
      });
    });
  });

  describe('with wheelModifierKey', function() {
    for (const key of ['ctrl', 'alt', 'shift', 'meta']) {
      for (const pressed of [true, false]) {
        let chart, scaleX, scaleY;
        it(`should ${pressed ? '' : 'not '}change ${pressed ? 'with' : 'without'} key ${key}`, async function() {
          const rejectedSpy = jasmine.createSpy('wheelFailed');
          chart = window.acquireChart({
            type: 'line',
            data,
            options: {
              scales: {
                x: {
                  type: 'linear',
                  min: 0,
                  max: 10
                },
                y: {
                  type: 'linear'
                }
              },
              plugins: {
                zoom: {
                  zoom: {
                    enabled: true,
                    mode: 'x',
                    wheelModifierKey: key,
                    onZoomRejected: rejectedSpy
                  }
                }
              }
            }
          });

          scaleX = chart.scales.x;
          scaleY = chart.scales.y;

          const oldMinX = scaleX.options.min;
          const oldMaxX = scaleX.options.max;

          const wheelEv = {
            x: scaleX.getPixelForValue(1.5),
            y: scaleY.getPixelForValue(1.1),
            deltaY: 1
          };
          if (pressed) {
            wheelEv[key + 'Key'] = true;
          }

          await jasmine.triggerWheelEvent(chart, wheelEv);

          if (pressed) {
            expect(scaleX.options.min).not.toEqual(oldMinX);
            expect(scaleX.options.max).not.toEqual(oldMaxX);
            expect(rejectedSpy).not.toHaveBeenCalled();
          } else {
            expect(scaleX.options.min).toEqual(oldMinX);
            expect(scaleX.options.max).toEqual(oldMaxX);
            expect(rejectedSpy).toHaveBeenCalled();
          }
        });
      }
    }
  });
});
