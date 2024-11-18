import Hammer from 'hammerjs';
import {addListeners, computeDragRect, removeListeners} from './handlers';
import {hammerOptionsChanged, startHammer, stopHammer} from './hammer';
import {pan, zoom, resetZoom, zoomScale, getZoomLevel, getInitialScaleBounds, getZoomedScaleBounds, isZoomedOrPanned, isZoomingOrPanning, zoomRect} from './core';
import {panFunctions, zoomFunctions, zoomRectFunctions} from './scale.types';
import {getState, removeState} from './state';
import {version} from '../package.json';

function draw(chart, caller, options) {
  const dragOptions = options.zoom.drag;
  const {dragStart, dragEnd} = getState(chart);

  if (dragOptions.drawTime !== caller || !dragEnd) {
    return;
  }
  const {left, top, width, height} = computeDragRect(chart, options.zoom.mode, {dragStart, dragEnd}, dragOptions.maintainAspectRatio);
  const ctx = chart.ctx;

  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = dragOptions.backgroundColor || 'rgba(225,225,225,0.3)';
  ctx.fillRect(left, top, width, height);

  if (dragOptions.borderWidth > 0) {
    ctx.lineWidth = dragOptions.borderWidth;
    ctx.strokeStyle = dragOptions.borderColor || 'rgba(225,225,225)';
    ctx.strokeRect(left, top, width, height);
  }
  ctx.restore();
}

export default {
  id: 'zoom',

  version,

  defaults: {
    pan: {
      enabled: false,
      mode: 'xy',
      threshold: 10,
      modifierKey: null,
    },
    zoom: {
      wheel: {
        enabled: false,
        speed: 0.1,
        modifierKey: null
      },
      drag: {
        enabled: false,
        drawTime: 'beforeDatasetsDraw',
        modifierKey: null
      },
      pinch: {
        enabled: false
      },
      mode: 'xy',
    }
  },

  start: function(chart, _args, options) {
    const state = getState(chart);
    state.options = options;

    if (Object.prototype.hasOwnProperty.call(options.zoom, 'enabled')) {
      console.warn('The option `zoom.enabled` is no longer supported. Please use `zoom.wheel.enabled`, `zoom.drag.enabled`, or `zoom.pinch.enabled`.');
    }
    if (Object.prototype.hasOwnProperty.call(options.zoom, 'overScaleMode')
      || Object.prototype.hasOwnProperty.call(options.pan, 'overScaleMode')) {
      console.warn('The option `overScaleMode` is deprecated. Please use `scaleMode` instead (and update `mode` as desired).');
    }

    if (Hammer) {
      startHammer(chart, options);
    }

    chart.pan = (delta, panScales, transition) => pan(chart, delta, panScales, transition);
    chart.zoom = (args, transition) => zoom(chart, args, transition);
    chart.zoomRect = (p0, p1, transition) => zoomRect(chart, p0, p1, transition);
    chart.zoomScale = (id, range, transition) => zoomScale(chart, id, range, transition);
    chart.resetZoom = (transition) => resetZoom(chart, transition);
    chart.getZoomLevel = () => getZoomLevel(chart);
    chart.getInitialScaleBounds = () => getInitialScaleBounds(chart);
    chart.getZoomedScaleBounds = () => getZoomedScaleBounds(chart);
    chart.isZoomedOrPanned = () => isZoomedOrPanned(chart);
    chart.isZoomingOrPanning = () => isZoomingOrPanning(chart);
  },

  beforeEvent(chart, {event}) {
    if (isZoomingOrPanning(chart)) {
      // cancel any event handling while panning or dragging
      return false;
    }
    // cancel the next click or mouseup after drag or pan
    if (event.type === 'click' || event.type === 'mouseup') {
      const state = getState(chart);
      if (state.filterNextClick) {
        state.filterNextClick = false;
        return false;
      }
    }
  },

  beforeUpdate: function(chart, args, options) {
    const state = getState(chart);
    const previousOptions = state.options;
    state.options = options;

    // Hammer needs to be restarted when certain options change.
    if (hammerOptionsChanged(previousOptions, options)) {
      stopHammer(chart);
      startHammer(chart, options);
    }

    addListeners(chart, options);
  },

  beforeDatasetsDraw(chart, _args, options) {
    draw(chart, 'beforeDatasetsDraw', options);
  },

  afterDatasetsDraw(chart, _args, options) {
    draw(chart, 'afterDatasetsDraw', options);
  },

  beforeDraw(chart, _args, options) {
    draw(chart, 'beforeDraw', options);
  },

  afterDraw(chart, _args, options) {
    draw(chart, 'afterDraw', options);
  },

  stop: function(chart) {
    removeListeners(chart);

    if (Hammer) {
      stopHammer(chart);
    }
    removeState(chart);
  },

  panFunctions,
  zoomFunctions,
  zoomRectFunctions,
};
