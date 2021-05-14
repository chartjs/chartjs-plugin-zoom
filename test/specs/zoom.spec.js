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
      it('should be applied on Y, but not on X scales.', async function() {
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

        await jasmine.triggerWheelEvent(chart, wheelEv);

        expect(scaleX.options.min).toEqual(oldMinX);
        expect(scaleX.options.max).toEqual(oldMaxX);
        expect(scaleY.options.min).not.toEqual(oldMinY);
        expect(scaleY.options.max).not.toEqual(oldMaxY);
      });
    });

    describe('Wheel not under Y scale', function() {
      it('should be applied on X, but not on Y scales.', async function() {
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

        await jasmine.triggerWheelEvent(chart, wheelEv);

        expect(scaleX.options.min).not.toEqual(oldMinX);
        expect(scaleX.options.max).not.toEqual(oldMaxX);
        expect(scaleY.options.min).toEqual(oldMinY);
        expect(scaleY.options.max).toEqual(oldMaxY);
      });
    });
  });

  describe('events', function() {
    describe('wheel', function() {
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

    describe('drag', function() {
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
                  onZoomComplete: done
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

        jasmine.dispatchEvent(chart, 'mousedown', pt);
        jasmine.dispatchEvent(chart, 'mousemove', pt2);
        jasmine.dispatchEvent(chart, 'mouseup', pt2);

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

        jasmine.dispatchEvent(chart, 'mousedown', pt);
        jasmine.dispatchEvent(chart, 'mousemove', pt2);
        jasmine.dispatchEvent(chart, 'mouseup', pt2);

        expect(rejectSpy).toHaveBeenCalled();
        expect(zoomSpy).not.toHaveBeenCalled();
        expect(doneSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('category scale', function() {
    it('should zoom up to and out from single category', function() {
      const chart = window.acquireChart({
        type: 'bar',
        data: {
          labels: ['a', 'b', 'c', 'd', 'e'],
          datasets: [{
            data: [1, 2, 3, 2, 1]
          }]
        },
        options: {
          scales: {
            x: {
              min: 'b',
              max: 'd'
            }
          },
          plugins: {
            zoom: {
              zoom: {
                wheel: {
                  enabled: true,
                },
              }
            }
          }
        }
      });
      expect(chart.scales.x.min).toBe(1);
      expect(chart.scales.x.max).toBe(3);
      chart.zoom(1.1);
      expect(chart.scales.x.min).toBe(2);
      expect(chart.scales.x.max).toBe(2);
      chart.zoom(0.9);
      expect(chart.scales.x.min).toBe(1);
      expect(chart.scales.x.max).toBe(3);
      chart.zoom(0.9);
      expect(chart.scales.x.min).toBe(0);
      expect(chart.scales.x.max).toBe(4);
      chart.resetZoom();
      expect(chart.scales.x.min).toBe(1);
      expect(chart.scales.x.max).toBe(3);
    });

    it('should not exceed limits', function() {
      const chart = window.acquireChart({
        type: 'bar',
        data: {
          labels: ['0', '1', '2', '3', '4', '5', '6'],
          datasets: [{
            data: [1, 2, 3, 2, 1, 0, 1]
          }]
        },
        options: {
          indexAxis: 'y',
          scales: {
            y: {
              min: 2,
              max: 4
            }
          },
          plugins: {
            zoom: {
              limits: {
                y: {
                  min: 1,
                  max: 5,
                  minRange: 1
                }
              },
              zoom: {
                wheel: {
                  enabled: true,
                },
                mode: 'y'
              }
            }
          }
        }
      });
      expect(chart.scales.y.min).toBe(2);
      expect(chart.scales.y.max).toBe(4);
      chart.zoom(1.1);
      expect(chart.scales.y.min).toBe(3);
      expect(chart.scales.y.max).toBe(4);
      chart.pan(-100);
      expect(chart.scales.y.min).toBe(4);
      expect(chart.scales.y.max).toBe(5);
      chart.zoom(0.9);
      expect(chart.scales.y.min).toBe(3);
      expect(chart.scales.y.max).toBe(5);
      chart.zoom(0.9);
      expect(chart.scales.y.min).toBe(2);
      expect(chart.scales.y.max).toBe(5);
      chart.zoom(0.9);
      expect(chart.scales.y.min).toBe(1);
      expect(chart.scales.y.max).toBe(5);
      chart.pan(-100);
      expect(chart.scales.y.min).toBe(1);
      expect(chart.scales.y.max).toBe(5);
      chart.pan(100);
      expect(chart.scales.y.min).toBe(1);
      expect(chart.scales.y.max).toBe(5);
    });
  });
});
