import { isNullOrUndef, isNumber, sign } from 'chart.js/helpers'
import { panFunctions, updateRange, zoomFunctions, zoomRectFunctions } from './scale.types.js'
import { getState, type OriginalScaleLimits, type State, type UpdatedScaleLimits } from './state.js'
import { directionEnabled, getEnabledScalesByPoint } from './utils.js'
import type { Chart, Scale, UpdateMode } from 'chart.js'
import type { LimitOptions, PanTrigger, ZoomTrigger } from './options.js'
import type { PanAmount, Point, ScaleRange, ScaleRanges, ZoomAmount } from './types.js'

// The plugin zooms a scale by writing the range to its options. Bounds that
// differ from what it wrote were set by the application since, and are taken
// as the new original.
function isPinned(scale: Scale, zoomed: ScaleRange) {
  const { min, max } = scale.options
  return min === zoomed.min && max === zoomed.max
}

function shouldUpdateScaleLimits(
  scale: Scale,
  originalScaleLimits: OriginalScaleLimits,
  updatedScaleLimits: UpdatedScaleLimits
) {
  const { id } = scale
  if (!originalScaleLimits[id]) {
    return true
  }
  // What is stored for a scale that is not zoomed stays: its current range may
  // be fitted to the data another zoomed scale leaves in view, and is then not
  // the range to go back to.
  return !!updatedScaleLimits[id] && !isPinned(scale, updatedScaleLimits[id])
}

function removeMissingScales(limits: OriginalScaleLimits | UpdatedScaleLimits, scales: Record<string, Scale>) {
  for (const key of Object.keys(limits)) {
    if (!scales[key]) {
      delete limits[key]
    }
  }
}

function storeOriginalScaleLimits(chart: Chart, state: State) {
  const { scales } = chart
  const { originalScaleLimits, updatedScaleLimits } = state

  for (const scale of Object.values(scales)) {
    if (shouldUpdateScaleLimits(scale, originalScaleLimits, updatedScaleLimits)) {
      originalScaleLimits[scale.id] = {
        min: { scale: scale.min, options: scale.options.min },
        max: { scale: scale.max, options: scale.options.max },
      }
    }
  }

  removeMissingScales(originalScaleLimits, scales)
  removeMissingScales(updatedScaleLimits, scales)
  return originalScaleLimits
}

// The plugin's own updates are marked to keep refreshOriginalScaleLimits from
// repeating its work on every step of a pan. Data the application changed
// without updating the chart is therefore only taken into account by its own
// next update.
function update(chart: Chart, state: State, transition: UpdateMode) {
  state.updating = true
  try {
    chart.update(transition)
  } finally {
    state.updating = false
  }
}

// A scale reads its `min` and `max` options in `init`, and `init` replaces
// `scale.options`, so the options are looked up again for every write. The
// chart options go along as they do when the chart calls `init`: a time scale
// takes `normalized` and its adapter's options from them.
function setUserBounds(scale: Scale, min: unknown, max: unknown) {
  const options = scale.options as { min?: unknown; max?: unknown }
  options.min = min
  options.max = max
  const init = scale.init as (scaleOptions: unknown, chartOptions: unknown) => void
  init.call(scale, scale.options, scale.chart.options)
}

const hasBothBounds = (min: unknown, max: unknown) => !isNullOrUndef(min) && !isNullOrUndef(max)

// A scale that is not zoomed has the options the application gave it. If it
// derives a bound from the data, it fits the data the zoomed scales leave in
// view, so its original range needs computing. With both bounds in the options
// there is nothing to compute, and its range is stored when next needed.
function resetOriginalToOptions(scale: Scale, originalScaleLimits: OriginalScaleLimits) {
  const { min, max } = scale.options
  if (hasBothBounds(min, max)) {
    delete originalScaleLimits[scale.id]
  } else {
    originalScaleLimits[scale.id] = { min: { options: min }, max: { options: max } }
  }
}

