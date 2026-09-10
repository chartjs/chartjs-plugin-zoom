import { getRelativePosition } from 'chart.js/helpers'
import Hammer from 'hammerjs'
import { pan, zoom } from './core'
import { getState, type State } from './state'
import { directionEnabled, getEnabledScalesByPoint, getModifierKey, keyNotPressed, keyPressed } from './utils'
import type { Chart } from 'chart.js'
import type { ZoomPluginOptions } from './options'

function createEnabler(chart: Chart, state: State) {
  return function (_recognizer: any, event: HammerInput) {
    const { pan: panOptions, zoom: zoomOptions = {} } = state.options
    if (!panOptions || !panOptions.enabled) {
      return false
    }
    const srcEvent = event && event.srcEvent
    if (!srcEvent) {
      // Sometimes Hammer queries this with a null event.
      return true
    }
    if (
      !state.panning &&
      event.pointerType === 'mouse' &&
      (keyNotPressed(getModifierKey(panOptions), srcEvent) || keyPressed(getModifierKey(zoomOptions.drag), srcEvent))
    ) {
      panOptions.onPanRejected?.({ chart, event })
      return false
    }
    return true
  }
}

function pinchAxes(p0: { clientX: number; clientY: number }, p1: { clientX: number; clientY: number }) {
  // fingers position difference
  const pinchX = Math.abs(p0.clientX - p1.clientX)
  const pinchY = Math.abs(p0.clientY - p1.clientY)

  // diagonal fingers will change both (xy) axes
  const p = pinchX / pinchY
  let x, y
  if (p > 0.3 && p < 1.7) {
    x = y = true
  } else if (pinchX > pinchY) {
    x = true
  } else {
    y = true
  }
  return { x, y }
}

function handlePinch(chart: Chart, state: State, e: HammerInput) {
  if (state.scale) {
    const { center, pointers } = e
    // Hammer reports the total scaling. We need the incremental amount
    const zoomPercent = (1 / state.scale) * e.scale
    const rect = e.target.getBoundingClientRect()
    const pinch = pinchAxes(pointers[0], pointers[1])
    const mode = state.options.zoom?.mode
    const amount = {
      x: pinch.x && directionEnabled(mode, 'x', chart) ? zoomPercent : 1,
      y: pinch.y && directionEnabled(mode, 'y', chart) ? zoomPercent : 1,
      focalPoint: {
        x: center.x - rect.left,
        y: center.y - rect.top,
      },
    }

    zoom(chart, amount, 'zoom', 'pinch')

    // Keep track of overall scale
    state.scale = e.scale
  }
}

function startPinch(chart: Chart, state: State, e: HammerInput) {
  if (state.options.zoom?.pinch?.enabled) {
    const point = getRelativePosition(e.srcEvent, chart)
    if (state.options.zoom?.onZoomStart?.({ chart, event: e.srcEvent, point }) === false) {
      state.scale = null
      state.options.zoom?.onZoomRejected?.({ chart, event: e.srcEvent })
    } else {
      state.scale = 1
    }
  }
}

function endPinch(chart: Chart, state: State, e: HammerInput) {
  if (state.scale) {
    handlePinch(chart, state, e)
    state.scale = null // reset
    state.options.zoom?.onZoomComplete?.({ chart })
  }
}

function handlePan(chart: Chart, state: State, e: HammerInput) {
  const delta = state.delta
  if (delta) {
    state.panning = true
    pan(
      chart,
      { x: e.deltaX - delta.x, y: e.deltaY - delta.y },
      state.panScales && state.panScales.map((i) => chart.scales[i]).filter(Boolean)
    )
    state.delta = { x: e.deltaX, y: e.deltaY }
  }
}

function startPan(chart: Chart, state: State, event: HammerInput) {
  const { enabled, onPanStart, onPanRejected } = state.options.pan ?? {}
  if (!enabled) {
    return
  }
  const rect = event.target.getBoundingClientRect()
  const point = {
    x: event.center.x - rect.left,
    y: event.center.y - rect.top,
  }

  if (onPanStart?.({ chart, event, point }) === false) {
    return onPanRejected?.({ chart, event })
  }

  state.panScales = getEnabledScalesByPoint(state.options.pan, point, chart).map((i) => i.id)
  state.delta = { x: 0, y: 0 }
  handlePan(chart, state, event)
}

function endPan(chart: Chart, state: State) {
  state.delta = null
  if (state.panning) {
    state.panning = false
    state.filterNextClick = true
    state.options.pan?.onPanComplete?.({ chart })
  }
}

const hammers = new WeakMap()
export function startHammer(chart: Chart, options: ZoomPluginOptions) {
  const state = getState(chart)
  const canvas = chart.canvas
  const { pan: panOptions, zoom: zoomOptions } = options

  const mc = new Hammer.Manager(canvas)
  if (zoomOptions?.pinch?.enabled) {
    mc.add(new Hammer.Pinch())
    mc.on('pinchstart', (e) => startPinch(chart, state, e))
    mc.on('pinch', (e) => handlePinch(chart, state, e))
    mc.on('pinchend', (e) => endPinch(chart, state, e))
  }

  if (panOptions && panOptions.enabled) {
    mc.add(
      new Hammer.Pan({
        threshold: panOptions.threshold,
        enable: createEnabler(chart, state),
      })
    )
    mc.on('panstart', (e) => startPan(chart, state, e))
    mc.on('panmove', (e) => handlePan(chart, state, e))
    mc.on('panend', () => endPan(chart, state))
  }

  hammers.set(chart, mc)
}

export function stopHammer(chart: Chart) {
  const mc = hammers.get(chart)
  if (mc) {
    mc.remove('pinchstart')
    mc.remove('pinch')
    mc.remove('pinchend')
    mc.remove('panstart')
    mc.remove('pan')
    mc.remove('panend')
    mc.destroy()
    hammers.delete(chart)
  }
}

export function hammerOptionsChanged(oldOptions: ZoomPluginOptions, newOptions: ZoomPluginOptions) {
  const { pan: oldPan, zoom: oldZoom } = oldOptions
  const { pan: newPan, zoom: newZoom } = newOptions

  if (oldZoom?.pinch?.enabled !== newZoom?.pinch?.enabled) {
    return true
  }
  if (oldPan?.enabled !== newPan?.enabled) {
    return true
  }
  if (oldPan?.threshold !== newPan?.threshold) {
    return true
  }

  return false
}
