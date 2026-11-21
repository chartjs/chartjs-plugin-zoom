/**
 * A position in canvas pixels.
 *
 * Chart.js 4.5 widened its own `Point` to `{ x: number | null; y: number | null }`
 * so that it can also describe a gap in a dataset. Everything this plugin
 * measures or moves -- a zoom centre, a drag corner, a pan delta -- is a real
 * coordinate, so the geometry here keeps its own non-nullable type rather than
 * null checking values that are never null.
 */
export type Point = { x: number; y: number }

export type ZoomAmount = number | (Partial<Point> & { focalPoint?: Point })
export type PanAmount = number | Partial<Point>
export type ScaleRange = { min: number; max: number }

/** The zoom factors a zoom was asked for, as the `onZoom` callback gets them. */
export type ZoomFactors = { x: number; y: number; focalPoint: Point }

/** The ranges of the scales a zoom or pan acted on, by scale id, as they are after it. */
export type ScaleRanges = Record<string, ScaleRange>
export type DistributiveArray<T> = [T] extends [unknown] ? Array<T> : never