function computeOriginalRanges(state: State, pinned: Scale[], stale: Scale[]) {
  const { originalScaleLimits, updatedScaleLimits } = state

  for (const scale of pinned) {
    const { min, max } = originalScaleLimits[scale.id]
    setUserBounds(scale, min.options, max.options)
  }
  for (const scale of stale) {
    const original = originalScaleLimits[scale.id]
    scale.beforeLayout?.()
    scale.update(scale.maxWidth, scale.maxHeight)
    original.min.scale = scale.min
    original.max.scale = scale.max
  }
  for (const scale of pinned) {
    const { min, max } = updatedScaleLimits[scale.id]
    setUserBounds(scale, min, max)
  }
}

/**
 * A zoomed scale has its range pinned through its `min` and `max` options, so
 * it no longer follows the data. The range it would have without the zoom is
 * still what the `'original'` limits, the zoom level and a reset refer to, and
 * that range changes when the data does.
 *
 * This runs right before a layout: it lets the scales compute their range once
 * with the options they had before the zoom, and keeps the result. The layout
 * that follows computes the scales again with the zoomed range.
 *
 * A bound the options gave does not depend on the data, so a scale with both
 * of them has nothing to compute. Its zoom is still lifted for the others,
 * because a scale only looks at the data inside the bounds of the scale across
 * it. For the same reason a scale that is not zoomed is computed as well.
 */
export function refreshOriginalScaleLimits(chart: Chart) {
  const state = getState(chart)
  if (state.updating) {
    return
  }

  const { originalScaleLimits, updatedScaleLimits } = state
  const scales = Object.values(chart.scales)
  const pinned = scales.filter((scale) => {
    const zoomed = updatedScaleLimits[scale.id]
    return originalScaleLimits[scale.id] && zoomed && isPinned(scale, zoomed)
  })
  if (!pinned.length) {
    // Every scale shows its original range. A copy of it would only go stale,
    // and is stored again when it is next needed.
    state.originalScaleLimits = {}
    return
  }

  for (const scale of scales) {
    if (!pinned.includes(scale)) {
      resetOriginalToOptions(scale, originalScaleLimits)
    }
  }

  const stale = scales.filter((scale) => {
    const original = originalScaleLimits[scale.id]
    return original && !hasBothBounds(original.min.options, original.max.options)
  })
  if (stale.length) {
    computeOriginalRanges(state, pinned, stale)
  }
}

// What a callback is told about the scales a zoom or pan acted on: the range
// each has once the chart is updated, which is the range that was asked for
// with the limits applied.
function rangesOf(chart: Chart, scaleIds: string[]): ScaleRanges {
  const ranges: ScaleRanges = {}
  for (const id of scaleIds) {
    const scale = chart.scales[id]
    if (scale) {
      ranges[id] = { min: scale.min, max: scale.max }
    }
  }
  return ranges
}

function doZoom(scale: Scale, amount: number, center: Point, limits: LimitOptions) {
  const fn = zoomFunctions[scale.type] || zoomFunctions.default
  fn?.(scale, amount, center, limits)
}

function doZoomRect(scale: Scale, from: number, to: number, limits: LimitOptions) {
  const fn = zoomRectFunctions[scale.type] || zoomRectFunctions.default
  fn?.(scale, from, to, limits)
}

function getCenter(chart: Chart) {
  const ca = chart.chartArea
  return {
    x: (ca.left + ca.right) / 2,
    y: (ca.top + ca.bottom) / 2,
  }
}

