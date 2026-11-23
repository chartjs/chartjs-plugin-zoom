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
export type ScaleRange<T = number> = { min: T; max: T }
/**
 * A value `zoomScale` accepts as an end of its range: anything the scale
 * parses, like a Date or a date string on a time scale, or a label on a
 * category scale.
 */
export type ScaleValue = number | string | Date
export type DistributiveArray<T> = [T] extends [unknown] ? Array<T> : never
