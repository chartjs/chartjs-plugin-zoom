/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
import plugin from './plugin'

import type { ZoomPluginOptions } from './options'
import type { ScaleRange } from './state'
import type { DistributiveArray, PanAmount, ZoomAmount } from './types.js'
import type { ChartType, ChartTypeRegistry, Point, Scale, UpdateMode } from 'chart.js'

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
    getZoomedScaleBounds(): Record<string, Partial<ScaleRange>>
    isZoomedOrPanned(): boolean
    isZoomingOrPanning(): boolean
  }
}

export default plugin
export { pan, zoom, zoomRect, zoomScale, resetZoom } from './core'
