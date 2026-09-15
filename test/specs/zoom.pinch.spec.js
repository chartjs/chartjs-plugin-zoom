describe('pinch', () => {
  const data = {
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

  describe('events', () => {
    it('should call onZoomStart', function (done) {
      const startSpy = jasmine.createSpy('started')
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
            },
          },
        },
      })

      jasmine.simulatePinch(chart, { pos: [chart.width / 2, chart.height / 2] }, function () {
        expect(startSpy).toHaveBeenCalled()
        expect(chart.scales.x.min).not.toBe(1)
        done()
      })
    })

    it('should call onZoomRejected when onStartZoom returns false', function (done) {
      const rejectSpy = jasmine.createSpy('rejected')
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
                },
              },
            },
          },
        },
      })

      jasmine.simulatePinch(chart, {}, function () {
        expect(rejectSpy).toHaveBeenCalled()
        expect(chart.scales.x.min).toBe(1)
        done()
      })
    })

    it('should call onZoomComplete', function (done) {
      const chart = window.acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              zoom: {
                mode: 'xy',
                onZoomComplete(ctx) {
                  expect(ctx.chart.scales.x.min).not.toBe(1)
                  done()
                },
                pinch: {
                  enabled: true,
                },
              },
            },
          },
        },
      })
      jasmine.simulatePinch(chart, {})
    })

    it('should ignore a third pointer during a pinch', function () {
      const startSpy = jasmine.createSpy('started')
      const completeSpy = jasmine.createSpy('completed')
      const chart = window.acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              zoom: {
                mode: 'xy',
                onZoomStart: startSpy,
                onZoomComplete: completeSpy,
                pinch: {
                  enabled: true,
                },
              },
            },
          },
        },
      })

      const node = chart.canvas
      const rect = node.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dispatch = jasmine.dispatchPointer

      dispatch(node, 'pointerdown', 1, cx - 40, cy)
      dispatch(node, 'pointerdown', 2, cx + 40, cy)
      expect(startSpy).toHaveBeenCalledTimes(1)

      // A third finger neither restarts the pinch nor ends it when lifted.
      dispatch(node, 'pointerdown', 3, cx, cy + 100)
      expect(startSpy).toHaveBeenCalledTimes(1)
      dispatch(node, 'pointerup', 3, cx, cy + 100)
      expect(completeSpy).not.toHaveBeenCalled()

      dispatch(node, 'pointermove', 1, cx - 80, cy)
      dispatch(node, 'pointermove', 2, cx + 80, cy)
      expect(chart.scales.x.min).not.toBe(1)

      dispatch(node, 'pointerup', 1, cx - 80, cy)
      dispatch(node, 'pointerup', 2, cx + 80, cy)
      expect(completeSpy).toHaveBeenCalledTimes(1)
    })
  })
})
