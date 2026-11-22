import { directionEnabled, debounce, keyNotPressed, getModifierKey, keyPressed } from './utils'
import { zoom, zoomRect } from './core'
import { getRelativePosition, _isPointInArea, requestAnimFrame } from 'chart.js/helpers'
import { getState, type HandlerFunctions, type HandlerName, type State, type WheelZoom } from './state'
import type { Chart, ChartArea } from 'chart.js'
import type { ModeOption, ZoomOptions, ZoomPluginOptions } from './options'
import type { Point } from './types'

const clamp = (x: number, from: number, to: number): number => Math.min(to, Math.max(from, x))

function removeHandler(chart: Chart, type: HandlerName) {
  const { handlers, targets } = getState(chart)
  const handler = handlers[type]
  const target = targets[type]
  if (handler && target) {
    target.removeEventListener(type, handler)
    delete handlers[type]
  }
}

type EventHandler<T extends Event> = (chart: Chart, event: T, options: ZoomPluginOptions) => void

function addHandler<T extends Event>(
  chart: Chart,
  target: HTMLCanvasElement | Document,
  type: HandlerName,
  handler: EventHandler<T>
) {
  const { handlers, options, targets } = getState(chart)
  const oldHandler = handlers[type]
  if (oldHandler && targets[type] === target) {
    // already attached
    return
  }
  removeHandler(chart, type)
  const listener = (handlers[type] = (event) => handler(chart, event as T, options))
  targets[type] = target

  // `passive: false` for wheel events, to prevent chrome warnings. Use default value for other events.
  const passive = type === 'wheel' ? false : undefined
  target.addEventListener(type, listener, { passive })
}

export function mouseMove(chart: Chart, event: MouseEvent) {
  const state = getState(chart)
  if (state.dragStart) {
    state.dragging = true
    state.dragEnd = event
    chart.draw()
  }
}

function keyDown(chart: Chart, event: KeyboardEvent) {
  const state = getState(chart)
  if (!state.dragStart || event.key !== 'Escape') {
    return
  }

  removeHandler(chart, 'keydown')
  state.dragging = false
  state.dragStart = state.dragEnd = undefined
  chart.draw()
}

function getPointPosition(event: MouseEvent, chart: Chart) {
  if (event.target !== chart.canvas) {
    const canvasArea = chart.canvas.getBoundingClientRect()
    return {
      x: event.clientX - canvasArea.left,
      y: event.clientY - canvasArea.top,
    }
  }
  return getRelativePosition(event, chart)
}

function zoomStart(chart: Chart, event: MouseEvent, zoomOptions: ZoomOptions): boolean | void {
  const { onZoomStart, onZoomRejected } = zoomOptions
  if (onZoomStart) {
    const point = getPointPosition(event, chart)
    if (onZoomStart?.({ chart, event, point }) === false) {
      onZoomRejected?.({ chart, event })
      return false
    }
  }
}

export function mouseDown(chart: Chart, event: MouseEvent): void {
  if (chart.legend) {
    const point = getRelativePosition(event, chart)
    if (_isPointInArea(point, chart.legend)) {
      return
    }
  }
  const state = getState(chart)
  const { pan: panOptions, zoom: zoomOptions = {} } = state.options
  if (
    event.button !== 0 ||
    keyPressed(getModifierKey(panOptions), event) ||
    keyNotPressed(getModifierKey(zoomOptions.drag), event)
  ) {
    return zoomOptions.onZoomRejected?.({ chart, event })
  }

  if (zoomStart(chart, event, zoomOptions) === false) {
    return
  }
  state.dragStart = event

  addHandler(chart, chart.canvas.ownerDocument, 'mousemove', mouseMove)
  addHandler(chart, window.document, 'keydown', keyDown)
}

function applyAspectRatio(
  { begin, end }: { begin: { x: number; y: number }; end: { x: number; y: number } },
  aspectRatio: number
) {
  let width = end.x - begin.x
  let height = end.y - begin.y
  const ratio = Math.abs(width / height)

  if (ratio > aspectRatio) {
    width = Math.sign(width) * Math.abs(height * aspectRatio)
  } else if (ratio < aspectRatio) {
    height = Math.sign(height) * Math.abs(width / aspectRatio)
  }

  end.x = begin.x + width
  end.y = begin.y + height
}

type Rect = { top?: number; left?: number; right?: number; bottom?: number }
function applyMinMaxProps(
  rect: Rect,
  chartArea: ChartArea,
  points: { begin: Point; end: Point },
  { min, max, prop }: { min: keyof Rect; max: keyof Rect; prop: 'x' | 'y' }
) {
  rect[min] = clamp(Math.min(points.begin[prop], points.end[prop]), chartArea[min], chartArea[max])
  rect[max] = clamp(Math.max(points.begin[prop], points.end[prop]), chartArea[min], chartArea[max])
}

