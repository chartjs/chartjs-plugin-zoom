import { Chart, Scale, type Point } from 'chart.js'
import type { ZoomPluginOptions } from './options'

export type ScaleRange = { min: number; max: number }
export type OriginalLimits = { min: { scale?: number; options?: unknown }; max: { scale?: number; options?: unknown } }
export type OriginalScaleLimits = Record<string, OriginalLimits>
export type UpdatedScaleLimits = Record<string, ScaleRange>

export type HandlerFunctions = {
  click: (chart: Chart, event: MouseEvent, options: ZoomPluginOptions) => void
  keydown: (chart: Chart, event: KeyboardEvent) => void
  mousedown: (chart: Chart, event: MouseEvent, options: ZoomPluginOptions) => void
  mousemove: (chart: Chart, event: MouseEvent, options: ZoomPluginOptions) => void
  mouseup: (chart: Chart, event: MouseEvent, options: ZoomPluginOptions) => void
  onZoomComplete: ({ chart }: { chart: Chart }) => void
  wheel: (chart: Chart, event: WheelEvent) => void
}
export type HandlerName = keyof HandlerFunctions
export type HandlerFunction = HandlerFunctions[HandlerName]
export type Handler = EventListener
export type Handlers = Partial<Record<HandlerName, Handler>>

export type HandlerTarget = Partial<Record<HandlerName, HTMLCanvasElement | Document>>

export interface State {
  originalScaleLimits: OriginalScaleLimits
  updatedScaleLimits: UpdatedScaleLimits
  handlers: Handlers
  targets: HandlerTarget
  panDelta: Record<string, number>
  dragging: boolean
  panning: boolean
  options: ZoomPluginOptions
  dragStart?: MouseEvent
  dragEnd?: MouseEvent
  filterNextClick?: boolean
  scale?: number | null
  delta?: Point | null
  panScales?: Scale[]
}

const chartStates = new WeakMap<Chart, State>()

export function getState(chart: Chart): State {
  let state = chartStates.get(chart)
  if (!state) {
    state = {
      originalScaleLimits: {},
      updatedScaleLimits: {},
      handlers: {},
      options: {},
      targets: {},
      panDelta: {},
      dragging: false,
      panning: false,
    }
    chartStates.set(chart, state)
  }
  return state
}

export function removeState(chart: Chart) {
  chartStates.delete(chart)
}
