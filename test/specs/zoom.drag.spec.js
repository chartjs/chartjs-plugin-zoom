describe('zoom with drag', function() {
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
                drag: {
                  enabled: true
                },
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
                drag: {
                  enabled: true
                },
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
                drag: {
                  enabled: true
                },
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
                drag: {
                  enabled: true
                },
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
                drag: {
                  enabled: true
                },
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

  describe('with modifierKey', function() {
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
                    drag: {
                      enabled: true,
                      modifierKey: key,
                    },
                    mode: 'x',
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

          const pt = {
            x: scaleX.getPixelForValue(1.5),
            y: scaleY.getPixelForValue(1.1),
          };
          const pt2 = {x: pt.x + 20, y: pt.y + 20};
          const init = {};
          if (pressed) {
            init[key + 'Key'] = true;
          }

          jasmine.dispatchEvent(chart, 'mousedown', pt, init);
          jasmine.dispatchEvent(chart, 'mousemove', pt2, init);
          jasmine.dispatchEvent(chart, 'mouseup', pt2, init);

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

  describe('drag with pan.modifierKey', function() {
    for (const key of ['ctrl', 'alt', 'shift', 'meta']) {
      for (const pressed of [true, false]) {
        let chart, scaleX, scaleY;
        it(`should ${pressed ? 'not ' : ''}change ${pressed ? 'without' : 'with'} key ${key}`, async function() {
          const rejectedSpy = jasmine.createSpy('zoomRejected');
          const clickSpy = jasmine.createSpy('clicked');
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
                  pan: {
                    enabled: true,
                    modifierKey: key,
                  },
                  zoom: {
                    drag: {
                      enabled: true,
                    },
                    mode: 'x',
                    onZoomRejected: rejectedSpy
                  }
                }
              },
              onClick: clickSpy
            }
          });

          scaleX = chart.scales.x;
          scaleY = chart.scales.y;

          const oldMinX = scaleX.options.min;
          const oldMaxX = scaleX.options.max;

          const pt = {
            x: scaleX.getPixelForValue(1.5),
            y: scaleY.getPixelForValue(1.1),
          };
          const pt2 = {x: pt.x + 20, y: pt.y + 20};
          const init = {};
          if (pressed) {
            init[key + 'Key'] = true;
          }

          jasmine.dispatchEvent(chart, 'mousedown', pt, init);
          jasmine.dispatchEvent(chart, 'mousemove', pt2, init);
          jasmine.dispatchEvent(chart, 'mouseup', pt2, init);

          if (pressed) {
            expect(scaleX.options.min).toEqual(oldMinX);
            expect(scaleX.options.max).toEqual(oldMaxX);
            expect(rejectedSpy).toHaveBeenCalled();
          } else {
            expect(scaleX.options.min).not.toEqual(oldMinX);
            expect(scaleX.options.max).not.toEqual(oldMaxX);
            expect(rejectedSpy).not.toHaveBeenCalled();
          }
          expect(clickSpy).not.toHaveBeenCalled();
        });
      }
    }
  });

  describe('events', function() {
    it('should call onZoomStart, onZoom and onZoomComplete', function(done) {
      const startSpy = jasmine.createSpy('start');
      const zoomSpy = jasmine.createSpy('zoom');
      const chart = window.acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              zoom: {
                drag: {
                  enabled: true,
                },
                mode: 'xy',
                onZoomStart: startSpy,
                onZoom: zoomSpy,
                onZoomComplete: () => done()
              }
            }
          }
        }
      });

      const pt = {
        x: chart.scales.x.getPixelForValue(1.5),
        y: chart.scales.y.getPixelForValue(1.1),
      };
      const pt2 = {x: pt.x + 20, y: pt.y + 20};

      expect(chart.isZoomingOrPanning()).toBe(false);

      jasmine.dispatchEvent(chart, 'mousedown', pt);
      jasmine.dispatchEvent(chart, 'mousemove', pt2);

      expect(chart.isZoomingOrPanning()).toBe(true);

      jasmine.dispatchEvent(chart, 'mouseup', pt2);

      // Drag state isn't cleared until a timeout fires (later), so we can't
      // easily test this here.
      // expect(chart.isZoomingOrPanning()).toBe(false);

      expect(startSpy).toHaveBeenCalled();
      expect(zoomSpy).toHaveBeenCalled();
    });

    it('should call onZoomRejected when onZoomStart returns false', function() {
      const zoomSpy = jasmine.createSpy('zoom');
      const rejectSpy = jasmine.createSpy('reject');
      const doneSpy = jasmine.createSpy('done');
      const chart = window.acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              zoom: {
                drag: {
                  enabled: true,
                },
                mode: 'xy',
                onZoomStart: () => false,
                onZoom: zoomSpy,
                onZoomComplete: doneSpy,
                onZoomRejected: rejectSpy
              }
            }
          }
        }
      });

      const pt = {
        x: chart.scales.x.getPixelForValue(1.5),
        y: chart.scales.y.getPixelForValue(1.1),
      };
      const pt2 = {x: pt.x + 20, y: pt.y + 20};

      expect(chart.isZoomingOrPanning()).toBe(false);

      jasmine.dispatchEvent(chart, 'mousedown', pt);

      expect(chart.isZoomingOrPanning()).toBe(false);

      jasmine.dispatchEvent(chart, 'mousemove', pt2);
      jasmine.dispatchEvent(chart, 'mouseup', pt2);

      expect(chart.isZoomingOrPanning()).toBe(false);

      expect(rejectSpy).toHaveBeenCalled();
      expect(zoomSpy).not.toHaveBeenCalled();
      expect(doneSpy).not.toHaveBeenCalled();
    });
  });
});
