// Checks the declarations as published: this imports the package by name, which
// resolves through package.json "exports" to the bundled dist/index.d.ts, so it
// needs `npm run build` first. exports.ts covers the sources.
import { Chart } from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import type {
  DragOptions,
  DrawTime,
  GenericEvent,
  GestureEvent,
  LimitOptions,
  Mode,
  ModeFn,
  ModeOption,
  ModifierKey,
  PanAmount,
  PanFunction,
  PanOptions,
  PinchOptions,
  Point,
  RejectableStartEvent,
  RejectEvent,
  ScaleLimits,
  ScaleRange,
  ScaleValue,
  WheelOptions,
  ZoomAmount,
  ZoomFunction,
  ZoomOptions,
  ZoomPluginOptions,
  ZoomRectFunction,
  ZoomTrigger,
} from 'chartjs-plugin-zoom'

const point: Point = { x: 1, y: 2 }
const range: ScaleRange = { min: 0, max: 1 }
const panAmount: PanAmount = { x: 10 }
const zoomAmount: ZoomAmount = { x: 1.1, focalPoint: point }

const mode: Mode = 'xy'
const modeFn: ModeFn = () => mode
const modeOption: ModeOption = modeFn
const modifierKey: ModifierKey = 'ctrl'
const drawTime: DrawTime = 'beforeDatasetsDraw'
const trigger: ZoomTrigger = 'wheel'

const onComplete: GenericEvent = ({ chart }) => chart.update()
const onRejected: RejectEvent<GestureEvent> = ({ event }) => event.center
const onStart: RejectableStartEvent<Event> = ({ point }) => point.x > 0

const wheel: WheelOptions = { enabled: true, modifierKey }
const drag: DragOptions = { enabled: true, drawTime }
const pinch: PinchOptions = { enabled: true }
const zoom: ZoomOptions = { wheel, drag, pinch, mode: modeOption }
const pan: PanOptions = {
  enabled: true,
  onPanStart: ({ event }: { event: GestureEvent }) => event.pointerType === 'touch',
}
const scaleLimits: ScaleLimits = { min: 0, max: 'original', minRange: 1 }
const limits: LimitOptions = { x: scaleLimits }
const options: ZoomPluginOptions = { pan, zoom, limits }

const zoomFunction: ZoomFunction = () => false
const zoomRectFunction: ZoomRectFunction = () => false
const panFunction: PanFunction = () => false
zoomPlugin.zoomFunctions.custom = zoomFunction
zoomPlugin.zoomRectFunctions.custom = zoomRectFunction
zoomPlugin.panFunctions.custom = panFunction

// The methods the plugin adds to a chart.
const chart = new Chart('id', { type: 'line', data: { datasets: [] }, options: { plugins: { zoom: options } } })
chart.pan(panAmount, [chart.scales.x], 'none')
chart.zoom(zoomAmount, 'zoom')
chart.zoomRect(point, point, 'none')
chart.zoomScale('x', range, 'default')
const dates: ScaleRange<ScaleValue> = { min: new Date(0), max: '1970-01-02' }
chart.zoomScale('x', dates)
chart.resetZoom('none')
const level: number = chart.getZoomLevel()
const initialBounds: Record<string, { min?: number; max?: number }> = chart.getInitialScaleBounds()
const zoomedBounds: Record<string, ScaleRange | undefined> = chart.getZoomedScaleBounds()
const zoomed: boolean = chart.isZoomedOrPanned()
const zooming: boolean = chart.isZoomingOrPanning()

// A scale that has not been zoomed has no entry, so this must not compile.
// @ts-expect-error -- 'zoomedBounds.x' is possibly 'undefined'
zoomedBounds.x.min.toFixed()

export { initialBounds, level, trigger, zoomed, zooming }