function getRelativePoints(
  chart: Chart,
  pointEvents: { dragStart: MouseEvent; dragEnd: MouseEvent },
  maintainAspectRatio?: boolean
) {
  const points = {
    begin: getPointPosition(pointEvents.dragStart, chart),
    end: getPointPosition(pointEvents.dragEnd, chart),
  }

  if (maintainAspectRatio) {
    const aspectRatio = chart.chartArea.width / chart.chartArea.height
    applyAspectRatio(points, aspectRatio)
  }

  return points
}

export function computeDragRect(
  chart: Chart,
  mode: ModeOption | undefined,
  pointEvents: { dragStart: MouseEvent; dragEnd: MouseEvent },
  maintainAspectRatio: boolean | undefined
) {
  const xEnabled = directionEnabled(mode, 'x', chart)
  const yEnabled = directionEnabled(mode, 'y', chart)
  const { top, left, right, bottom, width: chartWidth, height: chartHeight } = chart.chartArea
  const rect = { top, left, right, bottom }

  const points = getRelativePoints(chart, pointEvents, maintainAspectRatio && xEnabled && yEnabled)

  if (xEnabled) {
    applyMinMaxProps(rect, chart.chartArea, points, { min: 'left', max: 'right', prop: 'x' })
  }

  if (yEnabled) {
    applyMinMaxProps(rect, chart.chartArea, points, { min: 'top', max: 'bottom', prop: 'y' })
  }

  const width = rect.right - rect.left
  const height = rect.bottom - rect.top

  return {
    ...rect,
    width,
    height,
    zoomX: xEnabled && width ? 1 + (chartWidth - width) / chartWidth : 1,
    zoomY: yEnabled && height ? 1 + (chartHeight - height) / chartHeight : 1,
  }
}

export function mouseUp(chart: Chart, event: MouseEvent) {
  const state = getState(chart)
  if (!state.dragStart) {
    return
  }

  removeHandler(chart, 'mousemove')
  const { mode, onZoomComplete, drag } = state.options.zoom ?? {}
  const { threshold = 0, maintainAspectRatio } = drag ?? {}
  const rect = computeDragRect(chart, mode, { dragStart: state.dragStart, dragEnd: event }, maintainAspectRatio)
  const distanceX = directionEnabled(mode, 'x', chart) ? rect.width : 0
  const distanceY = directionEnabled(mode, 'y', chart) ? rect.height : 0
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

  // Remove drag start and end before chart render to stop drawing selected area
  state.dragStart = state.dragEnd = undefined

  if (distance <= threshold) {
    state.dragging = false
    chart.draw()
    return
  }

  zoomRect(chart, { x: rect.left, y: rect.top }, { x: rect.right, y: rect.bottom }, 'zoom', 'drag')

  state.dragging = false
  state.filterNextClick = true
  onZoomComplete?.({ chart })
}

function wheelPreconditions(chart: Chart, event: WheelEvent, zoomOptions: ZoomOptions): true | void {
  // Before preventDefault, check if the modifier key required and pressed
  if (keyNotPressed(getModifierKey(zoomOptions.wheel), event)) {
    zoomOptions.onZoomRejected?.({ chart, event })
    return
  }

  if (zoomStart(chart, event, zoomOptions) === false) {
    return
  }

  // Prevent the event from triggering the default behavior (e.g. content scrolling).
  if (event.cancelable) {
    event.preventDefault()
  }

  // Firefox always fires the wheel event twice:
  // First without the delta and right after that once with the delta properties.
  if (event.deltaY === undefined) {
    return
  }
  return true
}

// Scrolled distance that zooms by the full `speed`, which is about what one notch of a
// physical mouse wheel reports. Longer distances are capped to it, so that a single
// event cannot zoom the chart away.
const MAX_DELTA = 24

// What a browser calls a line when it reports the wheel in lines instead of pixels.
const LINE_HEIGHT = 16

/**
 * The scrolled distance in pixels. `deltaY` is in the unit `deltaMode` names: Firefox can
 * report a wheel notch as 3 lines where Chrome reports 100 pixels, and read as pixels
 * those 3 lines would zoom by an eighth of a notch.
 */
function wheelDistance(event: WheelEvent, pageHeight: number): number {
  switch (event.deltaMode) {
    case WheelEvent.DOM_DELTA_LINE:
      return event.deltaY * LINE_HEIGHT
    case WheelEvent.DOM_DELTA_PAGE:
      return event.deltaY * pageHeight
    default:
      return event.deltaY
  }
}

