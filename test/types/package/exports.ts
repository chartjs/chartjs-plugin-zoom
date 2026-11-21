// Checks the declarations as published: this imports the package by name, which
// resolves through package.json "exports" to the bundled dist/index.d.ts, so it
// needs `npm run build` first. exports.ts covers the sources.
import zoomPlugin from 'chartjs-plugin-zoom'
import type {
  DragOptions,
  DrawTime,
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
  ScaleLimits,
  ScaleRange,
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

export { options, panAmount, range, trigger, zoomAmount }
