/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
import plugin from './plugin'

import type { ZoomPluginOptions } from './options'
import type { ScaleRange } from './state'
import type { DistributiveArray, PanAmount, Point, ZoomAmount } from './types.js'
import type { ChartType, ChartTypeRegistry, Scale, UpdateMode } from 'chart.js'

declare module 'chart.js' {
  interface PluginOptionsByType<TType extends ChartType> {
    zoom: ZoomPluginOptions
  }

  // eslint-disable-next-line no-shadow
  enum UpdateModeEnum {
    zoom = 'zoom',
  }

  interface Chart<
    TType extends ChartType = keyof ChartTypeRegistry,
    TData = DistributiveArray<ChartTypeRegistry[TType]['defaultDataPoint']>,
    TLabel = unknown,
  > {
    pan(pan: PanAmount, scales?: Scale[], mode?: UpdateMode): void
    zoom(zoom: ZoomAmount, mode?: UpdateMode): void
    zoomRect(p0: Point, p1: Point, mode?: UpdateMode): void
    zoomScale(id: string, range: ScaleRange, mode?: UpdateMode): void
    resetZoom(mode?: UpdateMode): void
    getZoomLevel(): number
    getInitialScaleBounds(): Record<string, { min?: number; max?: number }>
    getZoomedScaleBounds(): Record<string, ScaleRange | undefined>
    isZoomedOrPanned(): boolean
    isZoomingOrPanning(): boolean
  }
}

export default plugin
export {
  pan,
  zoom,
  zoomRect,
  zoomScale,
  resetZoom,
  getZoomLevel,
  getInitialScaleBounds,
  getZoomedScaleBounds,
  isZoomedOrPanned,
  isZoomingOrPanning,
} from './core'

export type { GestureEvent } from './gestures'
export type {
  DragOptions,
  DrawTime,
  LimitOptions,
  Mode,
  ModeFn,
  ModeOption,
  ModifierKey,
  PanOptions,
  PinchOptions,
  ScaleLimits,
  WheelOptions,
  ZoomOptions,
  ZoomPluginOptions,
  ZoomTrigger,
} from './options'
export type { PanFunction, ZoomFunction, ZoomRectFunction } from './scale.types'
export type { PanAmount, Point, ScaleRange, ZoomAmount } from './types'
