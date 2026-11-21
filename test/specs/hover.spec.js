import { acquireChart, triggerMouseEvent } from 'chartjs-test-utils'
import { dispatchMouseEvent, simulatePan } from '../utils.js'

// The chart does not handle events during a pan or a drag zoom, so what was
// hovered when it started would stay on screen for as long as it lasts.
describe('tooltip and hover while interacting', function () {
  function createChart(zoom) {
    return acquireChart({
      type: 'scatter',
      data: {
        datasets: [
          {
            pointRadius: 10,
            data: [
              { x: 0, y: 0 },
              { x: 50, y: 50 },
              { x: 100, y: 100 },
            ],
          },
        ],
      },
      options: {
        animation: false,
        scales: { x: { min: 0, max: 100 }, y: { min: 0, max: 100 } },
        plugins: { zoom },
      },
    })
  }

  // The chart handles a mouse move in the next frame, which this waits for.
  async function hover(chart, index) {
    const point = chart.getDatasetMeta(0).data[index]
    await triggerMouseEvent(chart, 'mousemove', point)
    return point
  }

  it('should show a tooltip for the hovered point to begin with', async function () {
    const chart = createChart({ pan: { enabled: true } })

    await hover(chart, 1)

    expect(chart.tooltip.getActiveElements().length).toBe(1)
    expect(chart.getActiveElements().length).toBe(1)
    expect(chart.tooltip.opacity).toBe(1)
  })

  it('should hide the tooltip and clear the hover when a pan starts', async function () {
    const during = []
    const chart = createChart({
      pan: {
        enabled: true,
        threshold: 0,
        onPan: ({ chart: c }) =>
          during.push([c.tooltip.getActiveElements().length, c.getActiveElements().length, c.tooltip.opacity]),
      },
    })
    await hover(chart, 1)
    expect(chart.tooltip.getActiveElements().length).toBe(1)

    simulatePan(chart, { deltaX: -60, deltaY: 0 })

    expect(during.length).toBeGreaterThan(0)
    for (const state of during) {
      expect(state).toEqual([0, 0, 0])
    }
  })

  it('should hide the tooltip and clear the hover when a drag zoom starts', async function () {
    const chart = createChart({ zoom: { drag: { enabled: true }, mode: 'x' } })
    const point = await hover(chart, 1)

    dispatchMouseEvent(chart, 'mousedown', { x: point.x, y: point.y })
    expect(chart.tooltip.getActiveElements().length).toBe(1)

    dispatchMouseEvent(chart, 'mousemove', { x: point.x + 40, y: point.y })

    expect(chart.tooltip.getActiveElements().length).toBe(0)
    expect(chart.getActiveElements().length).toBe(0)
    expect(chart.tooltip.opacity).toBe(0)
  })

  it('should show the tooltip again with the next event after the pan', async function () {
    const chart = createChart({ pan: { enabled: true, threshold: 0 } })
    await hover(chart, 1)
    simulatePan(chart, { deltaX: -60, deltaY: 0 })
    expect(chart.tooltip.getActiveElements().length).toBe(0)

    await hover(chart, 2)

    expect(chart.tooltip.getActiveElements().length).toBe(1)
    expect(chart.tooltip.opacity).toBe(1)
  })
})
