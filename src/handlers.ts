import { directionEnabled, debounce, keyNotPressed, getModifierKey, keyPressed } from './utils'
import { zoom, zoomRect } from './core'
import { getRelativePosition, _isPointInArea } from 'chart.js/helpers'
import { getState, type HandlerFunctions, type HandlerName } from './state'
import type { Chart, ChartArea, Point } from 'chart.js'
import type { ModeOption, ZoomOptions, ZoomPluginOptions } from './options'

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
    chart.draw();
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
  chart.draw();
}

function getPointPosition(event: MouseEvent, chart: Chart) {
  if (event.target !== chart.canvas) {
    const canvasArea = chart.canvas.getBoundingClientRect()
    return {
      x: event.clientX - canvasArea.left,
      y: event.clientY - canvasArea.top,
    }
  }
  return getRelativePosition(event, chart as any) // TODO: would expect Chart type to be valid for getRelativePosition
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
    const point = getRelativePosition(event, chart as any) // TODO: would expect Chart type to be valid for getRelativePosition
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
    chart.draw();
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

export function wheel(chart: Chart, event: WheelEvent & { target?: HTMLCanvasElement }) {
  const {
    handlers: { onZoomComplete },
    options: { zoom: zoomOptions = {} },
  } = getState(chart)

  if (!wheelPreconditions(chart, event, zoomOptions)) {
    return
  }

  const rect = event.target?.getBoundingClientRect()
  const speed = zoomOptions?.wheel?.speed ?? 0.1
  const percentage = event.deltaY >= 0 ? 2 - 1 / (1 - speed) : 1 + speed
  const amount = {
    x: percentage,
    y: percentage,
    focalPoint: {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    },
  }

  zoom(chart, amount, 'zoom', 'wheel')

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
  removeHandler(chart, 'mousedown')
  removeHandler(chart, 'mousemove')
  removeHandler(chart, 'mouseup')
  removeHandler(chart, 'wheel')
  removeHandler(chart, 'click')
  removeHandler(chart, 'keydown')
}