export function zoom(chart: Chart, amount: ZoomAmount, transition: UpdateMode = 'none', trigger: ZoomTrigger = 'api') {
  const { x = 1, y = 1, focalPoint = getCenter(chart) } = typeof amount === 'number' ? { x: amount, y: amount } : amount
  const state = getState(chart)
  const {
    options: { limits = {}, zoom: zoomOptions },
  } = state

  storeOriginalScaleLimits(chart, state)

  const xEnabled = x !== 1
  const yEnabled = y !== 1
  const enabledScales = getEnabledScalesByPoint(zoomOptions, focalPoint, chart)

  const zoomed: string[] = []
  for (const scale of enabledScales) {
    if (scale.isHorizontal() && xEnabled) {
      doZoom(scale, x, focalPoint, limits)
      zoomed.push(scale.id)
    } else if (!scale.isHorizontal() && yEnabled) {
      doZoom(scale, y, focalPoint, limits)
      zoomed.push(scale.id)
    }
  }

  update(chart, state, transition)

  zoomOptions?.onZoom?.({ chart, trigger, ranges: rangesOf(chart, zoomed), amount: { x, y, focalPoint } })
}

export function zoomRect(
  chart: Chart,
  p0: Point,
  p1: Point,
  transition: UpdateMode = 'none',
  trigger: ZoomTrigger = 'api'
) {
  const state = getState(chart)
  const {
    options: { limits = {}, zoom: zoomOptions = {} },
  } = state
  const { mode = 'xy' } = zoomOptions

  storeOriginalScaleLimits(chart, state)
  const xEnabled = directionEnabled(mode, 'x', chart)
  const yEnabled = directionEnabled(mode, 'y', chart)

  const zoomed: string[] = []
  for (const scale of Object.values(chart.scales)) {
    if (scale.isHorizontal() && xEnabled) {
      doZoomRect(scale, p0.x, p1.x, limits)
      zoomed.push(scale.id)
    } else if (!scale.isHorizontal() && yEnabled) {
      doZoomRect(scale, p0.y, p1.y, limits)
      zoomed.push(scale.id)
    }
  }

  update(chart, state, transition)

  zoomOptions.onZoom?.({ chart, trigger, ranges: rangesOf(chart, zoomed) })
}

export function zoomScale(
  chart: Chart,
  scaleId: string,
  range: ScaleRange,
  transition: UpdateMode = 'none',
  trigger: ZoomTrigger = 'api'
) {
  const state = getState(chart)
  storeOriginalScaleLimits(chart, state)
  const scale = chart.scales[scaleId]
  updateRange(scale, range, undefined, true)
  update(chart, state, transition)

  state.options.zoom?.onZoom?.({ chart, trigger, ranges: rangesOf(chart, [scaleId]) })
}

export function resetZoom(chart: Chart, transition: UpdateMode = 'default') {
  const state = getState(chart)
  const originalScaleLimits = storeOriginalScaleLimits(chart, state)

  for (const scale of Object.values(chart.scales)) {
    const scaleOptions = scale.options
    if (originalScaleLimits[scale.id]) {
      scaleOptions.min = originalScaleLimits[scale.id].min.options
      scaleOptions.max = originalScaleLimits[scale.id].max.options
    } else {
      delete scaleOptions.min
      delete scaleOptions.max
    }
    delete state.updatedScaleLimits[scale.id]
  }
  update(chart, state, transition)

  state.options.zoom?.onZoomComplete?.({ chart })
}

function getOriginalRange(state: State, scaleId: string): number | undefined {
  const original = state.originalScaleLimits[scaleId]
  if (!original) {
    return undefined
  }
  const { min, max } = original
  if (isNumber(max.options) && isNumber(min.options)) {
    return max.options - min.options
  }
  if (isNumber(max.scale) && isNumber(min.scale)) {
    return max.scale - min.scale
  }
  return undefined
}

export function getZoomLevel(chart: Chart) {
  const state = getState(chart)
  let min = 1
  let max = 1
  for (const scale of Object.values(chart.scales)) {
    // Only the scales that are zoomed count. Another one may show less than
    // its original range because it fits the data the zoom leaves in view.
    const origRange = state.updatedScaleLimits[scale.id] && getOriginalRange(state, scale.id)
    if (origRange) {
      const level = Math.round((origRange / (scale.max - scale.min)) * 100) / 100
      min = Math.min(min, level)
      max = Math.max(max, level)
    }
  }
  return min < 1 ? min : max
}

