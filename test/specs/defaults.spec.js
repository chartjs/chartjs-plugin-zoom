import { Chart } from 'chart.js'
import { acquireChart } from 'chartjs-test-utils'

describe('defaults', function () {
  const expected = {
    pan: {
      enabled: false,
      mode: 'xy',
      threshold: 10,
      modifierKey: null,
      button: 'left',
    },
    zoom: {
      wheel: {
        enabled: false,
        speed: 0.1,
        modifierKey: null,
      },
      drag: {
        enabled: false,
        drawTime: 'beforeDatasetsDraw',
        modifierKey: null,
      },
      pinch: {
        enabled: false,
      },
      mode: 'xy',
    },
  }

  it('should be registered as global plugin options', function () {
    expect(Chart.defaults.plugins.zoom).toEqual(expected)
  })

  it('should be called with default options', function () {
    const plugin = Chart.registry.getPlugin('zoom')
    const spy = vi.spyOn(plugin, 'beforeUpdate')

    const chart = acquireChart({
      type: 'line',
      data: {
        datasets: [
          {
            data: [],
          },
        ],
      },
    })

    expect(spy).toHaveBeenCalledWith(chart, { cancelable: true, mode: undefined }, expected)
  })

  it('should warn about the removed zoom.enabled option', function () {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    acquireChart({
      type: 'line',
      data: { datasets: [{ data: [] }] },
      options: { plugins: { zoom: { zoom: { enabled: true } } } },
    })

    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('zoom.enabled'))
  })

  it('should not warn without the removed option', function () {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    acquireChart({
      type: 'line',
      data: { datasets: [{ data: [] }] },
      options: { plugins: { zoom: { zoom: { wheel: { enabled: true } } } } },
    })

    expect(warn).not.toHaveBeenCalled()
  })
})
