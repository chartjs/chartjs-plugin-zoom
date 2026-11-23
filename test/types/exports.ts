import { Chart } from 'chart.js'
import Zoom, {
  getInitialScaleBounds,
  getZoomedScaleBounds,
  getZoomLevel,
  isZoomedOrPanned,
  isZoomingOrPanning,
  pan,
  resetZoom,
  zoom,
  zoomRect,
  zoomScale,
} from '../../src'

Chart.register(Zoom)
Chart.unregister(Zoom)

const chart = new Chart('id', {
  type: 'bar',
  data: {
    labels: [],
    datasets: [
      {
        data: [],
      },
    ],
  },
  options: {
    plugins: {
      zoom: {
        limits: {
          x: {
            min: 1,
            max: 2,
            minRange: 1,
          },
          y: {
            min: 1,
            max: 2,
            minRange: 1,
          },
          y2: {
            min: 10,
            max: 20,
            minRange: 5,
          },
        },
        pan: {
          enabled: true,
          mode: 'x',
          onPanStart({ event }) {
            return event.distance > 2
          },
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          mode: 'x',
        },
      },
    },
  },
  plugins: [Zoom],
})

chart.resetZoom()
chart.zoom(1.1)
chart.zoom({ x: 1, y: 1.1, focalPoint: { x: 10, y: 10 } }, 'zoom')

chart.pan(10)
chart.pan({ x: 10, y: 20 }, [chart.scales.x])

pan(chart, -42, undefined, 'zoom')
zoom(chart, { x: 1, y: 1.1, focalPoint: { x: 10, y: 10 } }, 'zoom')
resetZoom(chart, 'none')
zoomRect(chart, { x: 0, y: 0 }, { x: 10, y: 10 }, 'none')
zoomScale(chart, 'x', { min: 0, max: 1 }, 'none')
zoomScale(chart, 'x', { min: new Date(0), max: '1970-01-02' })

const level: number = getZoomLevel(chart)
const initialBounds: Record<string, { min?: number; max?: number }> = getInitialScaleBounds(chart)
const zoomedBounds = getZoomedScaleBounds(chart)
const zoomed: boolean = isZoomedOrPanned(chart)
const zooming: boolean = isZoomingOrPanning(chart)

export { initialBounds, level, zoomed, zoomedBounds, zooming }
