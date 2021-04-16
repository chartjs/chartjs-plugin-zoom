import Hammer from 'hammerjs';
import {addListeners, computeDragRect, removeListeners} from './handlers';
import {startHammer, stopHammer} from './hammer';
import {resetZoom} from './core';

export default {
  id: 'zoom',

  defaults: {
    pan: {
      enabled: false,
      mode: 'xy',
      speed: 20,
      threshold: 10,
      modifierKey: null,
    },
    zoom: {
      enabled: false,
      mode: 'xy',
      sensitivity: 3,
      speed: 0.1,
      wheelModifierKey: null
    }
  },

  start: function(chart, args, options) {
    chart.$zoom = {
      _originalOptions: {}
    };
    addListeners(chart, options);

    if (Hammer) {
      startHammer(chart, options);
    }
    chart.resetZoom = () => resetZoom(chart);
  },

  beforeUpdate: function(chart, args, options) {
    addListeners(chart, options);
  },

  beforeDatasetsDraw: function(chart, args, options) {
    const {$zoom: props = {}, ctx} = chart;
    const {_dragZoomStart: beginPoint, _dragZoomEnd: endPoint} = props;

    if (endPoint) {
      const {left, top, width, height} = computeDragRect(chart, options.zoom.mode, beginPoint, endPoint);

      const dragOptions = options.zoom.drag;

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
    if (!chart.$zoom) {
      return;
    }

    removeListeners(chart);

    delete chart.$zoom;

    if (Hammer) {
      stopHammer(chart);
    }
  }
};
