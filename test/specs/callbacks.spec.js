import { acquireChart } from 'chartjs-test-utils'
import { simulatePan, simulatePinch, triggerWheelEvent } from '../utils.js'

describe('what onZoom and onPan are told', function () {
  function createChart(zoom, scales = {}) {
    return acquireChart({
      type: 'scatter',
      data: {
        datasets: [
          {
            data: [
              { x: 0, y: 0 },
              { x: 100, y: 100 },
            ],
          },
        ],
      },
      options: {
        scales: { x: { min: 0, max: 100, ...scales.x }, y: { min: 0, max: 100, ...scales.y } },
        plugins: { zoom },
      },
    })
  }

  const rangesOf = (chart, ...ids) =>
    Object.fromEntries(ids.map((id) => [id, { min: chart.scales[id].min, max: chart.scales[id].max }]))

  describe('onZoom', function () {
    it('should get the factors and the resulting ranges of chart.zoom()', function () {
      const onZoom = vi.fn()
      const chart = createChart({ zoom: { mode: 'xy', onZoom } })
      const { left, right, top, bottom } = chart.chartArea

      chart.zoom(1.5)

      expect(onZoom).toHaveBeenCalledTimes(1)
      expect(onZoom).toHaveBeenCalledWith({
        chart,
        trigger: 'api',
        ranges: { x: { min: 25, max: 75 }, y: { min: 25, max: 75 } },
        amount: { x: 1.5, y: 1.5, focalPoint: { x: (left + right) / 2, y: (top + bottom) / 2 } },
      })
    })

    it('should only list the scales that were zoomed', function () {
      const onZoom = vi.fn()
      const chart = createChart({ zoom: { mode: 'xy', onZoom } })

      chart.zoom({ x: 1.5, focalPoint: { x: 10, y: 10 } })

      const context = onZoom.mock.calls[0][0]
      expect(Object.keys(context.ranges)).toEqual(['x'])
      expect(context.ranges).toEqual(rangesOf(chart, 'x'))
      expect(context.amount).toEqual({ x: 1.5, y: 1, focalPoint: { x: 10, y: 10 } })
    })

    it('should get the ranges as they are with the limits applied', function () {
      const onZoom = vi.fn()
      const chart = createChart({ zoom: { mode: 'x', onZoom }, limits: { x: { min: -10, max: 110 } } })

      chart.zoom({ x: 0.5 })

      expect(onZoom.mock.calls[0][0].ranges).toEqual({ x: { min: -10, max: 110 } })
      expect(onZoom.mock.calls[0][0].amount.x).toBe(0.5)
    })

    it('should name the wheel as the trigger', function () {
      const onZoom = vi.fn()
      const chart = createChart({ zoom: { mode: 'x', wheel: { enabled: true }, onZoom } })
      const { left, right, top, bottom } = chart.chartArea

      triggerWheelEvent(chart, { x: (left + right) / 2, y: (top + bottom) / 2, deltaY: -100 })

      const context = onZoom.mock.calls[0][0]
      expect(context.trigger).toBe('wheel')
      expect(context.ranges).toEqual(rangesOf(chart, 'x'))
      expect(context.ranges.x.max - context.ranges.x.min).toBeCloseTo(90, 10)
      expect(context.amount.x).toBeCloseTo(1.1, 10)
    })

    it('should name a pinch as the trigger', function () {
      const onZoom = vi.fn()
      const chart = createChart({ zoom: { mode: 'x', pinch: { enabled: true }, onZoom } })

      simulatePinch(chart, { pos: [chart.width / 2, chart.height / 2], scale: 2 })

      expect(onZoom).toHaveBeenCalled()
      // The fingers move apart in steps, and each step zooms in a little.
      const context = onZoom.mock.calls[0][0]
      expect(context.trigger).toBe('pinch')
      expect(context.amount.x).toBeGreaterThan(1)
      expect(Object.keys(context.ranges)).toEqual(['x'])
      expect(context.ranges.x.max - context.ranges.x.min).toBeLessThan(100)
    })

    it('should get the ranges and no factors for a zoom to a rectangle', function () {
      const onZoom = vi.fn()
      const chart = createChart({ zoom: { mode: 'xy', onZoom } })
      const { x, y } = chart.scales

      chart.zoomRect(
        { x: x.getPixelForValue(20), y: y.getPixelForValue(70) },
        { x: x.getPixelForValue(60), y: y.getPixelForValue(30) }
      )

      const context = onZoom.mock.calls[0][0]
      expect(context.trigger).toBe('api')
      expect(context.amount).toBeUndefined()
      expect(context.ranges.x.min).toBeCloseTo(20, 8)
      expect(context.ranges.x.max).toBeCloseTo(60, 8)
      expect(context.ranges.y.min).toBeCloseTo(30, 8)
      expect(context.ranges.y.max).toBeCloseTo(70, 8)
    })

    it('should get the range and no factors for a zoom of one scale', function () {
      const onZoom = vi.fn()
      const chart = createChart({ zoom: { onZoom } })

      chart.zoomScale('y', { min: 10, max: 40 })

      expect(onZoom).toHaveBeenCalledWith({ chart, trigger: 'api', ranges: { y: { min: 10, max: 40 } } })
    })
  })

  describe('onPan', function () {
    it('should get the distance and the resulting ranges of chart.pan()', function () {
      const onPan = vi.fn()
      const chart = createChart({ pan: { enabled: true, mode: 'xy', onPan } })

      chart.pan({ x: -20 })

      expect(onPan).toHaveBeenCalledTimes(1)
      const context = onPan.mock.calls[0][0]
      expect(context.chart).toBe(chart)
      expect(context.trigger).toBe('api')
      expect(context.delta).toEqual({ x: -20, y: 0 })
      expect(Object.keys(context.ranges)).toEqual(['x'])
      expect(context.ranges).toEqual(rangesOf(chart, 'x'))
      expect(context.ranges.x.min).toBeGreaterThan(0)
    })

    it('should name a drag as the trigger when the user pans', function () {
      const onPan = vi.fn()
      const chart = createChart({ pan: { enabled: true, mode: 'x', onPan } })

      simulatePan(chart, { deltaX: -100, deltaY: 0 })

      expect(onPan).toHaveBeenCalled()
      for (const [context] of onPan.mock.calls) {
        expect(context.trigger).toBe('drag')
      }
      expect(onPan.mock.calls.at(-1)[0].ranges).toEqual(rangesOf(chart, 'x'))
    })
  })

  describe('used to repeat on another chart what the user did', function () {
    function createSynced() {
      const charts = []
      const calls = { zoom: 0, pan: 0 }
      const sync = (kind) =>
        function ({ chart, trigger, ranges }) {
          calls[kind]++
          if (trigger === 'api') {
            return
          }
          for (const other of charts) {
            if (other !== chart) {
              for (const [scaleId, range] of Object.entries(ranges)) {
                other.zoomScale(scaleId, range)
              }
            }
          }
        }
      const options = {
        pan: { enabled: true, mode: 'x', onPan: sync('pan') },
        zoom: { mode: 'x', wheel: { enabled: true }, onZoom: sync('zoom') },
      }
      charts.push(createChart(options), createChart(options))
      return { charts, calls }
    }

    it('should follow a wheel zoom without the charts answering each other', function () {
      const { charts, calls } = createSynced()
      const [first, second] = charts
      const { left, right, top, bottom } = first.chartArea

      triggerWheelEvent(first, { x: (left + right) / 2, y: (top + bottom) / 2, deltaY: -100 })

      expect(second.scales.x.min).toBeCloseTo(first.scales.x.min, 10)
      expect(second.scales.x.max).toBeCloseTo(first.scales.x.max, 10)
      expect(second.scales.x.max - second.scales.x.min).toBeCloseTo(90, 10)
      // The zoom of the first chart, and the one it made on the second.
      expect(calls.zoom).toBe(2)
    })

    it('should follow a pan', function () {
      const { charts } = createSynced()
      const [first, second] = charts
      first.zoomScale('x', { min: 20, max: 60 })
      second.zoomScale('x', { min: 20, max: 60 })

      simulatePan(first, { deltaX: -100, deltaY: 0 })

      expect(first.scales.x.min).toBeGreaterThan(20)
      expect(second.scales.x.min).toBeCloseTo(first.scales.x.min, 10)
      expect(second.scales.x.max).toBeCloseTo(first.scales.x.max, 10)
    })
  })
})
