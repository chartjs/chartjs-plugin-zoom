import type { Point } from 'chart.js'

export type ZoomAmount = number | (Partial<Point> & { focalPoint?: Point })
export type PanAmount = number | Partial<Point>
export type ScaleRange = { min: number; max: number }
export type DistributiveArray<T> = [T] extends [unknown] ? Array<T> : never
