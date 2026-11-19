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