// A zoom by `a` leaves `2 - a` of the range, so two zooms in a row leave the
// product of what each leaves.
const combineZoom = (a: number, b: number) => 2 - (2 - a) * (2 - b)

function cancelWheelFrame(state: State) {
  if (state.wheelFrame !== undefined) {
    cancelAnimationFrame(state.wheelFrame)
  }
  state.wheelFrame = state.wheelZoom = undefined
}

// Zooms, and requests a frame in which to zoom by what the wheel events until
// then add up to. As long as there is something to do in that frame, the next
// one is requested as well, so that a steady stream of events gives one chart
// update per frame.
function zoomByWheel(chart: Chart, state: State, amount: WheelZoom) {
  zoom(chart, amount, 'zoom', 'wheel')
  // Where there is no window, the helper calls back at once and returns
  // nothing, so every event zooms right away.
  state.wheelFrame = requestAnimFrame(() => {
    const pending = state.wheelZoom
    state.wheelFrame = state.wheelZoom = undefined
    if (pending) {
      zoomByWheel(chart, state, pending)
    }
  })
}

/**
 * A touchpad sends wheel events faster than a large chart can update. Updating
 * for each of them makes the events queue up behind the updates, and the chart
 * falls further and further behind the gesture.
 *
 * The first event zooms right away. The ones that follow before the next frame
 * are added up and applied together in that frame.
 */
function queueWheelZoom(chart: Chart, state: State, amount: WheelZoom) {
  if (state.wheelFrame === undefined) {
    zoomByWheel(chart, state, amount)
    return
  }
  const pending = state.wheelZoom
  state.wheelZoom = pending
    ? { x: combineZoom(pending.x, amount.x), y: combineZoom(pending.y, amount.y), focalPoint: amount.focalPoint }
    : amount
}

export function wheel(chart: Chart, event: WheelEvent & { target?: HTMLCanvasElement }) {
  const state = getState(chart)
  const {
    handlers: { onZoomComplete },
    options: { zoom: zoomOptions = {} },
  } = state

  if (!wheelPreconditions(chart, event, zoomOptions)) {
    return
  }

  const rect = event.target?.getBoundingClientRect()
  const distance = wheelDistance(event, rect.height)
  const delta = Math.sign(distance) * Math.min(MAX_DELTA, Math.abs(distance))
  const speed = (zoomOptions?.wheel?.speed ?? 0.1) * (Math.abs(delta) / MAX_DELTA)
  const percentage = delta >= 0 ? 2 - 1 / (1 - speed) : 1 + speed
  const amount = {
    x: percentage,
    y: percentage,
    focalPoint: {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    },
  }

  queueWheelZoom(chart, state, amount)

  onZoomComplete?.(event)
}

function addDebouncedHandler(
  chart: Chart,
  name: HandlerName,
  handler: HandlerFunctions['onZoomComplete'] | undefined,
  delay: number
) {
  if (handler) {
    getState(chart).handlers[name] = debounce(() => handler?.({ chart }), delay)
  }
}

export function addListeners(chart: Chart, options: ZoomPluginOptions) {
  const canvas = chart.canvas
  const { wheel: wheelOptions, drag: dragOptions, onZoomComplete } = options.zoom ?? {}

  // Install listeners. Do this dynamically based on options so that we can turn zoom on and off
  // We also want to make sure listeners aren't always on. E.g. if you're scrolling down a page
  // and the mouse goes over a chart you don't want it intercepted unless the plugin is enabled
  if (wheelOptions?.enabled) {
    addHandler(chart, canvas, 'wheel', wheel)
    addDebouncedHandler(chart, 'onZoomComplete', onZoomComplete, 250)
  } else {
    cancelWheelFrame(getState(chart))
    removeHandler(chart, 'wheel')
  }
  if (dragOptions?.enabled) {
    addHandler(chart, canvas, 'mousedown', mouseDown)
    addHandler(chart, canvas.ownerDocument, 'mouseup', mouseUp)
  } else {
    removeHandler(chart, 'mousedown')
    removeHandler(chart, 'mousemove')
    removeHandler(chart, 'mouseup')
    removeHandler(chart, 'keydown')
  }
}

export function removeListeners(chart: Chart) {
  cancelWheelFrame(getState(chart))
  removeHandler(chart, 'mousedown')
  removeHandler(chart, 'mousemove')
  removeHandler(chart, 'mouseup')
  removeHandler(chart, 'wheel')
  removeHandler(chart, 'click')
  removeHandler(chart, 'keydown')
}
