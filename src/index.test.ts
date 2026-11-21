import * as entry from './index.js'

describe('package entry', () => {
  it('exports the plugin as default', () => {
    expect(entry.default.id).toBe('zoom')
  })

  // Each method the plugin adds to a chart is also a function taking the chart.
  it.each([
    'pan',
    'zoom',
    'zoomRect',
    'zoomScale',
    'resetZoom',
    'getZoomLevel',
    'getInitialScaleBounds',
    'getZoomedScaleBounds',
    'isZoomedOrPanned',
    'isZoomingOrPanning',
  ] as const)('exports %s', (name) => {
    expect(typeof entry[name]).toBe('function')
  })

  it('exports nothing else', () => {
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
  })
})