function panScale(scale: Scale, delta: number, limits: LimitOptions, state: State) {
  const { panDelta } = state
  // Add possible cumulative delta from previous pan attempts where scale did not change
  const storedDelta = panDelta[scale.id] || 0
  if (sign(storedDelta) === sign(delta)) {
    delta += storedDelta
  }
  const fn = panFunctions[scale.type] || panFunctions.default
  if (fn?.(scale, delta, limits)) {
    // The scale changed, reset cumulative delta
    panDelta[scale.id] = 0
  } else {
    // The scale did not change, store cumulative delta
    panDelta[scale.id] = delta
  }
}

export function pan(
  chart: Chart,
  delta: PanAmount,
  enabledScales?: Scale[],
  transition: UpdateMode = 'none',
  trigger: PanTrigger = 'api'
) {
  const { x = 0, y = 0 } = typeof delta === 'number' ? { x: delta, y: delta } : delta
  const state = getState(chart)
  const {
    options: { pan: panOptions, limits = {} },
  } = state
  const { onPan } = panOptions || {}

  storeOriginalScaleLimits(chart, state)

  const xEnabled = x !== 0
  const yEnabled = y !== 0

  const scales = enabledScales || Object.values(chart.scales)

  const panned: string[] = []
  for (const scale of scales) {
    if (scale.isHorizontal() && xEnabled) {
      panScale(scale, x, limits, state)
      panned.push(scale.id)
    } else if (!scale.isHorizontal() && yEnabled) {
      panScale(scale, y, limits, state)
      panned.push(scale.id)
    }
  }

  update(chart, state, transition)

  onPan?.({ chart, trigger, delta: { x, y }, ranges: rangesOf(chart, panned) })
}

export function getInitialScaleBounds(chart: Chart) {
  const state = getState(chart)
  storeOriginalScaleLimits(chart, state)
  const scaleBounds: Record<string, { min?: number; max?: number }> = {}
  for (const scaleId of Object.keys(chart.scales)) {
    const { min, max } = state.originalScaleLimits[scaleId] || { min: {}, max: {} }
    scaleBounds[scaleId] = { min: min.scale, max: max.scale }
  }

  return scaleBounds
}

export function getZoomedScaleBounds(chart: Chart) {
  const state = getState(chart)
  // A scale that has not been zoomed or panned has no entry.
  const scaleBounds: Record<string, ScaleRange | undefined> = {}
  for (const scaleId of Object.keys(chart.scales)) {
    scaleBounds[scaleId] = state.updatedScaleLimits[scaleId]
  }

  return scaleBounds
}

export function isZoomedOrPanned(chart: Chart) {
  const scaleBounds = getInitialScaleBounds(chart)
  for (const scaleId of Object.keys(chart.scales)) {
    const { min: originalMin, max: originalMax } = scaleBounds[scaleId]

    if (originalMin !== undefined && chart.scales[scaleId].min !== originalMin) {
      return true
    }

    if (originalMax !== undefined && chart.scales[scaleId].max !== originalMax) {
      return true
    }
  }

  return false
}

export function isZoomingOrPanningState(state: State) {
  return state.panning || state.dragging
}

export function isZoomingOrPanning(chart: Chart) {
  const state = getState(chart)
  // From the perspective of outside callers, zooming and panning are still
  // active if we haven't yet cleared the next click.
  return !!(isZoomingOrPanningState(state) || state.filterNextClick)
}

/**
 * The chart does not handle events while a pan or a drag zoom is going on, so
 * a tooltip that was showing would stay where it was, next to data that has
 * moved on, and the hovered elements would stay highlighted. They come back
 * with the next event after the gesture.
 */
export function clearHover(chart: Chart) {
  const { tooltip } = chart
  if (tooltip?.getActiveElements().length) {
    tooltip.setActiveElements([], { x: 0, y: 0 })
  }
  if (chart.getActiveElements().length) {
    chart.setActiveElements([])
  }
}
