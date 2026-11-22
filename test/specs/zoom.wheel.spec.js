import { acquireChart, triggerMouseEvent } from 'chartjs-test-utils'
import { nextFrame, triggerWheelEvent, wheelInOwnFrame } from '../utils.js'

describe('zoom with wheel', function () {
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
                    wheel: {
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

          const wheelEv = {
            x: scaleX.getPixelForValue(1.5),
            y: scaleY.getPixelForValue(1.1),
            deltaY: 100,
          }
          if (pressed) {
            wheelEv[key + 'Key'] = true
          }

          triggerWheelEvent(chart, wheelEv)

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

  describe('with overScaleMode = y and mode = xy', function () {
    const config = {
      type: 'line',
      data,
      options: {
        scales: {
          x: {
            type: 'linear',
            min: 1,
            max: 10,
          },
          y: {
            type: 'linear',
          },
        },
        plugins: {
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
              },
              mode: 'xy',
              overScaleMode: 'y',
            },
          },
        },
      },
    }

    describe('Wheel under Y scale', function () {
      it('should be applied on Y, but not on X scales.', function () {
        const chart = acquireChart(config)

        const scaleX = chart.scales.x
        const scaleY = chart.scales.y

        const oldMinX = scaleX.options.min
        const oldMaxX = scaleX.options.max
        const oldMinY = scaleY.options.min
        const oldMaxY = scaleY.options.max

        const wheelEv = {
          x: scaleY.left + (scaleY.right - scaleY.left) / 2,
          y: scaleY.top + (scaleY.bottom - scaleY.top) / 2,
          deltaY: 100,
        }

        triggerWheelEvent(chart, wheelEv)

        expect(scaleX.options.min).toEqual(oldMinX)
        expect(scaleX.options.max).toEqual(oldMaxX)
        expect(scaleY.options.min).not.toEqual(oldMinY)
        expect(scaleY.options.max).not.toEqual(oldMaxY)
      })
    })

    describe('Wheel not under Y scale', function () {
      it('should be applied on X, but not on Y scales.', function () {
        const chart = acquireChart(config)

        const scaleX = chart.scales.x
        const scaleY = chart.scales.y

        const oldMinX = scaleX.options.min
        const oldMaxX = scaleX.options.max
        const oldMinY = scaleY.options.min
        const oldMaxY = scaleY.options.max

        const wheelEv = {
          x: scaleX.getPixelForValue(1.5),
          y: scaleY.getPixelForValue(1.1),
          deltaY: 100,
        }

        triggerWheelEvent(chart, wheelEv)

        expect(scaleX.options.min).not.toEqual(oldMinX)
        expect(scaleX.options.max).not.toEqual(oldMaxX)
        expect(scaleY.options.min).toEqual(oldMinY)
        expect(scaleY.options.max).toEqual(oldMaxY)
      })
    })
  })

  describe('with scaleMode = y and mode = xy', function () {
    const config = {
      type: 'line',
      data,
      options: {
        scales: {
          x: {
            type: 'linear',
            min: 1,
            max: 10,
          },
          y: {
            type: 'linear',
          },
        },
        plugins: {
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
              },
              mode: 'xy',
              scaleMode: 'y',
            },
          },
        },
      },
    }

    describe('Wheel under Y scale', function () {
      it('should be applied on Y, but not on X scales.', function () {
        const chart = acquireChart(config)

        const scaleX = chart.scales.x
        const scaleY = chart.scales.y

        const oldMinX = scaleX.options.min
        const oldMaxX = scaleX.options.max
        const oldMinY = scaleY.options.min
        const oldMaxY = scaleY.options.max

        const wheelEv = {
          x: scaleY.left + (scaleY.right - scaleY.left) / 2,
          y: scaleY.top + (scaleY.bottom - scaleY.top) / 2,
          deltaY: 100,
        }

        triggerWheelEvent(chart, wheelEv)

        expect(scaleX.options.min).toEqual(oldMinX)
        expect(scaleX.options.max).toEqual(oldMaxX)
        expect(scaleY.options.min).not.toEqual(oldMinY)
        expect(scaleY.options.max).not.toEqual(oldMaxY)
      })
    })

    describe('Wheel not under Y scale', function () {
      it('should be applied on X and Y scales.', function () {
        const chart = acquireChart(config)

        const scaleX = chart.scales.x
        const scaleY = chart.scales.y

        const oldMinX = scaleX.options.min
        const oldMaxX = scaleX.options.max
        const oldMinY = scaleY.options.min
        const oldMaxY = scaleY.options.max

        const wheelEv = {
          x: scaleX.getPixelForValue(1.5),
          y: scaleY.getPixelForValue(1.1),
          deltaY: 100,
        }

        triggerWheelEvent(chart, wheelEv)

        expect(scaleX.options.min).not.toEqual(oldMinX)
        expect(scaleX.options.max).not.toEqual(oldMaxX)
        expect(scaleY.options.min).not.toEqual(oldMinY)
        expect(scaleY.options.max).not.toEqual(oldMaxY)
      })
    })
  })

  describe('with logarithmic scale', function () {
    it('should zoom correctly when mouse in center of chart', async function () {
      const config = {
        type: 'line',
        data: {
          datasets: [{ data: [1, 10, 100, 1000, 10000] }],
        },
        options: {
          scales: {
            y: {
              type: 'logarithmic',
            },
          },
          plugins: {
            zoom: {
              zoom: {
                mode: 'y',
                wheel: {
                  enabled: true,
                },
              },
            },
          },
        },
      }
      const chart = acquireChart(config)
      const scaleY = chart.scales.y

      const zoomIn = {
        x: Math.round(scaleY.left + (scaleY.right - scaleY.left) / 2),
        y: Math.round(scaleY.top + (scaleY.bottom - scaleY.top) / 2),
        deltaY: -100,
      }

      const zoomOut = {
        ...zoomIn,
        deltaY: 100,
      }

      expect(scaleY.min).toBe(1)
      expect(scaleY.max).toBe(10000)

      await wheelInOwnFrame(chart, zoomIn)

      expect(scaleY.min).toBeCloseTo(1.6, 1)
      expect(scaleY.max).toBeCloseTo(6310, -1)

      await wheelInOwnFrame(chart, zoomIn)

      expect(scaleY.min).toBeCloseTo(2.4, 1)
      expect(scaleY.max).toBeCloseTo(4170, -1)

      await wheelInOwnFrame(chart, zoomOut)
      await wheelInOwnFrame(chart, zoomOut)

      expect(scaleY.min).toBe(1)
      expect(scaleY.max).toBe(10000)

      chart.resetZoom()

      expect(scaleY.min).toBe(1)
      expect(scaleY.max).toBe(10000)

      await wheelInOwnFrame(chart, zoomOut)

      expect(scaleY.min).toBeCloseTo(0.6, 1)
      expect(scaleY.max).toBeCloseTo(16700, -2)

      await wheelInOwnFrame(chart, zoomIn)

      expect(scaleY.min).toBeCloseTo(1)
      expect(scaleY.max).toBeCloseTo(10000)
    })
  })

  it('should respect aspectRatio when mode = xy', function () {
    const chart = acquireChart({
      type: 'line',
      data,
      options: {
        scales: {
          x: {
            type: 'linear',
          },
          y: {
            type: 'linear',
          },
        },
        plugins: {
          legend: false,
          title: false,
          zoom: {
            zoom: {
              drag: {
                enabled: true,
                maintainAspectRatio: true,
              },
              mode: 'xy',
            },
          },
        },
      },
    })

    const scaleX = chart.scales.x
    const scaleY = chart.scales.y

    triggerMouseEvent(chart, 'mousedown', {
      x: scaleX.getPixelForValue(1.5),
      y: scaleY.getPixelForValue(1.1),
    })
    triggerMouseEvent(chart, 'mouseup', {
      x: scaleX.getPixelForValue(2.8),
      y: scaleY.getPixelForValue(1.7),
    })

    expect(scaleX.options.min).toBeCloseTo(1.5)
    expect(scaleX.options.max).toBeCloseTo(2.1)
    expect(scaleY.options.min).toBeCloseTo(1.1)
    expect(scaleY.options.max).toBeCloseTo(1.7)
  })

  describe('scrolled distance', function () {
    // The x range left after one wheel event on a fresh chart.
    function rangeAfterWheel(init) {
      const chart = acquireChart({
        type: 'line',
        data,
        options: {
          scales: { x: { type: 'linear', min: 0, max: 100 }, y: { type: 'linear' } },
          plugins: { zoom: { zoom: { wheel: { enabled: true }, mode: 'x' } } },
        },
      })
      const { x, y } = chart.scales
      triggerWheelEvent(chart, { x: x.getPixelForValue(50), y: y.getPixelForValue(1.5), ...init })
      return x.options.max - x.options.min
    }

    // With the default speed of 0.1 a full notch takes a tenth off the range.
    const LINES = 1
    const PAGES = 2

    it('should zoom by the full speed for a notch reported in pixels', function () {
      expect(rangeAfterWheel({ deltaY: -100 })).toBeCloseTo(90)
    })

    it('should zoom less for a shorter distance', function () {
      expect(rangeAfterWheel({ deltaY: -12 })).toBeCloseTo(95)
    })

    it('should zoom by the full speed for a notch reported in lines', function () {
      expect(rangeAfterWheel({ deltaY: -3, deltaMode: LINES })).toBeCloseTo(90)
    })

    it('should treat a line as 16 pixels', function () {
      expect(rangeAfterWheel({ deltaY: -0.75, deltaMode: LINES })).toBeCloseTo(rangeAfterWheel({ deltaY: -12 }))
    })

    it('should zoom by the full speed for a notch reported in pages', function () {
      expect(rangeAfterWheel({ deltaY: -1, deltaMode: PAGES })).toBeCloseTo(90)
    })

    it('should zoom out for a positive distance in any unit', function () {
      expect(rangeAfterWheel({ deltaY: 3, deltaMode: LINES })).toBeCloseTo(rangeAfterWheel({ deltaY: 100 }))
      expect(rangeAfterWheel({ deltaY: 100 })).toBeGreaterThan(100)
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
                wheel: {
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
      const wheelEv = {
        x: chart.scales.x.getPixelForValue(1.5),
        y: chart.scales.y.getPixelForValue(1.1),
        deltaY: 100,
      }

      triggerWheelEvent(chart, wheelEv)

      expect(startSpy).toHaveBeenCalled()
      expect(zoomSpy).toHaveBeenCalledWith({ chart, trigger: 'wheel' })
      expect(chart.scales.x.min).not.toBe(1)

      // onZoomComplete is debounced.
      await vi.waitFor(() => expect(completeSpy).toHaveBeenCalled())
    })

    it('should detect configuration change', function () {
      const startSpy = vi.fn()
      const chart = acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              zoom: {
                wheel: {
                  enabled: false,
                },
                mode: 'xy',
                onZoomStart: startSpy,
              },
            },
          },
        },
      })
      const wheelEv = {
        x: chart.scales.x.getPixelForValue(1.5),
        y: chart.scales.y.getPixelForValue(1.1),
        deltaY: 100,
      }
      triggerWheelEvent(chart, wheelEv)
      expect(startSpy).not.toHaveBeenCalled()
      expect(chart.scales.x.min).toBe(1)

      chart.options.plugins.zoom.zoom.wheel.enabled = true
      chart.update()

      triggerWheelEvent(chart, wheelEv)
      expect(startSpy).toHaveBeenCalled()
      expect(chart.scales.x.min).not.toBe(1)
    })

    it('should call onZoomRejected when onZoomStart returns false', function () {
      const rejectSpy = vi.fn()
      const chart = acquireChart({
        type: 'scatter',
        data,
        options: {
          plugins: {
            zoom: {
              zoom: {
                wheel: {
                  enabled: true,
                },
                mode: 'xy',
                onZoomStart: () => false,
                onZoomRejected: rejectSpy,
              },
            },
          },
        },
      })
      const wheelEv = {
        x: chart.scales.x.getPixelForValue(1.5),
        y: chart.scales.y.getPixelForValue(1.1),
        deltaY: 100,
      }
      triggerWheelEvent(chart, wheelEv)
      expect(rejectSpy).toHaveBeenCalled()
      expect(chart.scales.x.min).toBe(1)
    })
  })

  describe('events that arrive faster than frames', function () {
    function createChart(onZoom) {
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
          plugins: { zoom: { zoom: { wheel: { enabled: true }, mode: 'x', onZoom } } },
        },
      })
    }

    function wheelAtCenter(chart, deltaY) {
      const { left, right, top, bottom } = chart.scales.x
      triggerWheelEvent(chart, { x: (left + right) / 2, y: (top + bottom) / 2 - 20, deltaY })
    }

    it('should zoom for the first event at once', function () {
      const onZoom = vi.fn()
      const chart = createChart(onZoom)

      wheelAtCenter(chart, -100)

      expect(chart.scales.x.max - chart.scales.x.min).toBeCloseTo(90, 10)
      expect(onZoom).toHaveBeenCalledTimes(1)
    })

    it('should apply the events of one frame together in the next frame', async function () {
      const onZoom = vi.fn()
      const chart = createChart(onZoom)

      for (let i = 0; i < 4; i++) {
        wheelAtCenter(chart, -100)
      }

      // Only the first one has zoomed.
      expect(chart.scales.x.max - chart.scales.x.min).toBeCloseTo(90, 10)
      expect(onZoom).toHaveBeenCalledTimes(1)

      await nextFrame()

      // Four steps that each leave 90% of the range.
      expect(chart.scales.x.max - chart.scales.x.min).toBeCloseTo(100 * 0.9 ** 4, 10)
      expect(onZoom).toHaveBeenCalledTimes(2)
    })

    it('should end up where zooming for each event would', async function () {
      const steps = [-100, -6, 12, -100, 3]
      const reference = createChart()
      for (const deltaY of steps) {
        wheelAtCenter(reference, deltaY)
        await nextFrame()
      }

      const chart = createChart()
      for (const deltaY of steps) {
        wheelAtCenter(chart, deltaY)
      }
      await nextFrame()

      expect(chart.scales.x.min).toBeCloseTo(reference.scales.x.min, 8)
      expect(chart.scales.x.max).toBeCloseTo(reference.scales.x.max, 8)
    })

    it('should zoom at once again after a frame without events', async function () {
      const chart = createChart()
      wheelAtCenter(chart, -100)
      await nextFrame()

      wheelAtCenter(chart, -100)

      expect(chart.scales.x.max - chart.scales.x.min).toBeCloseTo(81, 10)
    })

    it('should drop what is waiting when the wheel is turned off', async function () {
      const chart = createChart()
      wheelAtCenter(chart, -100)
      wheelAtCenter(chart, -100)

      chart.options.plugins.zoom.zoom.wheel.enabled = false
      chart.update()
      await nextFrame()

      expect(chart.scales.x.max - chart.scales.x.min).toBeCloseTo(90, 10)
    })

    it('should drop what is waiting when the chart is destroyed', async function () {
      const onZoom = vi.fn()
      const chart = createChart(onZoom)
      wheelAtCenter(chart, -100)
      wheelAtCenter(chart, -100)

      chart.destroy()
      await nextFrame()

      expect(onZoom).toHaveBeenCalledTimes(1)
    })
  })
})
