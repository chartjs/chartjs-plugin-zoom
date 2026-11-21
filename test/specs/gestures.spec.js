import { acquireChart } from 'chartjs-test-utils'

describe('gesture manager', function () {
  const data = {
    datasets: [
      {
        data: [
          { x: 1, y: 3 },
          { x: 2, y: 2 },
          { x: 3, y: 1 },
        ],
      },
    ],
  }

  it('should disable text selection and browser touch actions while gestures are enabled', function () {
    const chart = acquireChart({
      type: 'scatter',
      data,
      options: {
        plugins: {
          zoom: {
            pan: { enabled: true },
          },
        },
      },
    })

    expect(chart.canvas.style.touchAction).toBe('none')
    expect(chart.canvas.style.userSelect).toBe('none')
  })

  it('should leave canvas styles untouched when neither pan nor pinch is enabled', function () {
    const chart = acquireChart({
      type: 'scatter',
      data,
      options: {
        plugins: {
          zoom: {
            zoom: { wheel: { enabled: true } },
          },
        },
      },
    })

    expect(chart.canvas.style.userSelect).toBe('')
    expect(chart.canvas.style.touchAction).toBe('')
  })

  describe('touch action', function () {
    function touchActionFor(zoom) {
      return acquireChart({ type: 'scatter', data, options: { plugins: { zoom } } }).canvas.style.touchAction
    }

    it('should leave vertical scrolling to the browser when gestures only use the x axis', function () {
      expect(touchActionFor({ pan: { enabled: true, mode: 'x' } })).toBe('pan-y')
      expect(touchActionFor({ zoom: { pinch: { enabled: true }, mode: 'x' } })).toBe('pan-y')
      expect(touchActionFor({ pan: { enabled: true, mode: 'x' }, zoom: { pinch: { enabled: true }, mode: 'x' } })).toBe(
        'pan-y'
      )
    })

    it('should leave horizontal scrolling to the browser when gestures only use the y axis', function () {
      expect(touchActionFor({ pan: { enabled: true, mode: 'y' } })).toBe('pan-x')
      expect(touchActionFor({ zoom: { pinch: { enabled: true }, mode: () => 'y' } })).toBe('pan-x')
    })

    it('should claim both directions when pan and pinch use different axes', function () {
      expect(touchActionFor({ pan: { enabled: true, mode: 'x' }, zoom: { pinch: { enabled: true }, mode: 'y' } })).toBe(
        'none'
      )
    })

    it('should ignore the mode of a gesture that is not enabled', function () {
      expect(
        touchActionFor({ pan: { enabled: true, mode: 'x' }, zoom: { wheel: { enabled: true }, mode: 'xy' } })
      ).toBe('pan-y')
    })

    it('should follow the mode when it changes', function () {
      let mode = 'x'
      const chart = acquireChart({
        type: 'scatter',
        data,
        options: { plugins: { zoom: { pan: { enabled: true, mode: () => mode } } } },
      })
      expect(chart.canvas.style.touchAction).toBe('pan-y')

      mode = 'xy'
      chart.update()
      expect(chart.canvas.style.touchAction).toBe('none')

      chart.options.plugins.zoom.pan.mode = 'y'
      chart.update()
      expect(chart.canvas.style.touchAction).toBe('pan-x')
    })
  })
})
