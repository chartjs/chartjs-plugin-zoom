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
  // so it is filtered. It comes right after the release. No click follows a
  // drag with another button, or with a finger, and the user's next real
  // click, which comes later, must not be the one filtered.
  describe('the click after a pan', function () {
    // Long enough for the click of the release to have been handled, had there
    // been one: the chart handles events in the next frame.
    const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()))
    const later = async () => {
      await frame()
      await frame()
      await new Promise((resolve) => setTimeout(resolve, 0))
    }

    function panThenClick(pan, drag) {
      const onClick = vi.fn()
      const chart = createChart(pan)
      chart.options.onClick = onClick
      chart.update()
      const { left, right, top, bottom } = chart.chartArea
      const click = () => triggerMouseEvent(chart, 'click', { x: (left + right) / 2, y: (top + bottom) / 2 })

      drag(chart)
      expect(panned(chart)).toBe(true)

      return { chart, onClick, click }
    }

    const drags = {
      'the middle button': [{ button: 'middle' }, (chart) => dragWith(chart, 'middle')],
      'the right button': [{ button: 'right' }, (chart) => dragWith(chart, 'right')],
      'a finger': [{}, (chart) => simulatePan(chart, { deltaX: -100, deltaY: 0 })],
      'a pen': [{}, (chart) => simulatePan(chart, { deltaX: -100, deltaY: 0, pointerType: 'pen' })],
    }

    for (const [name, [pan, drag]] of Object.entries(drags)) {
      it(`should reach the chart when the user clicks after a pan with ${name}`, async function () {
        const { chart, onClick, click } = panThenClick(pan, drag)

        await later()
        expect(chart.isZoomingOrPanning()).toBe(false)
        await click()

        expect(onClick).toHaveBeenCalledTimes(1)
      })
    }

    for (const [name, [pan, drag]] of Object.entries({
      'the left button': [{}, (c) => dragWith(c, 'left')],
      ...drags,
    })) {
      it(`should be filtered when it comes with the release of ${name}`, async function () {
        const { onClick, click } = panThenClick(pan, drag)

        await click()

        expect(onClick).not.toHaveBeenCalled()
      })
    }

    it('should reach the chart when the user clicks after a pan with the left button', async function () {
      const { onClick, click } = panThenClick({}, (chart) => dragWith(chart, 'left'))
      await click()
      await later()

      await click()

      expect(onClick).toHaveBeenCalledTimes(1)
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
