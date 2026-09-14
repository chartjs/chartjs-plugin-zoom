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
  ctx.beginPath()
  ctx.fillStyle = dragOptions.backgroundColor || 'rgba(225,225,225,0.3)'
  ctx.fillRect(left, top, width, height)

  if (dragOptions.borderWidth) {
    ctx.lineWidth = dragOptions.borderWidth
    ctx.strokeStyle = dragOptions.borderColor || 'rgba(225,225,225)'
    ctx.strokeRect(left, top, width, height)
  }
  ctx.restore()
}

const bindApi = (chart: Chart) => {
  chart.pan = (delta, panScales, transition) => pan(chart, delta, panScales, transition, "api")
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
