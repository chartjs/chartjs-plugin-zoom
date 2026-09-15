describe('pan', function () {
  const data = {
    labels: ['a', 'b', 'c', 'd', 'e'],
    datasets: [
      {
        data: [
          {
            x: 1,
            y: 3,
          },
          {
            x: 2,
            y: 2,
          },
          {
            x: 3,
            y: 1,
          },
        ],
      },
    ],
  }

  describe('delta', function () {
    it('should be applied cumulatively', function () {
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
            },
          },
          scales: {
            x: {
              min: 1,
              max: 2,
            },
          },
        },
      })
      const scale = chart.scales.x
      expect(scale.min).toBe(1)
      expect(scale.max).toBe(2)
      chart.pan(20)
      expect(scale.min).toBe(1)
      expect(scale.max).toBe(2)
      chart.pan(20)
      expect(scale.min).toBe(1)
      expect(scale.max).toBe(2)
      chart.pan(20)
      expect(scale.min).toBe(0)
      expect(scale.max).toBe(1)
    })

    it('should not give credit', function () {
      const chart = window.acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              limits: {
                x: {
                  max: 4,
                },
              },
              pan: {
                enabled: true,
                mode: 'x',
              },
            },
          },
          scales: {
            x: {
              min: 1,
              max: 3,
            },
          },
        },
      })
      const scale = chart.scales.x
      expect(scale.min).toBe(1)
      expect(scale.max).toBe(3)
      chart.pan(-2000)
      expect(scale.min).toBe(1)
      expect(scale.max).toBe(3)
      chart.pan(-2000)
      expect(scale.min).toBe(1)
      expect(scale.max).toBe(3)
      chart.pan(50)
      expect(scale.min).toBeLessThan(2)
      expect(scale.max).toBe(scale.min + 2)
    })

    it('should handle zero-dimension scales', function () {
      const chart = window.acquireChart({
        type: 'line',
        data,
        options: {
          plugins: {
            zoom: {
              pan: {
                enabled: true,
                mode: 'y',
              },
            },
          },
          scales: {
            y: {
              type: 'linear',
              min: 2,
              max: 2,
            },
          },
        },
      })
      const scale = chart.scales.y
      expect(scale.min).toBe(2)
      expect(scale.max).toBe(2)
      chart.pan(50)
      expect(scale.min).toBe(2)
      expect(scale.max).toBe(2)
      expect(scale.options.min).toBe(2)
      expect(scale.options.max).toBe(2)
    })

    it('should respect original limits', function () {
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
                },
              },
            },
          },
          scales: {
            x: {
              min: 1,
              max: 2,
            },
          },
        },
      })
      const scale = chart.scales.x
      expect(scale.min).toBe(1)
      expect(scale.max).toBe(2)
      chart.pan(100)
      expect(scale.min).toBe(1)
      expect(scale.max).toBe(2)
    })

    it('should respect original limits for nonlinear scales', function () {
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
                },
              },
            },
          },
          scales: {
            x: {
              type: 'logarithmic',
              min: 1,
              max: 10,
            },
          },
        },
      })
      const scale = chart.scales.x
      expect(scale.min).toBe(1)
      expect(scale.max).toBe(10)
      chart.pan(100)
      expect(scale.min).toBe(1)
      expect(scale.max).toBe(10)
    })
  })

  describe('events', function () {
    it('should call onPanStart', function (done) {
      const startSpy = jasmine.createSpy('started')
      const chart = window.acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              pan: {
                enabled: true,
                mode: 'xy',
                onPanStart: startSpy,
              },
            },
          },
        },
      })

      jasmine.simulatePan(chart, { deltaX: -350, deltaY: 0 }, function () {
        expect(startSpy).toHaveBeenCalled()
        expect(chart.scales.x.min).not.toBe(1)
        done()
      })
    })

    it('should call onPanRejected when onStartPan returns false', function (done) {
      const rejectSpy = jasmine.createSpy('rejected')
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
                onPanRejected: rejectSpy,
              },
            },
          },
        },
      })

      jasmine.simulatePan(chart, { deltaX: -350, deltaY: 0 }, function () {
        // The rejection must not be repeated for every move of the same gesture.
        expect(rejectSpy).toHaveBeenCalledTimes(1)
        expect(chart.scales.x.min).toBe(1)
        done()
      })
    })

    it('should call onPanRejected when the modifier key is not pressed', function (done) {
      const rejectSpy = jasmine.createSpy('rejected')
      const chart = window.acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              pan: {
                enabled: true,
                mode: 'xy',
                modifierKey: 'ctrl',
                onPanRejected: rejectSpy,
              },
            },
          },
        },
      })

      jasmine.simulatePan(chart, { deltaX: -350, deltaY: 0, pointerType: 'mouse' }, function () {
        expect(rejectSpy).toHaveBeenCalled()
        expect(chart.scales.x.min).toBe(1)

        jasmine.simulatePan(chart, { deltaX: -350, deltaY: 0, pointerType: 'mouse', ctrlKey: true }, function () {
          expect(chart.scales.x.min).not.toBe(1)
          done()
        })
      })
    })

    it('should not pan with a non-primary mouse button', function (done) {
      const chart = window.acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              pan: {
                enabled: true,
                mode: 'xy',
              },
            },
          },
        },
      })

      jasmine.simulatePan(chart, { deltaX: -350, deltaY: 0, pointerType: 'mouse', button: 2 }, function () {
        expect(chart.scales.x.min).toBe(1)
        done()
      })
    })

    it('should call onPanComplete', function (done) {
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
                  expect(ctx.chart.scales.x.min).not.toBe(1)
                  done()
                },
              },
            },
          },
        },
      })
      jasmine.simulatePan(chart, { deltaX: -350, deltaY: 0 })
    })

    it('should end the pan when a second pointer goes down', function () {
      const completeSpy = jasmine.createSpy('completed')
      const chart = window.acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              pan: {
                enabled: true,
                mode: 'xy',
                onPanComplete: completeSpy,
              },
            },
          },
        },
      })

      const node = chart.canvas
      const rect = node.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      const dispatch = jasmine.dispatchPointer

      dispatch(node, 'pointerdown', 1, x, y)
      dispatch(node, 'pointermove', 1, x - 50, y)
      expect(chart.scales.x.min).not.toBe(1)

      // The pan ends even though pinch is disabled and no zoom takes over.
      dispatch(node, 'pointerdown', 2, x + 200, y)
      expect(completeSpy).toHaveBeenCalledTimes(1)

      // Lifting the first pointer must not let the second one resume that pan
      // from the old start position, which would jump the chart.
      const min = chart.scales.x.min
      dispatch(node, 'pointerup', 1, x - 50, y)
      dispatch(node, 'pointermove', 2, x + 200, y)
      expect(chart.scales.x.min).toBe(min)

      dispatch(node, 'pointerup', 2, x + 200, y)
      expect(completeSpy).toHaveBeenCalledTimes(1)
    })

    it('should not complete the pan when the gesture is cancelled', function () {
      const completeSpy = jasmine.createSpy('completed')
      const chart = window.acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              pan: {
                enabled: true,
                mode: 'xy',
                onPanComplete: completeSpy,
              },
            },
          },
        },
      })

      const node = chart.canvas
      const rect = node.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      const dispatch = jasmine.dispatchPointer

      dispatch(node, 'pointerdown', 1, x, y)
      dispatch(node, 'pointermove', 1, x - 50, y)
      dispatch(node, 'pointercancel', 1, x - 50, y)
      expect(completeSpy).not.toHaveBeenCalled()

      // The aborted pan must not be resumed by the next one.
      const min = chart.scales.x.min
      dispatch(node, 'pointerdown', 1, x, y)
      dispatch(node, 'pointermove', 1, x - 5, y)
      expect(chart.scales.x.min).toBe(min)
    })
  })
})
