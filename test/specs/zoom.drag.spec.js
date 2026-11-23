import { acquireChart, triggerMouseEvent } from 'chartjs-test-utils'
import { dispatchMouseEvent } from '../utils.js'

describe('zoom with drag', function () {
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

  describe('on linear scale', function () {
    let chart, scaleX, scaleY

    it('should be applied on X scale when mode = x', function () {
      chart = acquireChart({
        type: 'line',
        data,
        options: {
          scales: {
            xScale0: {
              id: 'xScale0',
              type: 'linear',
            },
            yScale0: {
              id: 'yScale0',
              type: 'linear',
            },
          },
          plugins: {
            zoom: {
              zoom: {
                drag: {
                  enabled: true,
                },
                mode: 'x',
              },
            },
          },
        },
      })

      scaleX = chart.scales.xScale0
      scaleY = chart.scales.yScale0

      triggerMouseEvent(chart, 'mousedown', {
        x: scaleX.getPixelForValue(1.5),
        y: scaleY.getPixelForValue(1.1),
      })
      triggerMouseEvent(chart, 'mouseup', {
        x: scaleX.getPixelForValue(2.8),
        y: scaleY.getPixelForValue(1.7),
      })

      expect(scaleX.options.min).toBeCloseTo(1.5)
      expect(scaleX.options.max).toBeCloseTo(2.8)
      expect(scaleY.options.min).toBeUndefined()
      expect(scaleY.options.max).toBeUndefined()
    })

    it('should be applied on X scale when mode = f() => x', function () {
      chart = acquireChart({
        type: 'line',
        data,
        options: {
          scales: {
            xScale0: {
              id: 'xScale0',
              type: 'linear',
            },
            yScale0: {
              id: 'yScale0',
              type: 'linear',
            },
          },
          plugins: {
            zoom: {
              zoom: {
                drag: {
                  enabled: true,
                },
                mode: function () {
                  return 'x'
                },
              },
            },
          },
        },
      })

      scaleX = chart.scales.xScale0
      scaleY = chart.scales.yScale0

      triggerMouseEvent(chart, 'mousedown', {
        x: scaleX.getPixelForValue(1.5),
        y: scaleY.getPixelForValue(1.1),
      })
      triggerMouseEvent(chart, 'mouseup', {
        x: scaleX.getPixelForValue(2.8),
        y: scaleY.getPixelForValue(1.7),
      })

      expect(scaleX.options.min).toBeCloseTo(1.5)
      expect(scaleX.options.max).toBeCloseTo(2.8)
      expect(scaleY.options.min).toBeUndefined()
      expect(scaleY.options.max).toBeUndefined()
    })

    it('should be applied on Y scale when mode = y', function () {
      chart = acquireChart({
        type: 'line',
        data,
        options: {
          scales: {
            xScale0: {
              id: 'xScale0',
              type: 'linear',
            },
            yScale0: {
              id: 'yScale0',
              type: 'linear',
            },
          },
          plugins: {
            zoom: {
              zoom: {
                drag: {
                  enabled: true,
                },
                mode: 'y',
              },
            },
          },
        },
      })

      scaleX = chart.scales.xScale0
      scaleY = chart.scales.yScale0

      triggerMouseEvent(chart, 'mousedown', {
        x: scaleX.getPixelForValue(1.5),
        y: scaleY.getPixelForValue(1.1),
      })
      triggerMouseEvent(chart, 'mouseup', {
        x: scaleX.getPixelForValue(2.8),
        y: scaleY.getPixelForValue(1.7),
      })

      expect(scaleX.options.min).toBeUndefined()
      expect(scaleX.options.max).toBeUndefined()
      expect(scaleY.options.min).toBeCloseTo(1.1)
      expect(scaleY.options.max).toBeCloseTo(1.7)
    })

    it('should be applied on Y scale when mode = f() => y', function () {
      chart = acquireChart({
        type: 'line',
        data,
        options: {
          scales: {
            xScale0: {
              id: 'xScale0',
              type: 'linear',
            },
            yScale0: {
              id: 'yScale0',
              type: 'linear',
            },
          },
          plugins: {
            zoom: {
              zoom: {
                drag: {
                  enabled: true,
                },
                mode: function () {
                  return 'y'
                },
              },
            },
          },
        },
      })

      scaleX = chart.scales.xScale0
      scaleY = chart.scales.yScale0

      triggerMouseEvent(chart, 'mousedown', {
        x: scaleX.getPixelForValue(1.5),
        y: scaleY.getPixelForValue(1.1),
      })
      triggerMouseEvent(chart, 'mouseup', {
        x: scaleX.getPixelForValue(2.8),
        y: scaleY.getPixelForValue(1.7),
      })

      expect(scaleX.options.min).toBeUndefined()
      expect(scaleX.options.max).toBeUndefined()
      expect(scaleY.options.min).toBeCloseTo(1.1)
      expect(scaleY.options.max).toBeCloseTo(1.7)
    })

    it('should be applied on X and Y scales when mode = xy', function () {
      chart = acquireChart({
        type: 'line',
        data,
        options: {
          scales: {
            xScale0: {
              id: 'xScale0',
              type: 'linear',
            },
            yScale0: {
              id: 'yScale0',
              type: 'linear',
            },
          },
          plugins: {
            zoom: {
              zoom: {
                drag: {
                  enabled: true,
                },
                mode: 'xy',
              },
            },
          },
        },
      })

      scaleX = chart.scales.xScale0
      scaleY = chart.scales.yScale0

      triggerMouseEvent(chart, 'mousedown', {
        x: scaleX.getPixelForValue(1.5),
        y: scaleY.getPixelForValue(1.1),
      })
      triggerMouseEvent(chart, 'mouseup', {
        x: scaleX.getPixelForValue(2.8),
        y: scaleY.getPixelForValue(1.7),
      })

      expect(scaleX.options.min).toBeCloseTo(1.5)
      expect(scaleX.options.max).toBeCloseTo(2.8)
      expect(scaleY.options.min).toBeCloseTo(1.1)
      expect(scaleY.options.max).toBeCloseTo(1.7)
    })
  })

  describe('with modifierKey', function () {
    for (const key of ['ctrl', 'alt', 'shift', 'meta']) {
      for (const pressed of [true, false]) {
        let chart, scaleX, scaleY
        it(`should ${pressed ? '' : 'not '}change ${pressed ? 'with' : 'without'} key ${key}`, async function () {
          const rejectedSpy = vi.fn()
          chart = acquireChart({
            type: 'line',
            data,
            options: {
              scales: {
                x: {
                  type: 'linear',
                  min: 0,
                  max: 10,
                },
                y: {
                  type: 'linear',
                },
              },
              plugins: {
                zoom: {
                  zoom: {
                    drag: {
                      enabled: true,
                      modifierKey: key,
                    },
                    mode: 'x',
                    onZoomRejected: rejectedSpy,
                  },
                },
              },
            },
          })

          scaleX = chart.scales.x
          scaleY = chart.scales.y

          const oldMinX = scaleX.options.min
          const oldMaxX = scaleX.options.max

          const pt = {
            x: scaleX.getPixelForValue(1.5),
            y: scaleY.getPixelForValue(1.1),
          }
          const pt2 = { x: pt.x + 20, y: pt.y + 20 }
          const init = {}
          if (pressed) {
            init[key + 'Key'] = true
          }

          dispatchMouseEvent(chart, 'mousedown', pt, init)
          dispatchMouseEvent(chart, 'mousemove', pt2, init)
          dispatchMouseEvent(chart, 'mouseup', pt2, init)

          if (pressed) {
            expect(scaleX.options.min).not.toEqual(oldMinX)
            expect(scaleX.options.max).not.toEqual(oldMaxX)
            expect(rejectedSpy).not.toHaveBeenCalled()
          } else {
            expect(scaleX.options.min).toEqual(oldMinX)
            expect(scaleX.options.max).toEqual(oldMaxX)
            expect(rejectedSpy).toHaveBeenCalled()
          }
        })
      }
    }
  })

  describe('drag with pan.modifierKey', function () {
    for (const key of ['ctrl', 'alt', 'shift', 'meta']) {
      for (const pressed of [true, false]) {
        let chart, scaleX, scaleY
        it(`should ${pressed ? 'not ' : ''}change ${pressed ? 'without' : 'with'} key ${key}`, async function () {
          const rejectedSpy = vi.fn()
          const clickSpy = vi.fn()
          chart = acquireChart({
            type: 'line',
            data,
            options: {
              scales: {
                x: {
                  type: 'linear',
                  min: 0,
                  max: 10,
                },
                y: {
                  type: 'linear',
                },
              },
              plugins: {
                zoom: {
                  pan: {
                    enabled: true,
                    modifierKey: key,
                  },
                  zoom: {
                    drag: {
                      enabled: true,
                    },
                    mode: 'x',
                    onZoomRejected: rejectedSpy,
                  },
                },
              },
              onClick: clickSpy,
            },
          })

          scaleX = chart.scales.x
          scaleY = chart.scales.y

          const oldMinX = scaleX.options.min
          const oldMaxX = scaleX.options.max

          const pt = {
            x: scaleX.getPixelForValue(1.5),
            y: scaleY.getPixelForValue(1.1),
          }
          const pt2 = { x: pt.x + 20, y: pt.y + 20 }
          const init = {}
          if (pressed) {
            init[key + 'Key'] = true
          }

          dispatchMouseEvent(chart, 'mousedown', pt, init)
          dispatchMouseEvent(chart, 'mousemove', pt2, init)
          dispatchMouseEvent(chart, 'mouseup', pt2, init)

          if (pressed) {
            expect(scaleX.options.min).toEqual(oldMinX)
            expect(scaleX.options.max).toEqual(oldMaxX)
            expect(rejectedSpy).toHaveBeenCalled()
          } else {
            expect(scaleX.options.min).not.toEqual(oldMinX)
            expect(scaleX.options.max).not.toEqual(oldMaxX)
            expect(rejectedSpy).not.toHaveBeenCalled()
          }
          expect(clickSpy).not.toHaveBeenCalled()
        })
      }
    }
  })

  describe('coordinate handling', function () {
    let chart, scaleX, scaleY

    it('handles dragging to the right edge of the chart', function () {
      chart = acquireChart(
        {
          type: 'line',
          data,
          options: {
            scales: {
              xScale0: {
                id: 'xScale0',
                type: 'linear',
                min: 0,
                max: 4,
              },
              yScale0: {
                id: 'yScale0',
                type: 'linear',
                min: 0,
                max: 4,
              },
            },
            plugins: {
              zoom: {
                zoom: {
                  drag: {
                    enabled: true,
                  },
                  mode: 'xy',
                },
              },
            },
          },
        },
        {
          wrapper: { style: 'position: absolute; left: 50px; top: 50px;' },
        }
      )

      scaleX = chart.scales.xScale0
      scaleY = chart.scales.yScale0

      triggerMouseEvent(chart, 'mousedown', {
        x: scaleX.getPixelForValue(1.5),
        y: scaleY.getPixelForValue(1.2),
      })
      triggerMouseEvent(chart, 'mouseup', {
        x: scaleX.getPixelForValue(4) + 5,
        y: scaleY.getPixelForValue(1.7),
      })

      expect(scaleX.options.min).toBeCloseTo(1.5)
      expect(scaleX.options.max).toBeCloseTo(4)
      expect(scaleY.options.min).toBeCloseTo(1.2)
      expect(scaleY.options.max).toBeCloseTo(1.7)
    })

    it('handles dragging off the right edge of the chart canvas', function () {
      chart = acquireChart(
        {
          type: 'line',
          data,
          options: {
            scales: {
              xScale0: {
                id: 'xScale0',
                type: 'linear',
                min: 0,
                max: 4,
              },
              yScale0: {
                id: 'yScale0',
                type: 'linear',
                min: 0,
                max: 4,
              },
            },
            plugins: {
              zoom: {
                zoom: {
                  drag: {
                    enabled: true,
                  },
                  mode: 'xy',
                },
              },
            },
          },
        },
        {
          wrapper: { style: 'position: absolute; left: 50px; top: 50px;' },
        }
      )

      scaleX = chart.scales.xScale0
      scaleY = chart.scales.yScale0

      triggerMouseEvent(chart, 'mousedown', {
        x: scaleX.getPixelForValue(1.5),
        y: scaleY.getPixelForValue(1.2),
      })

      const rect = chart.canvas.getBoundingClientRect()
      document.documentElement.dispatchEvent(
        new MouseEvent('mouseup', {
          clientX: rect.right,
          clientY: rect.top + scaleY.getPixelForValue(1.7),
          cancelable: true,
          bubbles: true,
          view: window,
        })
      )

      expect(scaleX.options.min).toBeCloseTo(1.5)
      expect(scaleX.options.max).toBeCloseTo(4)
      expect(scaleY.options.min).toBeCloseTo(1.2)
      expect(scaleY.options.max).toBeCloseTo(1.7)
    })
  })

  describe('events', function () {
    it('should call onZoomStart, onZoom and onZoomComplete', async function () {
      const completeSpy = vi.fn()
      const startSpy = vi.fn()
      const zoomSpy = vi.fn()
      const chart = acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              zoom: {
                drag: {
                  enabled: true,
                },
                mode: 'xy',
                onZoomStart: startSpy,
                onZoom: zoomSpy,
                onZoomComplete: completeSpy,
              },
            },
          },
        },
      })

      const pt = {
        x: chart.scales.x.getPixelForValue(1.5),
        y: chart.scales.y.getPixelForValue(1.1),
      }
      const pt2 = { x: pt.x + 20, y: pt.y + 20 }

      expect(chart.isZoomingOrPanning()).toBe(false)

      dispatchMouseEvent(chart, 'mousedown', pt)
      dispatchMouseEvent(chart, 'mousemove', pt2)

      expect(chart.isZoomingOrPanning()).toBe(true)

      dispatchMouseEvent(chart, 'mouseup', pt2)

      // Drag state isn't cleared until a timeout fires (later), so we can't
      // easily test this here.
      // expect(chart.isZoomingOrPanning()).toBe(false);

      expect(startSpy).toHaveBeenCalled()
      // A drag zooms to a rectangle, so it reports the ranges and no factors.
      const { x, y } = chart.scales
      expect(zoomSpy).toHaveBeenCalledWith({
        chart,
        trigger: 'drag',
        ranges: { x: { min: x.min, max: x.max }, y: { min: y.min, max: y.max } },
      })
      expect(x.max - x.min).toBeLessThan(1)

      await vi.waitFor(() => expect(completeSpy).toHaveBeenCalled())
    })

    it('should call onZoomRejected when onZoomStart returns false', function () {
      const zoomSpy = vi.fn()
      const rejectSpy = vi.fn()
      const doneSpy = vi.fn()
      const chart = acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              zoom: {
                drag: {
                  enabled: true,
                },
                mode: 'xy',
                onZoomStart: () => false,
                onZoom: zoomSpy,
                onZoomComplete: doneSpy,
                onZoomRejected: rejectSpy,
              },
            },
          },
        },
      })

      const pt = {
        x: chart.scales.x.getPixelForValue(1.5),
        y: chart.scales.y.getPixelForValue(1.1),
      }
      const pt2 = { x: pt.x + 20, y: pt.y + 20 }

      expect(chart.isZoomingOrPanning()).toBe(false)

      dispatchMouseEvent(chart, 'mousedown', pt)

      expect(chart.isZoomingOrPanning()).toBe(false)

      dispatchMouseEvent(chart, 'mousemove', pt2)
      dispatchMouseEvent(chart, 'mouseup', pt2)

      expect(chart.isZoomingOrPanning()).toBe(false)

      expect(rejectSpy).toHaveBeenCalled()
      expect(zoomSpy).not.toHaveBeenCalled()
      expect(doneSpy).not.toHaveBeenCalled()
    })
  })

  describe('drag gesture', function () {
    const createChart = (drag = {}, options = {}) =>
      acquireChart({
        type: 'line',
        data,
        options: {
          scales: {
            x: { type: 'linear', min: 0, max: 10 },
            y: { type: 'linear', min: 0, max: 10 },
          },
          plugins: { zoom: { zoom: { mode: 'xy', drag: { enabled: true, ...drag } } } },
          ...options,
        },
      })
    // A point in the chart area, as fractions of its width and height.
    const pointAt = (chart, fx, fy) => ({
      x: chart.chartArea.left + chart.chartArea.width * fx,
      y: chart.chartArea.top + chart.chartArea.height * fy,
    })
    const drag = (chart, from, to) => {
      dispatchMouseEvent(chart, 'mousedown', from)
      dispatchMouseEvent(chart, 'mousemove', to)
      dispatchMouseEvent(chart, 'mouseup', to)
    }
    const ranges = (chart) => ({
      x: chart.scales.x.max - chart.scales.x.min,
      y: chart.scales.y.max - chart.scales.y.min,
    })

    it('should be cancelled by the Escape key', function () {
      const chart = createChart()
      const from = pointAt(chart, 0.2, 0.2)
      const to = pointAt(chart, 0.6, 0.6)

      dispatchMouseEvent(chart, 'mousedown', from)
      dispatchMouseEvent(chart, 'mousemove', to)

      expect(chart.isZoomingOrPanning()).toBe(true)

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

      expect(chart.isZoomingOrPanning()).toBe(false)

      dispatchMouseEvent(chart, 'mouseup', to)

      expect(ranges(chart)).toEqual({ x: 10, y: 10 })
    })

    it('should not be cancelled by other keys', function () {
      const chart = createChart()
      const from = pointAt(chart, 0.2, 0.2)
      const to = pointAt(chart, 0.6, 0.6)

      dispatchMouseEvent(chart, 'mousedown', from)
      dispatchMouseEvent(chart, 'mousemove', to)
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))

      expect(chart.isZoomingOrPanning()).toBe(true)

      dispatchMouseEvent(chart, 'mouseup', to)

      expect(ranges(chart).x).toBeCloseTo(4, 1)
      expect(ranges(chart).y).toBeCloseTo(4, 1)
    })

    it('should not zoom when shorter than the threshold', function () {
      const zoomSpy = vi.fn()
      const chart = createChart({ threshold: 50 })
      chart.options.plugins.zoom.zoom.onZoom = zoomSpy
      const from = pointAt(chart, 0.2, 0.2)

      drag(chart, from, { x: from.x + 20, y: from.y + 20 })

      expect(zoomSpy).not.toHaveBeenCalled()
      expect(ranges(chart)).toEqual({ x: 10, y: 10 })
      expect(chart.isZoomingOrPanning()).toBe(false)
    })

    it('should zoom when longer than the threshold', function () {
      const chart = createChart({ threshold: 50 })
      const from = pointAt(chart, 0.2, 0.2)

      drag(chart, from, { x: from.x + 80, y: from.y + 80 })

      expect(ranges(chart).x).toBeLessThan(10)
      expect(ranges(chart).y).toBeLessThan(10)
    })

    it('should not start on the legend', function () {
      const startSpy = vi.fn()
      const chart = createChart()
      chart.options.plugins.zoom.zoom.onZoomStart = startSpy
      const { left, top, width, height } = chart.legend

      expect(width * height).toBeGreaterThan(0)

      drag(chart, { x: left + width / 2, y: top + height / 2 }, pointAt(chart, 0.6, 0.6))

      expect(startSpy).not.toHaveBeenCalled()
      expect(ranges(chart)).toEqual({ x: 10, y: 10 })

      // The same drag from just below the legend does start.
      drag(chart, pointAt(chart, 0.5, 0.1), pointAt(chart, 0.6, 0.6))

      expect(startSpy).toHaveBeenCalledTimes(1)
      expect(ranges(chart).x).toBeLessThan(10)
    })

    it('should swallow the click that ends it, and only that one', async function () {
      const clickSpy = vi.fn()
      const chart = createChart({}, { onClick: clickSpy })
      const to = pointAt(chart, 0.6, 0.6)

      drag(chart, pointAt(chart, 0.2, 0.2), to)

      expect(chart.isZoomingOrPanning()).toBe(true)

      // Chart.js handles canvas events on the next animation frame, so wait for it.
      await triggerMouseEvent(chart, 'click', to)

      expect(clickSpy).not.toHaveBeenCalled()
      expect(chart.isZoomingOrPanning()).toBe(false)

      await triggerMouseEvent(chart, 'click', to)

      expect(clickSpy).toHaveBeenCalledTimes(1)
    })

    // Pointer positions are whole pixels, so the zoomed ranges are only close to round numbers.
    describe('with maintainAspectRatio', function () {
      it('should shorten a rectangle that is too wide', function () {
        const chart = createChart({ maintainAspectRatio: true })

        drag(chart, pointAt(chart, 0.1, 0.1), pointAt(chart, 0.7, 0.3))

        expect(ranges(chart).x).toBeCloseTo(2, 1)
        expect(ranges(chart).y).toBeCloseTo(2, 1)
        expect(chart.scales.x.min).toBeCloseTo(1, 1)
      })

      it('should shorten a rectangle that is too tall', function () {
        const chart = createChart({ maintainAspectRatio: true })

        drag(chart, pointAt(chart, 0.1, 0.1), pointAt(chart, 0.3, 0.7))

        expect(ranges(chart).x).toBeCloseTo(2, 1)
        expect(ranges(chart).y).toBeCloseTo(2, 1)
        expect(chart.scales.y.max).toBeCloseTo(9, 1)
      })

      it('should keep the direction of a drag towards the top left', function () {
        const chart = createChart({ maintainAspectRatio: true })

        drag(chart, pointAt(chart, 0.9, 0.9), pointAt(chart, 0.3, 0.7))

        expect(ranges(chart).x).toBeCloseTo(2, 1)
        expect(ranges(chart).y).toBeCloseTo(2, 1)
        expect(chart.scales.x.max).toBeCloseTo(9, 1)
        expect(chart.scales.y.min).toBeCloseTo(1, 1)
      })

      it('should not apply when only one axis is zoomed', function () {
        const chart = createChart({ maintainAspectRatio: true })
        chart.options.plugins.zoom.zoom.mode = 'x'
        chart.update()

        drag(chart, pointAt(chart, 0.1, 0.1), pointAt(chart, 0.7, 0.3))

        expect(ranges(chart).x).toBeCloseTo(6, 1)
        expect(ranges(chart).y).toBe(10)
      })
    })
  })
})
