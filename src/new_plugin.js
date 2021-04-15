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

  beforeDatasetsDraw: function(chartInstance) {
    var ctx = chartInstance.ctx;

    if (chartInstance.$zoom._dragZoomEnd) {
      var xAxis = getXAxis(chartInstance);
      var yAxis = getYAxis(chartInstance);
      var beginPoint = chartInstance.$zoom._dragZoomStart;
      var endPoint = chartInstance.$zoom._dragZoomEnd;

      var startX = xAxis.left;
      var endX = xAxis.right;
      var startY = yAxis.top;
      var endY = yAxis.bottom;

      if (directionEnabled(chartInstance.$zoom._options.zoom.mode, 'x', chartInstance)) {
        var offsetX = beginPoint.target.getBoundingClientRect().left;
        startX = Math.min(beginPoint.clientX, endPoint.clientX) - offsetX;
        endX = Math.max(beginPoint.clientX, endPoint.clientX) - offsetX;
      }

      if (directionEnabled(chartInstance.$zoom._options.zoom.mode, 'y', chartInstance)) {
        var offsetY = beginPoint.target.getBoundingClientRect().top;
        startY = Math.min(beginPoint.clientY, endPoint.clientY) - offsetY;
        endY = Math.max(beginPoint.clientY, endPoint.clientY) - offsetY;
      }

      var rectWidth = endX - startX;
      var rectHeight = endY - startY;
      var dragOptions = chartInstance.$zoom._options.zoom.drag;

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
