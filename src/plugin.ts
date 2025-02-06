import Hammer from 'hammerjs'
import { addListeners, computeDragRect, removeListeners } from './handlers'
import { hammerOptionsChanged, startHammer, stopHammer } from './hammer'
import {
  pan,
  zoom,
  resetZoom,
  zoomScale,
  getZoomLevel,
  getInitialScaleBounds,
  getZoomedScaleBounds,
  isZoomedOrPanned,
  isZoomingOrPanning,
  isZoomingOrPanningState,
  zoomRect,
} from './core'
import { panFunctions, zoomFunctions, zoomRectFunctions } from './scale.types'
import { getState, removeState } from './state'
import { version } from '../package.json'
import type { Chart, ChartEvent } from 'chart.js'
import type { ZoomPluginOptions } from './options'
import { defaults } from './defaults'

function getBorderWidths(borderWidth: number | number[]): number[] {
  if (typeof borderWidth === 'number') {
    return [borderWidth, borderWidth, borderWidth, borderWidth]
  }
  const len = borderWidth.length
  if (len === 1) {
    return Array(4).fill(borderWidth[0])
  }
  if (len === 2) {
    return [borderWidth[0], borderWidth[1], borderWidth[0], borderWidth[1]]
  }
  if (len === 4) {
    return borderWidth
  }
  throw new Error('borderWidth array must have 1, 2 or 4 elements')
}

function drawBorder(
  ctx: CanvasRenderingContext2D,
  start: [number, number],
  end: [number, number],
  width: number,
  color: string
) {
  if (!width) {
    return
  }
  ctx.beginPath()
  ctx.lineWidth = width
  ctx.strokeStyle = color
  ctx.moveTo(...start)
  ctx.lineTo(...end)
  ctx.stroke()
}

function draw(chart: Chart, caller: string, options: ZoomPluginOptions) {
  const dragOptions = options.zoom?.drag
  const { dragStart, dragEnd } = getState(chart)

  if (dragOptions?.drawTime !== caller || !dragStart || !dragEnd) {
    return
  }

  const { left, top, width, height } = computeDragRect(
    chart,
    options.zoom?.mode,
    { dragStart, dragEnd },
    dragOptions.maintainAspectRatio
  )

  const ctx = chart.ctx
  ctx.save()

  ctx.fillStyle = dragOptions.backgroundColor || 'rgba(225,225,225,0.3)'
  ctx.fillRect(left, top, width, height)

  if (dragOptions.borderWidth) {
    const borderColor = dragOptions.borderColor || 'rgba(225,225,225)'
    const [topWidth, rightWidth, bottomWidth, leftWidth] = getBorderWidths(dragOptions.borderWidth)

    drawBorder(ctx, [left, top], [left + width, top], topWidth, String(borderColor))
    drawBorder(ctx, [left + width, top], [left + width, top + height], rightWidth, String(borderColor))
    drawBorder(ctx, [left + width, top + height], [left, top + height], bottomWidth, String(borderColor))
    drawBorder(ctx, [left, top + height], [left, top], leftWidth, String(borderColor))
  }

  ctx.restore()
}

const bindApi = (chart: Chart) => {
  chart.pan = (delta, panScales, transition) => pan(chart, delta, panScales, transition)
  chart.zoom = (args, transition) => zoom(chart, args, transition)
  chart.zoomRect = (p0, p1, transition) => zoomRect(chart, p0, p1, transition)
  chart.zoomScale = (id, range, transition) => zoomScale(chart, id, range, transition)
  chart.resetZoom = (transition) => resetZoom(chart, transition)
  chart.getZoomLevel = () => getZoomLevel(chart)
  chart.getInitialScaleBounds = () => getInitialScaleBounds(chart)
  chart.getZoomedScaleBounds = () => getZoomedScaleBounds(chart)
  chart.isZoomedOrPanned = () => isZoomedOrPanned(chart)
  chart.isZoomingOrPanning = () => isZoomingOrPanning(chart)
}

export default {
  id: 'zoom',

  version,

  defaults,

  start(chart: Chart, _args: unknown, options: ZoomPluginOptions) {
    const state = getState(chart)
    state.options = options

    if (Object.prototype.hasOwnProperty.call(options.zoom, 'enabled')) {
      console.warn(
        'The option `zoom.enabled` is no longer supported. Please use `zoom.wheel.enabled`, `zoom.drag.enabled`, or `zoom.pinch.enabled`.'
      )
    }
    if (
      Object.prototype.hasOwnProperty.call(options.zoom, 'overScaleMode') ||
      Object.prototype.hasOwnProperty.call(options.pan, 'overScaleMode')
    ) {
      console.warn(
        'The option `overScaleMode` is deprecated. Please use `scaleMode` instead (and update `mode` as desired).'
      )
    }

    if (Hammer) {
      startHammer(chart, options)
    }

    bindApi(chart)
  },

  beforeEvent(
    chart: Chart,
    { event }: { event: ChartEvent; replay: boolean; cancelable: true; inChartArea: boolean }
  ): boolean | void {
    const state = getState(chart)
    if (isZoomingOrPanningState(state)) {
      // cancel any event handling while panning or dragging
      return false
    }
    // cancel the next click or mouseup after drag or pan
    if (event.type === 'click' || event.type === 'mouseup') {
      if (state.filterNextClick) {
        state.filterNextClick = false
        return false
      }
    }
  },

  beforeUpdate(chart: Chart, _args: unknown, options: ZoomPluginOptions) {
    const state = getState(chart)
    const previousOptions = state.options
    state.options = options

    // Hammer needs to be restarted when certain options change.
    if (hammerOptionsChanged(previousOptions, options)) {
      stopHammer(chart)
      startHammer(chart, options)
    }

    addListeners(chart, options)
  },

  beforeDatasetsDraw(chart: Chart, _args: unknown, options: ZoomPluginOptions) {
    draw(chart, 'beforeDatasetsDraw', options)
  },

  afterDatasetsDraw(chart: Chart, _args: unknown, options: ZoomPluginOptions) {
    draw(chart, 'afterDatasetsDraw', options)
  },

  beforeDraw(chart: Chart, _args: unknown, options: ZoomPluginOptions) {
    draw(chart, 'beforeDraw', options)
  },

  afterDraw(chart: Chart, _args: unknown, options: ZoomPluginOptions) {
    draw(chart, 'afterDraw', options)
  },

  stop(chart: Chart) {
    removeListeners(chart)

    if (Hammer) {
      stopHammer(chart)
    }
    removeState(chart)
  },

  panFunctions,
  zoomFunctions,
  zoomRectFunctions,
}
