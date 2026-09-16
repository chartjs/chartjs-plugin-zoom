import { getRelativePosition } from 'chart.js/helpers'
import { pan, zoom } from './core'
import { getState, type State } from './state'
import { directionEnabled, getEnabledScalesByPoint, getModifierKey, keyNotPressed, keyPressed } from './utils'
import type { Chart } from 'chart.js'
import type { ZoomPluginOptions } from './options'

/**
 * Normalized gesture event handed to the pan/zoom callbacks. Replaces the
 * former Hammer.js event object; it carries only the fields the plugin
 * consumes, all derived from native `PointerEvent`s.
 */
export interface GestureEvent {
  /** Gesture centroid in client coordinates (midpoint of the active pointers). */
  center: { x: number; y: number }
  /** Cumulative pan offset in pixels since the gesture started. */
  deltaX: number
  deltaY: number
  /** Straight-line distance the gesture has travelled since it started, in pixels. */
  distance: number
  /** Cumulative pinch scale relative to the gesture start (1 = unchanged). */
  scale: number
  /** The active pointers, in client coordinates. */
  pointers: { clientX: number; clientY: number }[]
  /** The canvas the gesture is bound to. */
  target: HTMLElement
  /** The native pointer event that produced this gesture event. */
  srcEvent: PointerEvent
  /** Pointer device type: `mouse`, `touch` or `pen`. */
  pointerType: string
}

// Hammer's Pan recognizer only fires once the pointer has moved this far, so we
// keep the same default when the option is left unset.
const DEFAULT_PAN_THRESHOLD = 10

function distance(a: { clientX: number; clientY: number }, b: { clientX: number; clientY: number }) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
}

