import { acquireChart } from 'chartjs-test-utils'
import { dispatchPointer, simulatePan } from '../utils.js'

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
      const chart = acquireChart({
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
      const chart = acquireChart({
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
      expect(scale.min).toBe(2)
      expect(scale.max).toBe(4)
      chart.pan(-2000)
      expect(scale.min).toBe(2)
      expect(scale.max).toBe(4)
      chart.pan(50)
      expect(scale.min).toBeLessThan(2)
      expect(scale.max).toBe(scale.min + 2)
    })

    it('should not pin a category scale that has nowhere to pan to', function () {
      const chart = acquireChart({
        type: 'bar',
        data: { labels: ['a', 'b', 'c', 'd'], datasets: [{ data: [1, 2, 3, 4] }] },
        options: { plugins: { zoom: { pan: { enabled: true, mode: 'x' } } } },
      })

      // Shorter than a step, and then against both ends.
      chart.pan({ x: 3 })
      chart.pan({ x: 500 })
      chart.pan({ x: -500 })

      expect(chart.options.scales.x.min).toBeUndefined()
      expect(chart.options.scales.x.max).toBeUndefined()
      expect(chart.isZoomedOrPanned()).toBe(false)

      // So it still follows its labels.
      chart.data.labels.push('e')
      chart.data.datasets[0].data.push(5)
      chart.update()

      expect(chart.scales.x.max).toBe(4)
    })

    it('should not pin a category scale that its limits keep where it is', function () {
      const chart = acquireChart({
        type: 'bar',
        data: { labels: ['a', 'b', 'c', 'd'], datasets: [{ data: [1, 2, 3, 4] }] },
        options: {
          plugins: { zoom: { pan: { enabled: true, mode: 'x' }, limits: { x: { min: 'original', max: 'original' } } } },
        },
      })
      chart.data.labels.push('e')
      chart.data.datasets[0].data.push(5)

      // The chart has not been updated, so the scale and its limits still end
      // at 'd' while there is a label to step to.
      chart.pan({ x: -500 })

      expect(chart.options.scales.x.min).toBeUndefined()
      expect(chart.options.scales.x.max).toBeUndefined()
    })

    describe('past a limit', function () {
      const points = (k = 1) => Array.from({ length: 101 }, (_, i) => ({ x: i * k, y: i }))

      function createChart(type, zoom, k = 1) {
        return acquireChart({
          type: 'line',
          data: { datasets: [{ data: points(k) }] },
          options: {
            parsing: false,
            scales: { x: { type } },
            plugins: {
              zoom: {
                pan: { enabled: true, mode: 'x' },
                limits: { x: { min: 'original', max: 'original' }, y: { min: 'original', max: 'original' } },
                ...zoom,
              },
            },
          },
        })
      }

      it('should stop at the limit on a linear scale', function () {
        const chart = createChart('linear')
        chart.zoomScale('x', { min: 10, max: 60 })

        // Much further than the distance to the start of the data.
        chart.pan({ x: 2000 })

        expect(chart.scales.x.min).toBe(0)
        expect(chart.scales.x.max).toBe(50)
      })

      it('should stop at the limit on a time scale', function () {
        const hour = 3600e3
        const chart = createChart('time', {}, hour)
        chart.zoomScale('x', { min: 40 * hour, max: 90 * hour })

        chart.pan({ x: -2000 })

        expect(chart.scales.x.min).toBe(50 * hour)
        expect(chart.scales.x.max).toBe(100 * hour)
      })

      it('should keep the size of the range when it stops', function () {
        const chart = createChart('linear', { limits: { x: { min: 5, max: 95 } } })
        chart.zoomScale('x', { min: 10, max: 60 })

        chart.pan({ x: 2000 })

        expect(chart.scales.x.min).toBe(5)
        expect(chart.scales.x.max).toBe(55)
      })

      it('should not pin a scale that shows its whole range', function () {
        const chart = createChart('linear', { pan: { enabled: true, mode: 'xy' } })

        chart.pan({ x: 50, y: 50 })
        chart.pan({ x: -50, y: -50 })

        expect(chart.options.scales.x.min).toBeUndefined()
        expect(chart.options.scales.x.max).toBeUndefined()
        expect(chart.options.scales.y.min).toBeUndefined()
        expect(chart.options.scales.y.max).toBeUndefined()
        expect(chart.isZoomedOrPanned()).toBe(false)

        // So it still follows its data.
        chart.data.datasets[0].data = points().concat([{ x: 200, y: 300 }])
        chart.update()

        expect(chart.scales.x.max).toBe(200)
        expect(chart.scales.y.max).toBe(300)
      })

      it('should not pin the scale across when only one is zoomed', function () {
        const chart = createChart('linear', { pan: { enabled: true, mode: 'xy' } })
        // The same y range in every part of x, so that zooming x leaves y
        // showing its whole range, with nowhere to pan to.
        chart.data.datasets[0].data = points().map(({ x }, i) => ({ x, y: (i % 2) * 100 }))
        chart.update()
        chart.zoomScale('x', { min: 10, max: 60 })

        chart.pan({ x: -40, y: 40 })

        expect(chart.scales.x.min).toBeGreaterThan(10)
        expect(chart.options.scales.y.min).toBeUndefined()
        expect(chart.options.scales.y.max).toBeUndefined()
      })

      it('should still drop the pan on a timeseries scale', function () {
        const hour = 3600e3
        const chart = createChart('timeseries', {}, hour)
        chart.zoomScale('x', { min: 40 * hour, max: 90 * hour })
        const { min, max } = chart.scales.x

        chart.pan({ x: -2000 })

        expect(chart.scales.x.min).toBe(min)
        expect(chart.scales.x.max).toBe(max)
      })

      it('should still drop the pan on a logarithmic scale', function () {
        const chart = acquireChart({
          type: 'line',
          data: { datasets: [{ data: [1, 10, 100, 1000, 10000] }] },
          options: {
            scales: { y: { type: 'logarithmic' } },
            plugins: {
              zoom: { pan: { enabled: true, mode: 'y' }, limits: { y: { min: 'original', max: 'original' } } },
            },
          },
        })
        chart.zoomScale('y', { min: 10, max: 1000 })
        const { min, max } = chart.scales.y

        chart.pan({ y: -5000 })

        expect(chart.scales.y.min).toBe(min)
        expect(chart.scales.y.max).toBe(max)
      })
    })

    it('should handle zero-dimension scales', function () {
      const chart = acquireChart({
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
      const chart = acquireChart({
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
      const chart = acquireChart({
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
    it('should call onPanStart', function () {
      const startSpy = vi.fn()
      const chart = acquireChart({
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

      simulatePan(chart, { deltaX: -350, deltaY: 0 })
      expect(startSpy).toHaveBeenCalled()
      expect(chart.scales.x.min).not.toBe(1)
    })

    it('should call onPanRejected when onStartPan returns false', function () {
      const rejectSpy = vi.fn()
      const chart = acquireChart({
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

      simulatePan(chart, { deltaX: -350, deltaY: 0 })
      // The rejection must not be repeated for every move of the same gesture.
      expect(rejectSpy).toHaveBeenCalledTimes(1)
      expect(chart.scales.x.min).toBe(1)
    })

    it('should call onPanRejected when the modifier key is not pressed', function () {
      const rejectSpy = vi.fn()
      const chart = acquireChart({
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

      simulatePan(chart, { deltaX: -350, deltaY: 0, pointerType: 'mouse' })
      expect(rejectSpy).toHaveBeenCalled()
      expect(chart.scales.x.min).toBe(1)

      simulatePan(chart, { deltaX: -350, deltaY: 0, pointerType: 'mouse', ctrlKey: true })
      expect(chart.scales.x.min).not.toBe(1)
    })

    it('should not pan with a non-primary mouse button', function () {
      const chart = acquireChart({
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

      simulatePan(chart, { deltaX: -350, deltaY: 0, pointerType: 'mouse', button: 2 })
      expect(chart.scales.x.min).toBe(1)
    })

    it('should call onPanComplete', async function () {
      // Records the scale minimum at the time the callback runs.
      const completeSpy = vi.fn((ctx) => ctx.chart.scales.x.min)
      const chart = acquireChart({
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
      simulatePan(chart, { deltaX: -350, deltaY: 0 })

      await vi.waitFor(() => expect(completeSpy).toHaveBeenCalled())
      expect(completeSpy).not.toHaveReturnedWith(1)
    })

    it('should end the pan when a second pointer goes down', function () {
      const completeSpy = vi.fn()
      const chart = acquireChart({
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
      const dispatch = dispatchPointer

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
      const completeSpy = vi.fn()
      const chart = acquireChart({
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
      const dispatch = dispatchPointer

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

  describe('option changes', function () {
    const createChart = (pan) =>
      acquireChart({
        type: 'scatter',
        data,
        options: { plugins: { zoom: { pan: { mode: 'xy', ...pan } } } },
      })

    it('should not pan when disabled', function () {
      const startSpy = vi.fn()
      const chart = createChart({ enabled: false, onPanStart: startSpy })

      simulatePan(chart, { deltaX: -350, deltaY: 0 })

      expect(startSpy).not.toHaveBeenCalled()
      expect(chart.scales.x.min).toBe(1)
      expect(chart.isZoomingOrPanning()).toBe(false)
    })

    it('should start panning when enabled in an update', function () {
      const chart = createChart({ enabled: false })

      chart.options.plugins.zoom.pan.enabled = true
      chart.update()
      simulatePan(chart, { deltaX: -350, deltaY: 0 })

      expect(chart.scales.x.min).not.toBe(1)
    })

    it('should stop panning when disabled in an update', function () {
      const chart = createChart({ enabled: true })

      chart.options.plugins.zoom.pan.enabled = false
      chart.update()
      simulatePan(chart, { deltaX: -350, deltaY: 0 })

      expect(chart.scales.x.min).toBe(1)
    })

    it('should apply a threshold changed in an update', function () {
      const chart = createChart({ enabled: true, threshold: 1000 })

      simulatePan(chart, { deltaX: -350, deltaY: 0 })

      expect(chart.scales.x.min).toBe(1)

      chart.options.plugins.zoom.pan.threshold = 10
      chart.update()
      simulatePan(chart, { deltaX: -350, deltaY: 0 })

      expect(chart.scales.x.min).not.toBe(1)
    })
  })
})
