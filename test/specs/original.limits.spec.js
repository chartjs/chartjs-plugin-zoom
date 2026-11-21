import { acquireChart } from 'chartjs-test-utils'

// The range a zoomed scale would have without the zoom is what the 'original'
// limits, the zoom level and a reset refer to. It has to follow the data.
describe('original scale limits', function () {
  const points = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => ({ x: from + i, y: (from + i) / 10 }))

  function createChart(zoom, scales = {}) {
    return acquireChart({
      type: 'scatter',
      data: { datasets: [{ data: points(0, 100) }] },
      options: { scales, plugins: { zoom } },
    })
  }

  function setData(chart, from, to) {
    chart.data.datasets[0].data = points(from, to)
    chart.update()
  }

  const bounds = (chart) =>
    Object.fromEntries(Object.values(chart.scales).map((scale) => [scale.id, { min: scale.min, max: scale.max }]))

  it('should keep the zoomed range when the data changes', function () {
    const chart = createChart({ zoom: { mode: 'x' } })
    chart.zoom({ x: 1.5 })
    setData(chart, 50, 200)

    expect(chart.scales.x.min).toBe(25)
    expect(chart.scales.x.max).toBe(75)
  })

  it('should report the range the new data would have without the zoom', function () {
    const chart = createChart({ zoom: { mode: 'xy' } })
    chart.zoom(1.5)
    setData(chart, 50, 200)

    const initial = chart.getInitialScaleBounds()
    chart.resetZoom('none')

    expect(initial).toEqual(bounds(chart))
    expect(initial.x).toEqual({ min: 40, max: 200 })
  })

  it('should measure the zoom level against the new data', function () {
    const chart = createChart({ zoom: { mode: 'x' } })
    chart.zoom({ x: 1.5 })
    expect(chart.getZoomLevel()).toBe(2)

    setData(chart, 50, 200)

    // 160 units of data, 50 of them shown.
    expect(chart.getZoomLevel()).toBe(3.2)
  })

  it('should let the original limits reach data that arrived while zoomed', function () {
    const chart = createChart({ zoom: { mode: 'x' }, limits: { x: { min: 'original', max: 'original' } } })
    chart.zoom({ x: 1.5 })
    setData(chart, 50, 200)

    chart.zoom({ x: 0.1 })
    chart.zoom({ x: 0.1 })

    expect(chart.scales.x.min).toBe(40)
    expect(chart.scales.x.max).toBe(200)
  })

  it('should not narrow the original range of a scale to the zoom of the scale across it', function () {
    const chart = createChart({ zoom: { mode: 'xy' } })
    chart.zoomScale('x', { min: 10, max: 20 })
    chart.zoomScale('y', { min: 1, max: 2 })
    setData(chart, 0, 300)

    const initial = chart.getInitialScaleBounds()
    chart.resetZoom('none')

    // The y values grow with x, so only the data inside the x zoom would give
    // a much smaller range.
    expect(initial.y).toEqual(bounds(chart).y)
    expect(initial.y.max).toBe(30)
  })

  it('should keep a bound the scale options gave', function () {
    const chart = createChart({ zoom: { mode: 'x' } }, { x: { min: 10 } })
    chart.zoom({ x: 1.5 })
    setData(chart, 50, 200)

    expect(chart.getInitialScaleBounds().x).toEqual({ min: 10, max: 200 })
  })

  it('should leave a scale alone when the options gave both bounds', function () {
    const afterDataLimits = vi.fn()
    const chart = createChart({ zoom: { mode: 'x' } }, { x: { min: 10, max: 90, afterDataLimits } })
    chart.zoom({ x: 1.5 })
    afterDataLimits.mockClear()
    setData(chart, 50, 200)

    expect(afterDataLimits).toHaveBeenCalledTimes(1)
    expect(chart.getInitialScaleBounds().x).toEqual({ min: 10, max: 90 })
  })

  it('should take bounds the application sets on a zoomed scale as the new original', function () {
    const chart = createChart({ zoom: { mode: 'x' } })
    chart.zoom({ x: 1.5 })
    chart.options.scales.x.min = 60
    chart.options.scales.x.max = 80
    setData(chart, 50, 200)

    expect(chart.scales.x.min).toBe(60)
    expect(chart.scales.x.max).toBe(80)
    expect(chart.getInitialScaleBounds().x).toEqual({ min: 60, max: 80 })
  })

  it('should follow the data on a time scale and keep how the chart set the scale up', function () {
    const day = 24 * 60 * 60 * 1000
    const days = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => ({ x: (from + i) * day, y: i }))
    const chart = acquireChart({
      type: 'line',
      data: { datasets: [{ data: days(0, 100) }] },
      options: {
        normalized: true,
        parsing: false,
        scales: { x: { type: 'time', time: { unit: 'day' } } },
        plugins: { zoom: { zoom: { mode: 'x' } } },
      },
    })
    chart.zoomScale('x', { min: 20 * day, max: 30 * day })
    chart.data.datasets[0].data = days(50, 200)
    chart.update()

    expect(chart.scales.x.min).toBe(20 * day)
    expect(chart.scales.x.max).toBe(30 * day)
    expect(chart.getInitialScaleBounds().x).toEqual({ min: 50 * day, max: 200 * day })
    // The chart hands its options to a scale when it initialises one, and the
    // time scale reads this from them.
    expect(chart.scales.x._normalized).toBe(true)
  })

  it('should not compute the scales twice for the updates of a pan', function () {
    const afterDataLimits = vi.fn()
    const chart = createChart({ pan: { enabled: true, mode: 'x' }, zoom: { mode: 'x' } }, { x: { afterDataLimits } })
    chart.zoom({ x: 1.5 })
    afterDataLimits.mockClear()

    chart.pan({ x: -20 })

    expect(afterDataLimits).toHaveBeenCalledTimes(1)
  })

  it('should let a view the limits no longer cover be panned back inside them', function () {
    const chart = createChart({
      pan: { enabled: true, mode: 'x' },
      zoom: { mode: 'x' },
      limits: { x: { min: 'original', max: 'original' } },
    })
    chart.zoom({ x: 1.5 })
    setData(chart, 50, 200)
    expect(chart.scales.x.min).toBe(25)

    // Further out is still refused.
    chart.pan({ x: 20 })
    expect(chart.scales.x.min).toBe(25)

    chart.pan({ x: -20 })
    expect(chart.scales.x.min).toBe(40)
    expect(chart.scales.x.max).toBe(90)
  })

  it('should report no zoom after a reset, also when the data changes afterwards', function () {
    const chart = createChart({ zoom: { mode: 'x' } })
    chart.zoom({ x: 1.5 })
    chart.resetZoom('none')
    setData(chart, 50, 200)

    expect(chart.getZoomLevel()).toBe(1)
    expect(chart.isZoomedOrPanned()).toBe(false)
    expect(chart.getInitialScaleBounds().x).toEqual({ min: 40, max: 200 })
  })
})
