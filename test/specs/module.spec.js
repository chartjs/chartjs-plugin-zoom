import { Chart } from 'chart.js'
import ChartZoom from '../../src/index.umd'

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
