import { almostEquals, isNullOrUndef, isNumber, valueOrDefault } from 'chart.js/helpers'
import { getState, type ScaleRange, type State } from './state'
import type { Point, Scale, TimeScale, TimeUnit } from 'chart.js'
import type { LimitOptions, ScaleLimits } from './options'

export type ZoomFunction = (scale: Scale, zoom: number, center: Point, limits: LimitOptions) => boolean
export type ZoomRectFunction = (scale: Scale, from: number, to: number, limits: LimitOptions) => boolean
export type PanFunction = (scale: Scale, delta: number, limits: LimitOptions) => boolean

const isTimeScale = (scale: Scale): scale is TimeScale => scale.type === 'time'

const isNotNumber = (value?: number): value is undefined => value === undefined || isNaN(value)

export function zoomDelta(
  val: number | undefined,
  min: number | undefined,
  range: number,
  newRange: number
): ScaleRange {
  const minPercent = range && isNumber(val) && isNumber(min) ? Math.max(0, Math.min(1, (val - min) / range)) : 0
  const maxPercent = 1 - minPercent

  return {
    min: newRange * minPercent,
    max: newRange * maxPercent,
  }
}

function getValueAtPoint(scale: Scale, point: Point): number | undefined {
  const pixel = scale.isHorizontal() ? point.x : point.y

  return scale.getValueForPixel(pixel)
}

function linearZoomDelta(scale: Scale, zoom: number, center: Point): ScaleRange {
  const range = scale.max - scale.min
  const newRange = range * (zoom - 1)
  const centerValue = getValueAtPoint(scale, center)

  return zoomDelta(centerValue, scale.min, range, newRange)
}

function logarithmicZoomRange(scale: Scale, zoom: number, center: Point) {
  const centerValue = getValueAtPoint(scale, center)

  // Return the original range, if value could not be determined.
  if (centerValue === undefined) {
    return { min: scale.min, max: scale.max }
  }

  const logMin = Math.log10(scale.min)
  const logMax = Math.log10(scale.max)
  const logCenter = Math.log10(centerValue)
  const logRange = logMax - logMin
  const newLogRange = logRange * (zoom - 1)
  const delta = zoomDelta(logCenter, logMin, logRange, newLogRange)

  return {
    min: Math.pow(10, logMin + delta.min),
    max: Math.pow(10, logMax - delta.max),
  }
}

function getScaleLimits(scale: Scale, limits?: LimitOptions): ScaleLimits {
  return limits?.[scale.id] || limits?.[scale.axis] || {}
}

function getLimit(state: State, scale: Scale, scaleLimits: ScaleLimits, prop: 'min' | 'max', fallback: number): number {
  let limit = scaleLimits[prop]
  if (limit === 'original') {
    const original = state.originalScaleLimits[scale.id][prop]
    if (isNumber(original.options)) {
      return original.options
    }

    if (!isNullOrUndef(original.options)) {
      const parsed = scale.parse(original.options)
      if (isNumber(parsed)) {
        return parsed
      }
    }

    limit = original.scale
  }
  return valueOrDefault(limit, fallback)
}

function linearRange(scale: Scale, pixel0: number, pixel1: number): ScaleRange {
  const v0 = scale.getValueForPixel(pixel0) ?? scale.min
  const v1 = scale.getValueForPixel(pixel1) ?? scale.max
  return {
    min: Math.min(v0, v1),
    max: Math.max(v0, v1),
  }
}

function fixRange(
  range: number,
  { min, max, minLimit, maxLimit }: { min: number; max: number; minLimit: number; maxLimit: number },
  state: State,
  scale: Scale
) {
  const offset = (range - max + min) / 2
  min -= offset
  max += offset

  // In case the values are really close to the original values, use the original values.
  const origLimits: ScaleLimits = { min: 'original', max: 'original' }
  const origMin = getLimit(state, scale, origLimits, 'min', -Infinity)
  const origMax = getLimit(state, scale, origLimits, 'max', Infinity)

  const epsilon = range / 1e6
  if (almostEquals(min, origMin, epsilon)) {
    min = origMin
  }
  if (almostEquals(max, origMax, epsilon)) {
    max = origMax
  }

  // Apply limits
  if (min < minLimit) {
    min = minLimit
    max = Math.min(minLimit + range, maxLimit)
  } else if (max > maxLimit) {
    max = maxLimit
    min = Math.max(maxLimit - range, minLimit)
  }

  return { min, max }
}

export function updateRange(
  scale: Scale,
  { min, max }: ScaleRange,
  limits?: LimitOptions,
  zoom = false,
  pan = false
): boolean {
  const state = getState(scale.chart)
  const { options: scaleOpts } = scale

  const scaleLimits = getScaleLimits(scale, limits)
  const { minRange = 0 } = scaleLimits
  const minLimit = getLimit(state, scale, scaleLimits, 'min', -Infinity)
  const maxLimit = getLimit(state, scale, scaleLimits, 'max', Infinity)

  if (pan && (min < minLimit || max > maxLimit)) {
    // At limit: No change but return true to indicate no need to store the delta.
    return true
  }

  const scaleRange = scale.max - scale.min
  const range = zoom ? Math.max(max - min, minRange) : scaleRange

  if (zoom && range === minRange && scaleRange <= minRange) {
    // At range limit: No change but return true to indicate no need to store the delta.
    return true
  }

  const newRange = fixRange(range, { min, max, minLimit, maxLimit }, state, scale)

  scaleOpts.min = newRange.min
  scaleOpts.max = newRange.max

  state.updatedScaleLimits[scale.id] = newRange

  // return true if the scale range is changed
  return scale.parse(newRange.min) !== scale.min || scale.parse(newRange.max) !== scale.max
}

