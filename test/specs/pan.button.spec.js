import { acquireChart, triggerMouseEvent } from 'chartjs-test-utils'
import { dispatchMouseEvent, simulatePan } from '../utils.js'

describe('pan with another mouse button', function () {
  const BUTTONS = { left: 0, middle: 1, right: 2 }

  function createChart(pan, zoom) {
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
        scales: { x: { min: 0, max: 100 }, y: { min: 0, max: 100 } },
        plugins: { zoom: { pan: { enabled: true, mode: 'x', threshold: 0, ...pan }, zoom } },
      },
    })
  }

  const dragWith = (chart, button) =>
    simulatePan(chart, { deltaX: -100, deltaY: 0, pointerType: 'mouse', button: BUTTONS[button] })

  const panned = (chart) => chart.scales.x.min !== 0

  it('should pan with the left button and no other by default', function () {
    for (const button of ['middle', 'right']) {
      const chart = createChart()
      dragWith(chart, button)
      expect(panned(chart)).toBe(false)
    }

    const chart = createChart()
    dragWith(chart, 'left')
    expect(panned(chart)).toBe(true)
  })

  for (const button of ['middle', 'right']) {
    it(`should pan with the ${button} button and no other when it is the one configured`, function () {
      for (const other of Object.keys(BUTTONS).filter((name) => name !== button)) {
        const chart = createChart({ button })
        dragWith(chart, other)
        expect(panned(chart)).toBe(false)
      }

      const chart = createChart({ button })
      dragWith(chart, button)
      expect(panned(chart)).toBe(true)
    })
  }

  it('should pan with touch whatever the button is', function () {
    const chart = createChart({ button: 'right' })

    simulatePan(chart, { deltaX: -100, deltaY: 0 })

    expect(panned(chart)).toBe(true)
  })

  it('should leave the left button to drag zoom without a modifier key', function () {
    const chart = createChart({ button: 'middle' }, { drag: { enabled: true }, mode: 'x' })
    const { left, right, top, bottom } = chart.chartArea
    const y = (top + bottom) / 2

    dispatchMouseEvent(chart, 'mousedown', { x: left + (right - left) * 0.25, y })
    dispatchMouseEvent(chart, 'mousemove', { x: left + (right - left) * 0.75, y })
    dispatchMouseEvent(chart, 'mouseup', { x: left + (right - left) * 0.75, y })

    // The drag zoomed to its rectangle, give or take a pixel.
    const zoomed = { min: chart.scales.x.min, max: chart.scales.x.max }
    expect(zoomed.min).toBeCloseTo(25, 0)
    expect(zoomed.max).toBeCloseTo(75, 0)

    dragWith(chart, 'middle')

    expect(chart.scales.x.min).toBeGreaterThan(zoomed.min)
    expect(chart.scales.x.max - chart.scales.x.min).toBeCloseTo(zoomed.max - zoomed.min, 8)
  })

  // The click that ends a left button drag is not the user clicking the chart,
  // so it is filtered. No click follows a drag with another button, or with a
  // finger, and the user's next real click must not be the one filtered.
  describe('the click after a pan', function () {
    async function clickAfterPan(pan, drag) {
      const onClick = vi.fn()
      const chart = createChart(pan)
      chart.options.onClick = onClick
      chart.update()

      drag(chart)
      expect(panned(chart)).toBe(true)
      const { left, right, top, bottom } = chart.chartArea
      await triggerMouseEvent(chart, 'click', { x: (left + right) / 2, y: (top + bottom) / 2 })

      return { chart, onClick }
    }

    for (const button of ['middle', 'right']) {
      it(`should reach the chart after a pan with the ${button} button`, async function () {
        const { chart, onClick } = await clickAfterPan({ button }, (c) => dragWith(c, button))

        expect(onClick).toHaveBeenCalledTimes(1)
        expect(chart.isZoomingOrPanning()).toBe(false)
      })
    }

    it('should reach the chart after a pan with a finger', async function () {
      const { chart, onClick } = await clickAfterPan({}, (c) => simulatePan(c, { deltaX: -100, deltaY: 0 }))

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(chart.isZoomingOrPanning()).toBe(false)
    })

    it('should be filtered after a pan with the left button, which a click follows', async function () {
      const { onClick } = await clickAfterPan({}, (c) => dragWith(c, 'left'))

      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('what the browser does with the button', function () {
    function isPrevented(chart, type, button) {
      const event = new MouseEvent(type, { button: BUTTONS[button], cancelable: true, bubbles: true })
      chart.canvas.dispatchEvent(event)
      return event.defaultPrevented
    }

    it('should keep the context menu unless the right button pans', function () {
      expect(isPrevented(createChart(), 'contextmenu', 'right')).toBe(false)
      expect(isPrevented(createChart({ button: 'middle' }), 'contextmenu', 'right')).toBe(false)
      expect(isPrevented(createChart({ button: 'right' }), 'contextmenu', 'right')).toBe(true)
    })

    it('should keep the scrolling of the middle button unless that button pans', function () {
      expect(isPrevented(createChart(), 'mousedown', 'middle')).toBe(false)
      expect(isPrevented(createChart({ button: 'right' }), 'mousedown', 'middle')).toBe(false)
      expect(isPrevented(createChart({ button: 'middle' }), 'mousedown', 'middle')).toBe(true)
    })

    it('should not touch the other buttons when the middle one pans', function () {
      const chart = createChart({ button: 'middle' })

      expect(isPrevented(chart, 'mousedown', 'left')).toBe(false)
      expect(isPrevented(chart, 'mousedown', 'right')).toBe(false)
    })

    it('should follow the option when it changes', function () {
      const chart = createChart({ button: 'right' })
      chart.options.plugins.zoom.pan.button = 'left'
      chart.update()

      expect(isPrevented(chart, 'contextmenu', 'right')).toBe(false)
      dragWith(chart, 'left')
      expect(panned(chart)).toBe(true)
    })

    it('should keep the context menu when panning is turned off', function () {
      const chart = createChart({ button: 'right', enabled: false })

      expect(isPrevented(chart, 'contextmenu', 'right')).toBe(false)
    })
  })
})
