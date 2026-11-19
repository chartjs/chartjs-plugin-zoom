import { acquireChart } from 'chartjs-test-utils'
import { dispatchPointer, simulatePinch } from '../utils.js'

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
    it('should call onZoomStart', function () {
      const startSpy = vi.fn()
      const chart = acquireChart({
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

      simulatePinch(chart, { pos: [chart.width / 2, chart.height / 2] })
      expect(startSpy).toHaveBeenCalled()
      expect(chart.scales.x.min).not.toBe(1)
    })

    it('should call onZoomRejected when onStartZoom returns false', function () {
      const rejectSpy = vi.fn()
      const chart = acquireChart({
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

      simulatePinch(chart, {})
      expect(rejectSpy).toHaveBeenCalled()
      expect(chart.scales.x.min).toBe(1)
    })

    it('should call onZoomComplete', async function () {
      // Records the scale minimum at the time the callback runs.
      const completeSpy = vi.fn((ctx) => ctx.chart.scales.x.min)
      const chart = acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              zoom: {
                mode: 'xy',
                onZoomComplete: completeSpy,
                pinch: {
                  enabled: true,
                },
              },
            },
          },
        },
      })
      simulatePinch(chart, {})

      await vi.waitFor(() => expect(completeSpy).toHaveBeenCalled())
      expect(completeSpy).not.toHaveReturnedWith(1)
    })

    it('should ignore a third pointer during a pinch', function () {
      const startSpy = vi.fn()
      const completeSpy = vi.fn()
      const chart = acquireChart({
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
      const dispatch = dispatchPointer

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

  describe('axes', () => {
    const createChart = (mode = 'xy') =>
      acquireChart({
        type: 'scatter',
        data,
        options: {
          scales: { x: { min: 0, max: 10 }, y: { min: 0, max: 10 } },
          plugins: { zoom: { zoom: { mode, pinch: { enabled: true } } } },
        },
      })
    const ranges = (chart) => ({
      x: chart.scales.x.max - chart.scales.x.min,
      y: chart.scales.y.max - chart.scales.y.min,
    })

    it('should zoom only the x axis when the fingers are side by side', () => {
      const chart = createChart()

      simulatePinch(chart, { angle: 0 })

      expect(ranges(chart).x).toBeLessThan(10)
      expect(ranges(chart).y).toBe(10)
    })

    it('should zoom only the y axis when the fingers are above each other', () => {
      const chart = createChart()

      simulatePinch(chart, { angle: 90 })

      expect(ranges(chart).x).toBe(10)
      expect(ranges(chart).y).toBeLessThan(10)
    })

    it('should zoom both axes when the fingers are diagonal', () => {
      const chart = createChart()

      simulatePinch(chart, { angle: 45 })

      expect(ranges(chart).x).toBeLessThan(10)
      expect(ranges(chart).y).toBeLessThan(10)
    })

    it('should not zoom an axis that is not in mode', () => {
      const chart = createChart('x')

      simulatePinch(chart, { angle: 90 })

      expect(ranges(chart)).toEqual({ x: 10, y: 10 })
    })

    it('should start and stop pinching when toggled in an update', () => {
      const chart = createChart()

      chart.options.plugins.zoom.zoom.pinch.enabled = false
      chart.update()
      simulatePinch(chart, { angle: 45 })

      expect(ranges(chart)).toEqual({ x: 10, y: 10 })

      chart.options.plugins.zoom.zoom.pinch.enabled = true
      chart.update()
      simulatePinch(chart, { angle: 45 })

      expect(ranges(chart).x).toBeLessThan(10)
    })
  })
})