function zoomNumericalScale(scale: Scale, zoom: number, center: Point, limits: LimitOptions) {
  const delta = linearZoomDelta(scale, zoom, center)
  const newRange = { min: scale.min + delta.min, max: scale.max - delta.max }
  return updateRange(scale, newRange, limits, true)
}

function zoomLogarithmicScale(scale: Scale, zoom: number, center: Point, limits: LimitOptions) {
  const newRange = logarithmicZoomRange(scale, zoom, center)
  return updateRange(scale, newRange, limits, true)
}

function zoomRectNumericalScale(scale: Scale, from: number, to: number, limits: LimitOptions) {
  return updateRange(scale, linearRange(scale, from, to), limits, true)
}

const integerChange = (v: number) =>
  v === 0 || isNaN(v) ? 0 : v < 0 ? Math.min(Math.round(v), -1) : Math.max(Math.round(v), 1)

function existCategoryFromMaxZoom(scale: Scale) {
  const labels = scale.getLabels()
  const maxIndex = labels.length - 1

  if (scale.min > 0) {
    scale.min -= 1
  }
  if (scale.max < maxIndex) {
    scale.max += 1
  }
}

function zoomCategoryScale(scale: Scale, zoom: number, center: Point, limits: LimitOptions) {
  const delta = linearZoomDelta(scale, zoom, center)
  if (scale.min === scale.max && zoom < 1) {
    existCategoryFromMaxZoom(scale)
  }
  const newRange = { min: scale.min + integerChange(delta.min), max: scale.max - integerChange(delta.max) }

  return updateRange(scale, newRange, limits, true)
}

function scaleLength(scale: Scale) {
  return scale.isHorizontal() ? scale.width : scale.height
}

function panCategoryScale(scale: Scale, delta: number, limits: LimitOptions) {
  const labels = scale.getLabels()
  const lastLabelIndex = labels.length - 1
  let { min, max } = scale
  // The visible range. Ticks can be skipped, and thus not reliable.
  const range = Math.max(max - min, 1)
  // How many pixels of delta is required before making a step. stepSize, but limited to max 1/10 of the scale length.
  const stepDelta = Math.round(scaleLength(scale) / Math.max(range, 10))
  const stepSize = Math.round(Math.abs(delta / stepDelta))
  let applied
  if (delta < -stepDelta) {
    max = Math.min(max + stepSize, lastLabelIndex)
    min = range === 1 ? max : max - range
    applied = max === lastLabelIndex
  } else if (delta > stepDelta) {
    min = Math.max(0, min - stepSize)
    max = range === 1 ? min : min + range
    applied = min === 0
  }

  return updateRange(scale, { min, max }, limits) || Boolean(applied)
}

const OFFSETS: Record<TimeUnit, number> = {
  millisecond: 0,
  second: 500, // 500 ms
  minute: 30 * 1000, // 30 s
  hour: 30 * 60 * 1000, // 30 m
  day: 12 * 60 * 60 * 1000, // 12 h
  week: 3.5 * 24 * 60 * 60 * 1000, // 3.5 d
  month: 15 * 24 * 60 * 60 * 1000, // 15 d
  quarter: 60 * 24 * 60 * 60 * 1000, // 60 d
  year: 182 * 24 * 60 * 60 * 1000, // 182 d
}

function panNumericalScale(scale: Scale, delta: number, limits: LimitOptions, canZoom = false) {
  const { min: prevStart, max: prevEnd } = scale
  let offset = 0
  if (isTimeScale(scale)) {
    const round = scale.options.time?.round
    offset = round ? OFFSETS[round] : 0
  }
  const newMin = scale.getValueForPixel(scale.getPixelForValue(prevStart + offset) - delta)
  const newMax = scale.getValueForPixel(scale.getPixelForValue(prevEnd + offset) - delta)
  if (isNotNumber(newMin) || isNotNumber(newMax)) {
    // NaN can happen for 0-dimension scales (either because they were configured
    // with min === max or because the chart has 0 plottable area).
    return true
  }
  return updateRange(scale, { min: newMin, max: newMax }, limits, canZoom, true)
}

function panNonLinearScale(scale: Scale, delta: number, limits: LimitOptions) {
  return panNumericalScale(scale, delta, limits, true)
}

export const zoomFunctions: Record<string, ZoomFunction> = {
  category: zoomCategoryScale,
  default: zoomNumericalScale,
  logarithmic: zoomLogarithmicScale,
}

export const zoomRectFunctions: Record<string, ZoomRectFunction> = {
  default: zoomRectNumericalScale,
}

export const panFunctions: Record<string, PanFunction> = {
  category: panCategoryScale,
  default: panNumericalScale,
  logarithmic: panNonLinearScale,
  timeseries: panNonLinearScale,
}
