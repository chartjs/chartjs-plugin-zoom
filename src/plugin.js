import Hammer from 'hammerjs';
import {addListeners, removeListeners} from './handlers';
import {directionEnabled, getXAxis, getYAxis} from './utils';
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
      const xAxis = getXAxis(chart);
      const yAxis = getYAxis(chart);
      const {left, top} = beginPoint.target.getBoundingClientRect();
      let {left: startX, right: endX} = xAxis;
      let {top: startY, bottom: endY} = yAxis;

      if (directionEnabled(options.zoom.mode, 'x', chart)) {
        startX = Math.min(beginPoint.clientX, endPoint.clientX) - left;
        endX = Math.max(beginPoint.clientX, endPoint.clientX) - left;
      }

      if (directionEnabled(options.zoom.mode, 'y', chart)) {
        startY = Math.min(beginPoint.clientY, endPoint.clientY) - top;
        endY = Math.max(beginPoint.clientY, endPoint.clientY) - top;
      }

      const rectWidth = endX - startX;
      const rectHeight = endY - startY;
      const dragOptions = options.zoom.drag;

      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = dragOptions.backgroundColor || 'rgba(225,225,225,0.3)';
      ctx.fillRect(startX, startY, rectWidth, rectHeight);

      if (dragOptions.borderWidth > 0) {
        ctx.lineWidth = dragOptions.borderWidth;
        ctx.strokeStyle = dragOptions.borderColor || 'rgba(225,225,225)';
        ctx.strokeRect(startX, startY, rectWidth, rectHeight);
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