function createEnabler(chart: Chart, state: State) {
  return function (event: GestureEvent) {
    const { pan: panOptions, zoom: zoomOptions = {} } = state.options
    if (!panOptions || !panOptions.enabled) {
      return false
    }
    const srcEvent = event && event.srcEvent
    if (!srcEvent) {
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

function handlePinch(chart: Chart, state: State, e: GestureEvent) {
  if (state.scale) {
    const { center, pointers } = e
    // The event reports the total scaling. We need the incremental amount.
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

function startPinch(chart: Chart, state: State, e: GestureEvent) {
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

function endPinch(chart: Chart, state: State, e: GestureEvent) {
  if (state.scale) {
    handlePinch(chart, state, e)
    state.scale = null // reset
    state.options.zoom?.onZoomComplete?.({ chart })
  }
}

function handlePan(chart: Chart, state: State, e: GestureEvent) {
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

function startPan(chart: Chart, state: State, event: GestureEvent) {
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

type ActivePointer = { clientX: number; clientY: number }

function pointerFrom(event: PointerEvent): ActivePointer {
  return { clientX: event.clientX, clientY: event.clientY }
}

// Tracks the native pointers on a single canvas and translates them into the
// pan/pinch gestures the plugin previously received from Hammer.js.
class GestureManager {
  private readonly chart: Chart
  private readonly state: State
  private readonly canvas: HTMLCanvasElement
  private readonly doc: Document
  private readonly enabler: (event: GestureEvent) => boolean
  private readonly previousTouchAction: string
  private readonly previousUserSelect: string

  private readonly pointers = new Map<number, ActivePointer>()

  // Set while a pan could still happen; `state.delta` marks a recognized one.
  private panStart: { x: number; y: number } | null = null

  private pinchStartDistance: number | null = null

  constructor(chart: Chart) {
    this.chart = chart
    this.state = getState(chart)
    this.canvas = chart.canvas
    this.doc = this.canvas.ownerDocument
    this.enabler = createEnabler(chart, this.state)

    // Suppress the browser's own scroll/zoom so gestures reach the canvas,
    // mirroring what Hammer configured on its manager.
    this.previousTouchAction = this.canvas.style.touchAction
    this.canvas.style.touchAction = 'none'

    // Stop a drag from selecting text or other page content, as Hammer did
    // while a manager was active.
    this.previousUserSelect = this.canvas.style.userSelect
    this.canvas.style.userSelect = 'none'
    this.canvas.style.setProperty('-webkit-user-select', 'none')

    this.canvas.addEventListener('pointerdown', this.onPointerDown)
    this.doc.addEventListener('pointermove', this.onPointerMove)
    this.doc.addEventListener('pointerup', this.onPointerUp)
    this.doc.addEventListener('pointercancel', this.onPointerCancel)
  }

  destroy() {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown)
    this.doc.removeEventListener('pointermove', this.onPointerMove)
    this.doc.removeEventListener('pointerup', this.onPointerUp)
    this.doc.removeEventListener('pointercancel', this.onPointerCancel)
    this.canvas.style.touchAction = this.previousTouchAction
    this.canvas.style.userSelect = this.previousUserSelect
    this.canvas.style.removeProperty('-webkit-user-select')
    this.abortGesture()
  }

  // Drops a gesture without committing it. Unlike endPan/endPinch this fires no
  // completion callback, and it clears the state the manager keeps in `state`:
  // a leaked `delta` would let the next gesture resume this one, and a leaked
  // `panning` would keep swallowing the chart's events.
  private abortGesture() {
    this.pointers.clear()
    this.panStart = null
    this.pinchStartDistance = null
    this.state.delta = null
    this.state.scale = null
    this.state.panning = false
  }

  private pointerList() {
    return Array.from(this.pointers.values())
  }

  private buildEvent(srcEvent: PointerEvent): GestureEvent {
    const pointers = this.pointerList()
    const count = pointers.length || 1
    const center = pointers.reduce((acc, p) => ({ x: acc.x + p.clientX / count, y: acc.y + p.clientY / count }), {
      x: 0,
      y: 0,
    })
    const deltaX = this.panStart ? center.x - this.panStart.x : 0
    const deltaY = this.panStart ? center.y - this.panStart.y : 0
    const scale =
      this.pinchStartDistance && pointers.length >= 2 ? distance(pointers[0], pointers[1]) / this.pinchStartDistance : 1
    return {
      center,
      deltaX,
      deltaY,
      distance: Math.hypot(deltaX, deltaY),
      scale,
      pointers,
      target: this.canvas,
      srcEvent,
      pointerType: srcEvent.pointerType,
    }
  }

  private onPointerDown = (event: PointerEvent) => {
    // Hammer's mouse input only started a gesture on the primary button.
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return
    }
    // At most two pointers take part in a gesture. Extra ones are never tracked
    // so they cannot skew the centroid or end an ongoing pinch when lifted.
    if (this.pointers.size >= 2) {
      return
    }
    this.pointers.set(event.pointerId, pointerFrom(event))

    const { pan: panOptions, zoom: zoomOptions } = this.state.options

    if (this.pointers.size > 1) {
      // A second pointer always ends a pan, whether or not it starts a pinch:
      // the centroid would otherwise jump when either pointer is lifted.
      endPan(this.chart, this.state)
      this.panStart = null

      if (zoomOptions?.pinch?.enabled) {
        const pts = this.pointerList()
        this.pinchStartDistance = distance(pts[0], pts[1])
        startPinch(this.chart, this.state, this.buildEvent(event))
      }
    } else if (panOptions?.enabled) {
      // Begin tracking a possible pan; it is only recognized once it passes
      // the threshold (see onPointerMove).
      this.panStart = { x: event.clientX, y: event.clientY }
    }
  }

  private onPointerMove = (event: PointerEvent) => {
    if (!this.pointers.has(event.pointerId)) {
      return
    }
    this.pointers.set(event.pointerId, pointerFrom(event))

    if (this.pinchStartDistance !== null && this.pointers.size > 1) {
      handlePinch(this.chart, this.state, this.buildEvent(event))
      return
    }

    if (this.panStart && this.pointers.size === 1) {
      const gesture = this.buildEvent(event)
      if (this.state.delta) {
        handlePan(this.chart, this.state, gesture)
      } else if (gesture.distance >= this.panThreshold() && this.enabler(gesture)) {
        startPan(this.chart, this.state, gesture)
        if (!this.state.delta) {
          // onPanStart rejected the pan; don't offer it again this gesture.
          this.panStart = null
        }
      }
    }
  }

  private onPointerUp = (event: PointerEvent) => {
    if (!this.pointers.has(event.pointerId)) {
      return
    }
    // Record the pointer's final position before removing it so the closing
    // gesture event is built from an accurate centroid.
    this.pointers.set(event.pointerId, pointerFrom(event))

    if (this.pinchStartDistance !== null && this.pointers.size > 1) {
      endPinch(this.chart, this.state, this.buildEvent(event))
      this.pinchStartDistance = null
    }

    this.pointers.delete(event.pointerId)

    if (this.pointers.size === 0) {
      endPan(this.chart, this.state)
      this.panStart = null
      this.pinchStartDistance = null
    } else {
      // One pointer is left, either from a pinch or from a pan that the lifted
      // pointer ended: let it start a fresh pan from where it is now.
      const remaining = this.pointerList()[0]
      this.panStart = this.state.options.pan?.enabled ? { x: remaining.clientX, y: remaining.clientY } : null
    }
  }

  private onPointerCancel = (event: PointerEvent) => {
    if (this.pointers.has(event.pointerId)) {
      this.abortGesture()
    }
  }

  private panThreshold() {
    return this.state.options.pan?.threshold ?? DEFAULT_PAN_THRESHOLD
  }
}

const managers = new WeakMap<Chart, GestureManager>()

export function startGestures(chart: Chart, options: ZoomPluginOptions) {
  const { pan: panOptions, zoom: zoomOptions } = options
  if (!panOptions?.enabled && !zoomOptions?.pinch?.enabled) {
    return
  }
  managers.set(chart, new GestureManager(chart))
}

export function stopGestures(chart: Chart) {
  const manager = managers.get(chart)
  if (manager) {
    manager.destroy()
    managers.delete(chart)
  }
}

export function gestureOptionsChanged(oldOptions: ZoomPluginOptions, newOptions: ZoomPluginOptions) {
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
