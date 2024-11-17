describe('zoom with wheel', function() {
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
                    wheel: {
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

          const wheelEv = {
            x: scaleX.getPixelForValue(1.5),
            y: scaleY.getPixelForValue(1.1),
            deltaY: 1
          };
          if (pressed) {
            wheelEv[key + 'Key'] = true;
          }

          jasmine.triggerWheelEvent(chart, wheelEv);

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

  describe('with overScaleMode = y and mode = xy', function() {
    const config = {
      type: 'line',
      data,
      options: {
        scales: {
          x: {
            type: 'linear',
            min: 1,
            max: 10
          },
          y: {
            type: 'linear'
          }
        },
        plugins: {
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
              },
              mode: 'xy',
              overScaleMode: 'y'
            }
          }
        }
      }
    };

    describe('Wheel under Y scale', function() {
      it('should be applied on Y, but not on X scales.', function() {
        const chart = window.acquireChart(config);

        const scaleX = chart.scales.x;
        const scaleY = chart.scales.y;

        const oldMinX = scaleX.options.min;
        const oldMaxX = scaleX.options.max;
        const oldMinY = scaleY.options.min;
        const oldMaxY = scaleY.options.max;

        const wheelEv = {
          x: scaleY.left + (scaleY.right - scaleY.left) / 2,
          y: scaleY.top + (scaleY.bottom - scaleY.top) / 2,
          deltaY: 1
        };

        jasmine.triggerWheelEvent(chart, wheelEv);

        expect(scaleX.options.min).toEqual(oldMinX);
        expect(scaleX.options.max).toEqual(oldMaxX);
        expect(scaleY.options.min).not.toEqual(oldMinY);
        expect(scaleY.options.max).not.toEqual(oldMaxY);
      });
    });

    describe('Wheel not under Y scale', function() {
      it('should be applied on X, but not on Y scales.', function() {
        const chart = window.acquireChart(config);

        const scaleX = chart.scales.x;
        const scaleY = chart.scales.y;

        const oldMinX = scaleX.options.min;
        const oldMaxX = scaleX.options.max;
        const oldMinY = scaleY.options.min;
        const oldMaxY = scaleY.options.max;

        const wheelEv = {
          x: scaleX.getPixelForValue(1.5),
          y: scaleY.getPixelForValue(1.1),
          deltaY: 1
        };

        jasmine.triggerWheelEvent(chart, wheelEv);

        expect(scaleX.options.min).not.toEqual(oldMinX);
        expect(scaleX.options.max).not.toEqual(oldMaxX);
        expect(scaleY.options.min).toEqual(oldMinY);
        expect(scaleY.options.max).toEqual(oldMaxY);
      });
    });
  });

  describe('with scaleMode = y and mode = xy', function() {
    const config = {
      type: 'line',
      data,
      options: {
        scales: {
          x: {
            type: 'linear',
            min: 1,
            max: 10
          },
          y: {
            type: 'linear'
          }
        },
        plugins: {
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
              },
              mode: 'xy',
              scaleMode: 'y'
            }
          }
        }
      }
    };

    describe('Wheel under Y scale', function() {
      it('should be applied on Y, but not on X scales.', function() {
        const chart = window.acquireChart(config);

        const scaleX = chart.scales.x;
        const scaleY = chart.scales.y;

        const oldMinX = scaleX.options.min;
        const oldMaxX = scaleX.options.max;
        const oldMinY = scaleY.options.min;
        const oldMaxY = scaleY.options.max;

        const wheelEv = {
          x: scaleY.left + (scaleY.right - scaleY.left) / 2,
          y: scaleY.top + (scaleY.bottom - scaleY.top) / 2,
          deltaY: 1
        };

        jasmine.triggerWheelEvent(chart, wheelEv);

        expect(scaleX.options.min).toEqual(oldMinX);
        expect(scaleX.options.max).toEqual(oldMaxX);
        expect(scaleY.options.min).not.toEqual(oldMinY);
        expect(scaleY.options.max).not.toEqual(oldMaxY);
      });
    });

    describe('Wheel not under Y scale', function() {
      it('should be applied on X and Y scales.', function() {
        const chart = window.acquireChart(config);

        const scaleX = chart.scales.x;
        const scaleY = chart.scales.y;

        const oldMinX = scaleX.options.min;
        const oldMaxX = scaleX.options.max;
        const oldMinY = scaleY.options.min;
        const oldMaxY = scaleY.options.max;

        const wheelEv = {
          x: scaleX.getPixelForValue(1.5),
          y: scaleY.getPixelForValue(1.1),
          deltaY: 1
        };

        jasmine.triggerWheelEvent(chart, wheelEv);

        expect(scaleX.options.min).not.toEqual(oldMinX);
        expect(scaleX.options.max).not.toEqual(oldMaxX);
        expect(scaleY.options.min).not.toEqual(oldMinY);
        expect(scaleY.options.max).not.toEqual(oldMaxY);
      });
    });
  });

  describe('with logarithmic scale', function() {
    it('should zoom correctly when mouse in center of chart', function() {
      const config = {
        type: 'line',
        data: {
          datasets: [
            {data: [1, 10, 100, 1000, 10000]}
          ],
        },
        options: {
          scales: {
            y: {
              type: 'logarithmic'
            }
          },
          plugins: {
            zoom: {
              zoom: {
                mode: 'y',
                wheel: {
                  enabled: true,
                },
              }
            }
          }
        }
      };
      const chart = window.acquireChart(config);
      const scaleY = chart.scales.y;

      const zoomIn = {
        x: Math.round(scaleY.left + (scaleY.right - scaleY.left) / 2),
        y: Math.round(scaleY.top + (scaleY.bottom - scaleY.top) / 2),
        deltaY: -1
      };

      const zoomOut = {
        ...zoomIn,
        deltaY: 1
      };

      expect(scaleY.min).toBe(1);
      expect(scaleY.max).toBe(10000);

      jasmine.triggerWheelEvent(chart, zoomIn);

      expect(scaleY.min).toBeCloseTo(1.6, 1);
      expect(scaleY.max).toBeCloseTo(6310, -1);

      jasmine.triggerWheelEvent(chart, zoomIn);

      expect(scaleY.min).toBeCloseTo(2.4, 1);
      expect(scaleY.max).toBeCloseTo(4170, -1);

      jasmine.triggerWheelEvent(chart, zoomOut);
      jasmine.triggerWheelEvent(chart, zoomOut);

      expect(scaleY.min).toBe(1);
      expect(scaleY.max).toBe(10000);

      chart.resetZoom();

      expect(scaleY.min).toBe(1);
      expect(scaleY.max).toBe(10000);

      jasmine.triggerWheelEvent(chart, zoomOut);

      expect(scaleY.min).toBeCloseTo(0.6, 1);
      expect(scaleY.max).toBeCloseTo(16700, -2);

      jasmine.triggerWheelEvent(chart, zoomIn);

      expect(scaleY.min).toBeCloseTo(1);
      expect(scaleY.max).toBeCloseTo(10000);
    });
  });

  it('should respect aspectRatio when mode = xy', function() {
    const chart = window.acquireChart({
      type: 'line',
      data,
      options: {
        scales: {
          x: {
            type: 'linear'
          },
          y: {
            type: 'linear'
          }
        },
        plugins: {
          legend: false,
          title: false,
          zoom: {
            zoom: {
              drag: {
                enabled: true,
                maintainAspectRatio: true,
              },
              mode: 'xy'
            }
          }
        }
      }
    });

    const scaleX = chart.scales.x;
    const scaleY = chart.scales.y;

    jasmine.triggerMouseEvent(chart, 'mousedown', {
      x: scaleX.getPixelForValue(1.5),
      y: scaleY.getPixelForValue(1.1)
    });
    jasmine.triggerMouseEvent(chart, 'mouseup', {
      x: scaleX.getPixelForValue(2.8),
      y: scaleY.getPixelForValue(1.7)
    });

    expect(scaleX.options.min).toBeCloseTo(1.5);
    expect(scaleX.options.max).toBeCloseTo(2.1);
    expect(scaleY.options.min).toBeCloseTo(1.1);
    expect(scaleY.options.max).toBeCloseTo(1.7);
  });

  describe('events', function() {
    it('should call onZoomStart', function() {
      const startSpy = jasmine.createSpy('started');
      const chart = window.acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              zoom: {
                wheel: {
                  enabled: true,
                },
                mode: 'xy',
                onZoomStart: startSpy
              }
            }
          }
        }
      });
      const wheelEv = {
        x: chart.scales.x.getPixelForValue(1.5),
        y: chart.scales.y.getPixelForValue(1.1),
        deltaY: 1
      };
      jasmine.triggerWheelEvent(chart, wheelEv);
      expect(startSpy).toHaveBeenCalled();
      expect(chart.scales.x.min).not.toBe(1);
    });

    it('should detect configuration change', function() {
      const startSpy = jasmine.createSpy('started');
      const chart = window.acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              zoom: {
                wheel: {
                  enabled: false,
                },
                mode: 'xy',
                onZoomStart: startSpy
              }
            }
          }
        }
      });
      const wheelEv = {
        x: chart.scales.x.getPixelForValue(1.5),
        y: chart.scales.y.getPixelForValue(1.1),
        deltaY: 1
      };
      jasmine.triggerWheelEvent(chart, wheelEv);
      expect(startSpy).not.toHaveBeenCalled();
      expect(chart.scales.x.min).toBe(1);

      chart.options.plugins.zoom.zoom.wheel.enabled = true;
      chart.update();

      jasmine.triggerWheelEvent(chart, wheelEv);
      expect(startSpy).toHaveBeenCalled();
      expect(chart.scales.x.min).not.toBe(1);
    });

    it('should call onZoomRejected when onZoomStart returns false', function() {
      const rejectSpy = jasmine.createSpy('rejected');
      const chart = window.acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              zoom: {
                wheel: {
                  enabled: true,
                },
                mode: 'xy',
                onZoomStart: () => false,
                onZoomRejected: rejectSpy
              }
            }
          }
        }
      });
      const wheelEv = {
        x: chart.scales.x.getPixelForValue(1.5),
        y: chart.scales.y.getPixelForValue(1.1),
        deltaY: 1
      };
      jasmine.triggerWheelEvent(chart, wheelEv);
      expect(rejectSpy).toHaveBeenCalled();
      expect(chart.scales.x.min).toBe(1);
    });

    it('should call onZoomComplete', function(done) {
      const chart = window.acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              zoom: {
                wheel: {
                  enabled: true,
                },
                mode: 'xy',
                onZoomComplete(ctx) {
                  expect(ctx.chart.scales.x.min).not.toBe(1);
                  done();
                }
              }
            }
          }
        }
      });
      const wheelEv = {
        x: chart.scales.x.getPixelForValue(1.5),
        y: chart.scales.y.getPixelForValue(1.1),
        deltaY: 1
      };
      jasmine.triggerWheelEvent(chart, wheelEv);
    });
  });
});
