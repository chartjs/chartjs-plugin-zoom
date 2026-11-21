import { Chart } from 'chart.js'
import ChartZoom from '../../src/index.umd'
import * as entry from '../../src/index'

describe('module', function () {
  it('should export the plugin as default', function () {
    expect(typeof ChartZoom).toBe('object')
  })

  it('should be referenced with id "zoom"', function () {
    expect(ChartZoom.id).toBe('zoom')
  })

  it('should expose zoomFunctions, zoomRectFunctions, and panFunctions', function () {
    expect(ChartZoom.zoomFunctions instanceof Object).toBe(true)
    expect(ChartZoom.zoomRectFunctions instanceof Object).toBe(true)
    expect(ChartZoom.panFunctions instanceof Object).toBe(true)
  })

  it('should be globally registered', function () {
    const plugin = Chart.registry.getPlugin('zoom')
    expect(plugin).toBe(ChartZoom)
  })
})

// The module entry point, as opposed to the UMD one above.
describe('module entry', function () {
  it('should export the plugin as default', function () {
    expect(entry.default).toBe(ChartZoom)
  })

  // Each method the plugin adds to a chart is also a function taking the chart.
  it('should export exactly the plugin and the chart functions', function () {
    expect(Object.keys(entry).sort()).toEqual(
      [
        'default',
        'getInitialScaleBounds',
        'getZoomLevel',
        'getZoomedScaleBounds',
        'isZoomedOrPanned',
        'isZoomingOrPanning',
        'pan',
        'resetZoom',
        'zoom',
        'zoomRect',
        'zoomScale',
      ].sort()
    )
    for (const name of Object.keys(entry).filter((key) => key !== 'default')) {
      expect(typeof entry[name]).toBe('function')
    }
  })
})
