import Hammer from 'hammerjs';
import {addListeners, computeDragRect, removeListeners} from './handlers';
import {startHammer, stopHammer} from './hammer';
import {pan, zoom, resetZoom, zoomScale} from './core';
import {panFunctions, zoomFunctions} from './scale.types';
import {getState, removeState} from './state';
import {version} from '../package.json';

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
        enabled: false
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

    if (Hammer) {
      startHammer(chart, options);
    }

    chart.pan = (delta, panScales, transition) => pan(chart, delta, panScales, transition);
    chart.zoom = (args, transition) => zoom(chart, args, transition);
    chart.zoomScale = (id, range, transition) => zoomScale(chart, id, range, transition);
    chart.resetZoom = (transition) => resetZoom(chart, transition);
  },

  beforeEvent(chart) {
    const state = getState(chart);
    if (state.panning || state.dragging) {
      // cancel any event handling while panning or dragging
      return false;
    }
  },

  beforeUpdate: function(chart, args, options) {
    const state = getState(chart);
    state.options = options;
    addListeners(chart, options);
  },

  beforeDatasetsDraw: function(chart, args, options) {
    const {dragStart, dragEnd} = getState(chart);

    if (dragEnd) {
      const {left, top, width, height} = computeDragRect(chart, options.zoom.mode, dragStart, dragEnd);

      const dragOptions = options.zoom.drag;
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
  },

  stop: function(chart) {
    removeListeners(chart);

    if (Hammer) {
      stopHammer(chart);
    }
    removeState(chart);
  },

  panFunctions,

  zoomFunctions
};
