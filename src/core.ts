import { isNumber, sign } from 'chart.js/helpers'
import { panFunctions, updateRange, zoomFunctions, zoomRectFunctions } from './scale.types.js'
import { getState, type OriginalScaleLimits, type ScaleRange, type State, type UpdatedScaleLimits } from './state.js'
import { directionEnabled, getEnabledScalesByPoint } from './utils.js'
import type { Chart, Point, Scale, UpdateMode } from 'chart.js'
import type { LimitOptions, PanTrigger, ZoomTrigger } from './options.js'
import type { ZoomAmount } from './types.js'

function shouldUpdateScaleLimits(
  scale: Scale,
  originalScaleLimits: OriginalScaleLimits,
  updatedScaleLimits: UpdatedScaleLimits
) {
  const {
    id,
    options: { min, max },
  } = scale
  if (!originalScaleLimits[id] || !updatedScaleLimits[id]) {
    return true
  }
  const previous = updatedScaleLimits[id]
  return previous.min !== min || previous.max !== max
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

  for (const scale of enabledScales) {
    if (scale.isHorizontal() && xEnabled) {
      doZoom(scale, x, focalPoint, limits)
    } else if (!scale.isHorizontal() && yEnabled) {
      doZoom(scale, y, focalPoint, limits)
    }
  }

  chart.update(transition)

  zoomOptions?.onZoom?.({ chart, trigger, amount: { x, y, focalPoint } })
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

  for (const scale of Object.values(chart.scales)) {
    if (scale.isHorizontal() && xEnabled) {
      doZoomRect(scale, p0.x, p1.x, limits)
    } else if (!scale.isHorizontal() && yEnabled) {
      doZoomRect(scale, p0.y, p1.y, limits)
    }
  }

  chart.update(transition)

  zoomOptions.onZoom?.({ chart, trigger })
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
  chart.update(transition)

  state.options.zoom?.onZoom?.({ chart, trigger })
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
  chart.update(transition)

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
    const origRange = getOriginalRange(state, scale.id)
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

type PanAmount = number | Partial<Point>

export function pan(chart: Chart, delta: PanAmount, enabledScales?: Scale[], transition: UpdateMode = 'none', trigger: PanTrigger = "other") {
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

  for (const scale of scales) {
    if (scale.isHorizontal() && xEnabled) {
      panScale(scale, x, limits, state)
    } else if (!scale.isHorizontal() && yEnabled) {
      panScale(scale, y, limits, state)
    }
  }

  chart.update(transition)

  onPan?.({ chart, trigger, delta: { x, y } })
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
  const scaleBounds: Record<string, { min?: number; max?: number }> = {}
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
