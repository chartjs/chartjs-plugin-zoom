describe('api', function() {
  it('should add methods to chart instance', function() {
    const chart = window.acquireChart({type: 'line'});

    expect(typeof chart.pan).toBe('function');
    expect(typeof chart.zoom).toBe('function');
    expect(typeof chart.zoomScale).toBe('function');
    expect(typeof chart.zoomRect).toBe('function');
    expect(typeof chart.resetZoom).toBe('function');
    expect(typeof chart.getZoomLevel).toBe('function');
    expect(typeof chart.getInitialScaleBounds).toBe('function');
    expect(typeof chart.getZoomedScaleBounds).toBe('function');
    expect(typeof chart.isZoomedOrPanned).toBe('function');
    expect(typeof chart.isZoomingOrPanning).toBe('function');

  });

  describe('zoom and resetZoom', function() {
    it('should accept zoom percentage as single parameter', function() {
      const chart = window.acquireChart({
        type: 'scatter',
        options: {
          scales: {
            x: {
              min: 0,
              max: 100
            },
            y: {
              min: 0,
              max: 100
            }
          }
        }
      });
      expect(chart.scales.x.min).toBe(0);
      expect(chart.scales.x.max).toBe(100);
      expect(chart.scales.y.min).toBe(0);
      expect(chart.scales.y.max).toBe(100);

      chart.zoom(1.5);
      expect(chart.scales.x.min).toBe(25);
      expect(chart.scales.x.max).toBe(75);
      expect(chart.scales.y.min).toBe(25);
      expect(chart.scales.y.max).toBe(75);

      chart.zoom(0.5);
      expect(chart.scales.x.min).toBe(12.5);
      expect(chart.scales.x.max).toBe(87.5);
      expect(chart.scales.y.min).toBe(12.5);
      expect(chart.scales.y.max).toBe(87.5);

      chart.resetZoom();
      expect(chart.scales.x.min).toBe(0);
      expect(chart.scales.x.max).toBe(100);
      expect(chart.scales.y.min).toBe(0);
      expect(chart.scales.y.max).toBe(100);
    });

    it('should accept different percentages per axis', function() {
      const chart = window.acquireChart({
        type: 'scatter',
        options: {
          scales: {
            x: {
              min: 0,
              max: 100
            },
            y: {
              min: 0,
              max: 100
            }
          }
        }
      });
      expect(chart.scales.x.min).toBe(0);
      expect(chart.scales.x.max).toBe(100);
      expect(chart.scales.y.min).toBe(0);
      expect(chart.scales.y.max).toBe(100);

      chart.zoom({x: 1.5, y: 1.25});
      expect(chart.scales.x.min).toBe(25);
      expect(chart.scales.x.max).toBe(75);
      expect(chart.scales.y.min).toBe(12.5);
      expect(chart.scales.y.max).toBe(87.5);

      chart.zoom({x: 0.75, y: 0.3});
      expect(chart.scales.x.min).toBe(18.75);
      expect(chart.scales.x.max).toBe(81.25);
      expect(chart.scales.y.min).toBe(-13.75);
      expect(chart.scales.y.max).toBe(113.75);

      chart.resetZoom();
      expect(chart.scales.x.min).toBe(0);
      expect(chart.scales.x.max).toBe(100);
      expect(chart.scales.y.min).toBe(0);
      expect(chart.scales.y.max).toBe(100);
    });

    it('should honor fitted scale updates on reset', function() {
      const chart = window.acquireChart({
        type: 'scatter',
        data: {
          datasets: [
            {
              data: [
                {x: 0, y: 0},
                {x: 100, y: 100}
              ]
            }
          ]
        }
      });

      chart.zoom(1.5);
      chart.data.datasets[0].data[0].x = -100;
      chart.update();
      chart.resetZoom();
      expect(chart.scales.x.min).toBe(-100);
      expect(chart.scales.x.max).toBe(100);
    });

    it('should no-op with fully constrained limits', function() {
      const chart = window.acquireChart({
        type: 'scatter',
        options: {
          scales: {
            x: {
              min: 0,
              max: 100
            },
            y: {
              min: 0,
              max: 100
            }
          },
          plugins: {
            zoom: {
              limits: {
                x: {
                  min: 0,
                  max: 100,
                  minRange: 100
                }
              }
            }
          }
        }
      });

      chart.zoom(1.5);
      expect(chart.scales.x.min).toBe(0);
      expect(chart.scales.x.max).toBe(100);
    });

    it('should no-op whan laready at limit', function() {
      const chart = window.acquireChart({
        type: 'scatter',
        options: {
          scales: {
            x: {
              min: 0,
              max: 100
            },
            y: {
              min: 0,
              max: 100
            }
          },
          plugins: {
            zoom: {
              mode: 'x',
              limits: {
                x: {
                  min: 0,
                  max: 100,
                  minRange: 50
                }
              }
            }
          }
        }
      });

      chart.zoom({x: 1.5, focalPoint: {x: chart.scales.x.getPixelForValue(100)}});
      expect(chart.scales.x.min).toBe(50);
      expect(chart.scales.x.max).toBe(100);

      chart.zoom({x: 1.5, focalPoint: {x: chart.scales.x.getPixelForValue(100)}});
      expect(chart.scales.x.min).toBe(50);
      expect(chart.scales.x.max).toBe(100);

      chart.zoom({x: 1.5, focalPoint: {x: chart.scales.x.getPixelForValue(50)}});
      expect(chart.scales.x.min).toBe(50);
      expect(chart.scales.x.max).toBe(100);
    });

    it('should honor zoom changes against a limit', function() {
      const chart = window.acquireChart({
        type: 'scatter',
        options: {
          scales: {
            x: {
              min: 0,
              max: 100
            },
            y: {
              min: 0,
              max: 100
            }
          },
          plugins: {
            zoom: {
              limits: {
                x: {
                  min: 0,
                  max: 100
                }
              }
            }
          }
        }
      });
      chart.zoom({
        x: 1.99,
        focalPoint: {
          x: chart.scales.x.getPixelForValue(0)
        }
      });
      expect(chart.scales.x.min).toBe(0);
      expect(chart.scales.x.max).toBe(1);

      chart.zoom({
        x: -98,
        focalPoint: {
          x: chart.scales.x.getPixelForValue(1)
        }
      });
      expect(chart.scales.x.min).toBe(0);
      expect(chart.scales.x.max).toBe(100);
    });
  });

  describe('zoomScale', function() {
    it('should call onZoom', function() {
      const zoomSpy = jasmine.createSpy('start');
      const chart = window.acquireChart({
        type: 'scatter',
        data: {
          datasets: [
            {
              data: [{x: 1, y: 1}, {x: 10, y: 10}],
            },
          ],
        },
        options: {
          plugins: {
            zoom: {
              zoom: {
                onZoom: zoomSpy,
              }
            }
          }
        }
      });

      chart.zoomScale('x', {min: 2, max: 10}, 'default');

      expect(zoomSpy).toHaveBeenCalledWith({chart});
    });
  });

  describe('getInitialScaleBounds', function() {
    it('should provide the correct initial scale bounds regardless of the zoom level', function() {
      const chart = window.acquireChart({
        type: 'scatter',
        options: {
          scales: {
            x: {
              min: 0,
              max: 100
            },
            y: {
              min: 0,
              max: 100
            }
          }
        }
      });

      chart.zoom(1);
      expect(chart.getInitialScaleBounds().x.min).toBe(0);
      expect(chart.getInitialScaleBounds().x.max).toBe(100);
      expect(chart.getInitialScaleBounds().y.min).toBe(0);
      expect(chart.getInitialScaleBounds().y.max).toBe(100);

      chart.zoom({x: 1.5, y: 1.25});
      expect(chart.getInitialScaleBounds().x.min).toBe(0);
      expect(chart.getInitialScaleBounds().x.max).toBe(100);
      expect(chart.getInitialScaleBounds().y.min).toBe(0);
      expect(chart.getInitialScaleBounds().y.max).toBe(100);
    });

    it('should provide updated scale bounds upon data update', function() {
      const chart = window.acquireChart({
        type: 'scatter',
        data: {
          datasets: [
            {
              data: [
                {x: 0, y: 0},
                {x: 100, y: 100}
              ]
            }
          ]
        }
      });

      expect(chart.getInitialScaleBounds().x.min).toBe(0);
      expect(chart.getInitialScaleBounds().x.max).toBe(100);
      expect(chart.getInitialScaleBounds().y.min).toBe(0);
      expect(chart.getInitialScaleBounds().y.max).toBe(100);

      chart.data.datasets[0].data[0].x = -100;
      chart.update();

      expect(chart.getInitialScaleBounds().x.min).toBe(-100);
      expect(chart.getInitialScaleBounds().x.max).toBe(100);
      expect(chart.getInitialScaleBounds().y.min).toBe(0);
      expect(chart.getInitialScaleBounds().y.max).toBe(100);
    });
  });

  describe('isZoomedOrPanned', function() {
    it('should return whether or not the page is currently zoomed', function() {
      const chart = window.acquireChart({
        type: 'scatter',
        options: {
          scales: {
            x: {
              min: 0,
              max: 100
            },
            y: {
              min: 0,
              max: 100
            }
          }
        }
      });

      expect(chart.isZoomedOrPanned()).toBe(false);

      chart.zoom(1);
      expect(chart.isZoomedOrPanned()).toBe(false);

      chart.zoom({x: 1.5, y: 1.25});
      expect(chart.isZoomedOrPanned()).toBe(true);

      chart.zoom({x: 0.25, y: 0.5});
      expect(chart.isZoomedOrPanned()).toBe(true);

      chart.resetZoom();
      expect(chart.isZoomedOrPanned()).toBe(false);
    });

    it('should return whether or not the page is currently panned', function() {
      const chart = window.acquireChart({
        type: 'scatter',
        options: {
          scales: {
            x: {
              min: 0,
              max: 100
            },
            y: {
              min: 0,
              max: 100
            }
          }
        }
      });

      expect(chart.isZoomedOrPanned()).toBe(false);

      chart.pan({x: 0, y: 0});
      expect(chart.isZoomedOrPanned()).toBe(false);

      chart.pan({x: 10});
      expect(chart.isZoomedOrPanned()).toBe(true);

      chart.resetZoom();
      expect(chart.isZoomedOrPanned()).toBe(false);
    });

    it('should work with updated data and fitted scales', function() {
      const chart = window.acquireChart({
        type: 'scatter',
        data: {
          datasets: [
            {
              data: [
                {x: 0, y: 0},
                {x: 100, y: 100}
              ]
            }
          ]
        }
      });

      // This sequence of operations captures a previous bug.
      chart.zoom(1.5);
      chart.data.datasets[0].data[0].x = -100;
      chart.update();
      chart.resetZoom();
      expect(chart.scales.x.min).toBe(-100);
      expect(chart.scales.x.max).toBe(100);
      expect(chart.isZoomedOrPanned()).toBe(false);
    });
  });

  describe('getZoomedScaleBounds', function() {
    it('should return the zoom range, or undefined if not zoomed', function() {
      const chart = window.acquireChart({
        type: 'scatter',
        options: {
          scales: {
            x: {
              min: 0,
              max: 100
            },
            y: {
              min: 0,
              max: 100
            }
          }
        }
      });
      expect(chart.getZoomedScaleBounds().x).toBeUndefined();

      chart.zoom(1.5);
      expect(chart.getZoomedScaleBounds().x).toEqual({min: 25, max: 75});

      chart.resetZoom();
      expect(chart.getZoomedScaleBounds().x).toBeUndefined();
    });
  });

  describe('with category scale', function() {
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
      expect(chart.scales.y.min).toBe(1);
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

  describe('with logarithmic scale', function() {
    it('should zoom in and out', function() {
      const chart = window.acquireChart({
        type: 'bar',
        data: {
          labels: ['a', 'b', 'c', 'd', 'e'],
          datasets: [{
            data: [1, 22, 3333, 22, 1],
          }]
        },
        options: {
          scales: {
            y: {
              type: 'logarithmic',
            }
          },
        }
      });
      expect(chart.scales.y.min).toBe(0.1);
      expect(chart.scales.y.max).toBe(4000);
      chart.zoom(1.1);
      expect(chart.scales.y.min).toBeCloseTo(0.17, 2);
      expect(chart.scales.y.max).toBeCloseTo(2355, 0);
      chart.zoom(0.9);
      expect(chart.scales.y.min).toBeCloseTo(0.105, 3);
      expect(chart.scales.y.max).toBeCloseTo(3794, 0);
      chart.zoom(0.9);
      expect(chart.scales.y.min).toBeCloseTo(0.06, 2);
      expect(chart.scales.y.max).toBeCloseTo(6410, 0);
      chart.resetZoom();
      expect(chart.scales.y.min).toBe(0.1);
      expect(chart.scales.y.max).toBe(4000);
    });
  });
});
