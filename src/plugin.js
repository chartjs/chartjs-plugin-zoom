import {clone, each, isNullOrUndef, merge} from 'chart.js/helpers';
import Hammer from 'hammerjs';

// Zoom namespace (kept under Chart prior to Chart.js 3)
var zoomNS = {};

// Where we store functions to handle different scale types
var zoomFunctions = zoomNS.zoomFunctions = zoomNS.zoomFunctions || {};
var panFunctions = zoomNS.panFunctions = zoomNS.panFunctions || {};

function resolveOptions(chart, options) {
  var deprecatedOptions = {};
  if (typeof chart.options.pan !== 'undefined') {
    deprecatedOptions.pan = chart.options.pan;
  }
  if (typeof chart.options.zoom !== 'undefined') {
    deprecatedOptions.zoom = chart.options.zoom;
  }
  var props = chart.$zoom;
  options = props._options = merge({}, [options, deprecatedOptions]);

  // Install listeners. Do this dynamically based on options so that we can turn zoom on and off
  // We also want to make sure listeners aren't always on. E.g. if you're scrolling down a page
  // and the mouse goes over a chart you don't want it intercepted unless the plugin is enabled
  var node = props._node;
  var zoomEnabled = options.zoom && options.zoom.enabled;
  var dragEnabled = options.zoom.drag;
  if (zoomEnabled && !dragEnabled) {
    node.addEventListener('wheel', props._wheelHandler);
  } else {
    node.removeEventListener('wheel', props._wheelHandler);
  }
  if (zoomEnabled && dragEnabled) {
    node.addEventListener('mousedown', props._mouseDownHandler);
    node.ownerDocument.addEventListener('mouseup', props._mouseUpHandler);
  } else {
    node.removeEventListener('mousedown', props._mouseDownHandler);
    node.removeEventListener('mousemove', props._mouseMoveHandler);
    node.ownerDocument.removeEventListener('mouseup', props._mouseUpHandler);
  }
}

function storeOriginalOptions(chart) {
  var originalOptions = chart.$zoom._originalOptions;
  each(chart.scales, function(scale) {
    if (!originalOptions[scale.id]) {
      originalOptions[scale.id] = clone(scale.options);
    }
  });
  each(originalOptions, function(opt, key) {
    if (!chart.scales[key]) {
      delete originalOptions[key];
    }
  });
}

/**
 * @param {string} mode can be 'x', 'y' or 'xy'
 * @param {string} dir can be 'x' or 'y'
 * @param {Chart} chart instance of the chart in question
 */
function directionEnabled(mode, dir, chart) {
  if (mode === undefined) {
    return true;
  } else if (typeof mode === 'string') {
    return mode.indexOf(dir) !== -1;
  } else if (typeof mode === 'function') {
    return mode({chart: chart}).indexOf(dir) !== -1;
  }

  return false;
}

function rangeMaxLimiter(zoomPanOptions, newMax) {
  if (zoomPanOptions.scaleAxes && zoomPanOptions.rangeMax &&
      !isNullOrUndef(zoomPanOptions.rangeMax[zoomPanOptions.scaleAxes])) {
    const rangeMax = zoomPanOptions.rangeMax[zoomPanOptions.scaleAxes];
    if (newMax > rangeMax) {
      newMax = rangeMax;
    }
  }
  return newMax;
}

function rangeMinLimiter(zoomPanOptions, newMin) {
  if (zoomPanOptions.scaleAxes && zoomPanOptions.rangeMin &&
      !isNullOrUndef(zoomPanOptions.rangeMin[zoomPanOptions.scaleAxes])) {
    const rangeMin = zoomPanOptions.rangeMin[zoomPanOptions.scaleAxes];
    if (newMin < rangeMin) {
      newMin = rangeMin;
    }
  }
  return newMin;
}

function zoomDelta(scale, zoom, center) {
  const range = scale.max - scale.min;
  const newDiff = range * (zoom - 1);

  const centerPoint = scale.isHorizontal() ? center.x : center.y;
  const minPercent = (scale.getValueForPixel(centerPoint) - scale.min) / range;
  const maxPercent = 1 - minPercent;

  return {
    min: newDiff * minPercent,
    max: newDiff * maxPercent
  };
}

function zoomNumericalScale(scale, zoom, center, zoomOptions) {
  const delta = zoomDelta(scale, zoom, center);
  scale.options.min = rangeMinLimiter(zoomOptions, scale.min + delta.min);
  scale.options.max = rangeMaxLimiter(zoomOptions, scale.max - delta.max);
}

const integerChange = (v) => v === 0 || isNaN(v) ? 0 : v < 0 ? Math.min(Math.round(v), -1) : Math.max(Math.round(v), 1);

function zoomCategoryScale(scale, zoom, center, zoomOptions) {
  const labels = scale.getLabels();
  const maxIndex = labels.length - 1;
  if (scale.min === scale.max && zoom < 1) {
    if (scale.min > 0) {
      scale.min--;
    } else if (scale.max < maxIndex) {
      scale.max++;
    }
  }
  const delta = zoomDelta(scale, zoom, center);
  scale.options.min = labels[Math.max(0, rangeMinLimiter(zoomOptions, scale.min + integerChange(delta.min)))];
  scale.options.max = labels[Math.min(maxIndex, rangeMaxLimiter(zoomOptions, scale.max - integerChange(delta.max)))];
}

function zoomScale(scale, zoom, center, zoomOptions) {
  var fn = zoomFunctions[scale.type];
  if (fn) {
    fn(scale, zoom, center, zoomOptions);
  }
}

/**
 * @param chart The chart instance
 * @param {number} percentZoomX The zoom percentage in the x direction
 * @param {number} percentZoomY The zoom percentage in the y direction
 * @param {{x: number, y: number}} focalPoint The x and y coordinates of zoom focal point. The point which doesn't change while zooming. E.g. the location of the mouse cursor when "drag: false"
 * @param {string} whichAxes `xy`, 'x', or 'y'
 * @param {number} animationDuration Duration of the animation of the redraw in milliseconds
 */
function doZoom(chart, percentZoomX, percentZoomY, focalPoint, whichAxes, animationDuration) {
  var ca = chart.chartArea;
  if (!focalPoint) {
    focalPoint = {
      x: (ca.left + ca.right) / 2,
      y: (ca.top + ca.bottom) / 2,
    };
  }

  var zoomOptions = chart.$zoom._options.zoom;

  if (zoomOptions.enabled) {
    storeOriginalOptions(chart);
    // Do the zoom here
    var zoomMode = typeof zoomOptions.mode === 'function' ? zoomOptions.mode({chart: chart}) : zoomOptions.mode;

    // Which axes should be modified when fingers were used.
    var _whichAxes;
    if (zoomMode === 'xy' && whichAxes !== undefined) {
      // based on fingers positions
      _whichAxes = whichAxes;
    } else {
      // no effect
      _whichAxes = 'xy';
    }

    each(chart.scales, function(scale) {
      if (scale.isHorizontal() && directionEnabled(zoomMode, 'x', chart) && directionEnabled(_whichAxes, 'x', chart)) {
        zoomOptions.scaleAxes = 'x';
        zoomScale(scale, percentZoomX, focalPoint, zoomOptions);
      } else if (!scale.isHorizontal() && directionEnabled(zoomMode, 'y', chart) && directionEnabled(_whichAxes, 'y', chart)) {
        // Do Y zoom
        zoomOptions.scaleAxes = 'y';
        zoomScale(scale, percentZoomY, focalPoint, zoomOptions);
      }
    });

    if (animationDuration) {
      // needs to create specific animation mode
      if (!chart.options.animation.zoom) {
        chart.options.animation.zoom = {
          duration: animationDuration,
          easing: 'easeOutQuad',
        };
      }
      chart.update('zoom');
    } else {
      chart.update('none');
    }

    if (typeof zoomOptions.onZoom === 'function') {
      zoomOptions.onZoom({chart: chart});
    }
  }
}

function panCategoryScale(scale, delta, panOptions) {
  const labels = scale.getLabels();
  const lastLabelIndex = labels.length - 1;
  const offsetAmt = Math.max(scale.ticks.length, 1);
  const panSpeed = panOptions.speed;
  const step = Math.round(scale.width / (offsetAmt * panSpeed));
  let minIndex = scale.min;
  let maxIndex;

  zoomNS.panCumulativeDelta += delta;

  minIndex = zoomNS.panCumulativeDelta > step ? Math.max(0, minIndex - 1) : zoomNS.panCumulativeDelta < -step ? Math.min(lastLabelIndex - offsetAmt + 1, minIndex + 1) : minIndex;
  zoomNS.panCumulativeDelta = minIndex !== scale.min ? 0 : zoomNS.panCumulativeDelta;

  maxIndex = Math.min(lastLabelIndex, minIndex + offsetAmt - 1);

  scale.options.min = rangeMinLimiter(panOptions, labels[minIndex]);
  scale.options.max = rangeMaxLimiter(panOptions, labels[maxIndex]);
}

function panNumericalScale(scale, delta, panOptions) {
  const scaleOpts = scale.options;
  const prevStart = scale.min;
  const prevEnd = scale.max;
  const newMin = scale.getValueForPixel(scale.getPixelForValue(prevStart) - delta);
  const newMax = scale.getValueForPixel(scale.getPixelForValue(prevEnd) - delta);
  const rangeMin = rangeMinLimiter(panOptions, newMin);
  const rangeMax = rangeMaxLimiter(panOptions, newMax);
  let diff;

  if (newMin >= rangeMin && newMax <= rangeMax) {
    scaleOpts.min = newMin;
    scaleOpts.max = newMax;
  } else if (newMin < rangeMin) {
    diff = prevStart - rangeMin;
    scaleOpts.min = rangeMin;
    scaleOpts.max = prevEnd - diff;
  } else if (newMax > rangeMax) {
    diff = rangeMax - prevEnd;
    scaleOpts.max = rangeMax;
    scaleOpts.min = prevStart + diff;
  }
}

function panScale(scale, delta, panOptions) {
  const fn = panFunctions[scale.type];
  if (fn) {
    fn(scale, delta, panOptions);
  }
}

function doPan(chartInstance, deltaX, deltaY) {
  storeOriginalOptions(chartInstance);
  var panOptions = chartInstance.$zoom._options.pan;
  if (panOptions.enabled) {
    var panMode = typeof panOptions.mode === 'function' ? panOptions.mode({chart: chartInstance}) : panOptions.mode;

    each(chartInstance.scales, function(scale) {
      if (scale.isHorizontal() && directionEnabled(panMode, 'x', chartInstance) && deltaX !== 0) {
        panOptions.scaleAxes = 'x';
        panScale(scale, deltaX, panOptions);
      } else if (!scale.isHorizontal() && directionEnabled(panMode, 'y', chartInstance) && deltaY !== 0) {
        panOptions.scaleAxes = 'y';
        panScale(scale, deltaY, panOptions);
      }
    });

    chartInstance.update('none');

    if (typeof panOptions.onPan === 'function') {
      panOptions.onPan({chart: chartInstance});
    }
  }
}

function getXAxis(chartInstance) {
  var scales = chartInstance.scales;
  var scaleIds = Object.keys(scales);
  for (var i = 0; i < scaleIds.length; i++) {
    var scale = scales[scaleIds[i]];

    if (scale.isHorizontal()) {
      return scale;
    }
  }
}

function getYAxis(chartInstance) {
  var scales = chartInstance.scales;
  var scaleIds = Object.keys(scales);
  for (var i = 0; i < scaleIds.length; i++) {
    var scale = scales[scaleIds[i]];

    if (!scale.isHorizontal()) {
      return scale;
    }
  }
}

// Store these for later
zoomNS.zoomFunctions.category = zoomCategoryScale;
zoomNS.zoomFunctions.time = zoomNumericalScale;
zoomNS.zoomFunctions.linear = zoomNumericalScale;
zoomNS.zoomFunctions.logarithmic = zoomNumericalScale;
zoomNS.panFunctions.category = panCategoryScale;
zoomNS.panFunctions.time = panNumericalScale;
zoomNS.panFunctions.linear = panNumericalScale;
zoomNS.panFunctions.logarithmic = panNumericalScale;
// Globals for category pan
zoomNS.panCumulativeDelta = 0;

// Chartjs Zoom Plugin
var zoomPlugin = {
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

  start: function(chartInstance, args, pluginOptions) {
    chartInstance.$zoom = {
      _originalOptions: {}
    };
    var node = chartInstance.$zoom._node = chartInstance.ctx.canvas;
    resolveOptions(chartInstance, pluginOptions);

    var options = chartInstance.$zoom._options;
    var panThreshold = options.pan && options.pan.threshold;

    chartInstance.$zoom._mouseDownHandler = function(event) {
      node.addEventListener('mousemove', chartInstance.$zoom._mouseMoveHandler);
      chartInstance.$zoom._dragZoomStart = event;
    };

    chartInstance.$zoom._mouseMoveHandler = function(event) {
      if (chartInstance.$zoom._dragZoomStart) {
        chartInstance.$zoom._dragZoomEnd = event;
        chartInstance.update('none');
      }
    };

    chartInstance.$zoom._mouseUpHandler = function(event) {
      if (!chartInstance.$zoom._dragZoomStart) {
        return;
      }

      node.removeEventListener('mousemove', chartInstance.$zoom._mouseMoveHandler);

      var beginPoint = chartInstance.$zoom._dragZoomStart;

      var offsetX = beginPoint.target.getBoundingClientRect().left;
      var startX = Math.min(beginPoint.clientX, event.clientX) - offsetX;
      var endX = Math.max(beginPoint.clientX, event.clientX) - offsetX;

      var offsetY = beginPoint.target.getBoundingClientRect().top;
      var startY = Math.min(beginPoint.clientY, event.clientY) - offsetY;
      var endY = Math.max(beginPoint.clientY, event.clientY) - offsetY;

      var dragDistanceX = endX - startX;
      var dragDistanceY = endY - startY;

      // Remove drag start and end before chart update to stop drawing selected area
      chartInstance.$zoom._dragZoomStart = null;
      chartInstance.$zoom._dragZoomEnd = null;

      var zoomThreshold = (options.zoom && options.zoom.threshold) || 0;
      if (dragDistanceX <= zoomThreshold && dragDistanceY <= zoomThreshold) {
        return;
      }

      var chartArea = chartInstance.chartArea;

      var zoomOptions = chartInstance.$zoom._options.zoom;
      var chartDistanceX = chartArea.right - chartArea.left;
      var xEnabled = directionEnabled(zoomOptions.mode, 'x', chartInstance);
      var zoomX = xEnabled && dragDistanceX ? 1 + ((chartDistanceX - dragDistanceX) / chartDistanceX) : 1;

      var chartDistanceY = chartArea.bottom - chartArea.top;
      var yEnabled = directionEnabled(zoomOptions.mode, 'y', chartInstance);
      var zoomY = yEnabled && dragDistanceY ? 1 + ((chartDistanceY - dragDistanceY) / chartDistanceY) : 1;

      doZoom(chartInstance, zoomX, zoomY, {
        x: (startX - chartArea.left) / (1 - dragDistanceX / chartDistanceX) + chartArea.left,
        y: (startY - chartArea.top) / (1 - dragDistanceY / chartDistanceY) + chartArea.top
      }, undefined, zoomOptions.drag.animationDuration);

      if (typeof zoomOptions.onZoomComplete === 'function') {
        zoomOptions.onZoomComplete({chart: chartInstance});
      }
    };

    var _scrollTimeout = null;
    chartInstance.$zoom._wheelHandler = function(event) {
      var zoomOptions = chartInstance.$zoom._options.zoom;

      // Before preventDefault, check if the modifier key required and pressed
      if (zoomOptions
          && zoomOptions.wheelModifierKey
          && !event[zoomOptions.wheelModifierKey + 'Key']) {
        if (typeof zoomOptions.onzoomRejected === 'function') {
          zoomOptions.onzoomRejected({
            chart: chartInstance,
            event: event
          });
        }
        return;
      }

      // Prevent the event from triggering the default behavior (eg. Content scrolling).
      if (event.cancelable) {
        event.preventDefault();
      }

      // Firefox always fires the wheel event twice:
      // First without the delta and right after that once with the delta properties.
      if (typeof event.deltaY === 'undefined') {
        return;
      }

      var rect = event.target.getBoundingClientRect();
      var offsetX = event.clientX - rect.left;
      var offsetY = event.clientY - rect.top;

      var center = {
        x: offsetX,
        y: offsetY
      };

      var speedPercent = zoomOptions.speed;

      if (event.deltaY >= 0) {
        speedPercent = -speedPercent;
      }
      doZoom(chartInstance, 1 + speedPercent, 1 + speedPercent, center);

      clearTimeout(_scrollTimeout);
      _scrollTimeout = setTimeout(function() {
        if (typeof zoomOptions.onZoomComplete === 'function') {
          zoomOptions.onZoomComplete({chart: chartInstance});
        }
      }, 250);
    };

    if (Hammer) {
      var panEnabler = function(recognizer, event) {
        const panOptions = chartInstance.$zoom._options.pan;
        if (!panOptions || !panOptions.enabled) {
          return false;
        }
        if (!event || !event.srcEvent) { // Sometimes Hammer queries this with a null event.
          return true;
        }
        const requireModifier = panOptions.modifierKey
          && (event.pointerType === 'mouse');
        if (requireModifier && !event.srcEvent[panOptions.modifierKey + 'Key']) {
          if (typeof panOptions.onPanRejected === 'function') {
            panOptions.onPanRejected({
              chart: chartInstance,
              event: event
            });
          }
          return false;
        }
        return true;
      };

      var zoomOptions = chartInstance.$zoom._options.zoom;
      var panOptions = chartInstance.$zoom._options.pan;
      var mc = new Hammer.Manager(node);
      if (zoomOptions && zoomOptions.enabled) {
        mc.add(new Hammer.Pinch());
      }
      if (panOptions && panOptions.enabled) {
        mc.add(new Hammer.Pan({
          threshold: panThreshold,
          enable: panEnabler
        }));
      }

      // Hammer reports the total scaling. We need the incremental amount
      var currentPinchScaling;
      var handlePinch = function(e) {
        var diff = 1 / (currentPinchScaling) * e.scale;
        var rect = e.target.getBoundingClientRect();
        var offsetX = e.center.x - rect.left;
        var offsetY = e.center.y - rect.top;
        var center = {
          x: offsetX,
          y: offsetY
        };

        // fingers position difference
        var x = Math.abs(e.pointers[0].clientX - e.pointers[1].clientX);
        var y = Math.abs(e.pointers[0].clientY - e.pointers[1].clientY);

        // diagonal fingers will change both (xy) axes
        var p = x / y;
        var xy;
        if (p > 0.3 && p < 1.7) {
          xy = 'xy';
        } else if (x > y) {
          xy = 'x'; // x axis
        } else {
          xy = 'y'; // y axis
        }

        doZoom(chartInstance, diff, diff, center, xy);

        if (typeof zoomOptions.onZoom === 'function') {
          zoomOptions.onZoom({chart: chartInstance});
        }

        // Keep track of overall scale
        currentPinchScaling = e.scale;
      };

      mc.on('pinchstart', function() {
        currentPinchScaling = 1; // reset tracker
      });
      mc.on('pinch', handlePinch);
      mc.on('pinchend', function(e) {
        handlePinch(e);
        currentPinchScaling = null; // reset
        if (typeof zoomOptions.onZoomComplete === 'function') {
          zoomOptions.onZoomComplete({chart: chartInstance});
        }
      });

      var currentDeltaX = null;
      var currentDeltaY = null;
      var panning = false;
      var handlePan = function(e) {
        if (currentDeltaX !== null && currentDeltaY !== null) {
          panning = true;
          var deltaX = e.deltaX - currentDeltaX;
          var deltaY = e.deltaY - currentDeltaY;
          currentDeltaX = e.deltaX;
          currentDeltaY = e.deltaY;
          doPan(chartInstance, deltaX, deltaY);
        }
      };

      mc.on('panstart', function(e) {
        currentDeltaX = 0;
        currentDeltaY = 0;
        handlePan(e);
      });
      mc.on('panmove', handlePan);
      mc.on('panend', function() {
        currentDeltaX = null;
        currentDeltaY = null;
        setTimeout(function() {
          panning = false;
        }, 500);
        if (typeof panOptions.onPanComplete === 'function') {
          panOptions.onPanComplete({chart: chartInstance});
        }
      });

      chartInstance.$zoom._ghostClickHandler = function(e) {
        if (panning && e.cancelable) {
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      };
      node.addEventListener('click', chartInstance.$zoom._ghostClickHandler);

      chartInstance._mc = mc;
    }

    chartInstance.resetZoom = function() {
      storeOriginalOptions(chartInstance);
      var originalOptions = chartInstance.$zoom._originalOptions;
      each(chartInstance.scales, function(scale) {

        var scaleOptions = scale.options;
        if (originalOptions[scale.id]) {
          scaleOptions.min = originalOptions[scale.id].min;
          scaleOptions.max = originalOptions[scale.id].max;
        } else {
          delete scaleOptions.min;
          delete scaleOptions.max;
        }
      });
      chartInstance.update();
    };
  },

  beforeUpdate: function(chart, args, options) {
    resolveOptions(chart, options);
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

  stop: function(chartInstance) {
    if (!chartInstance.$zoom) {
      return;
    }
    var props = chartInstance.$zoom;
    var node = props._node;

    node.removeEventListener('mousedown', props._mouseDownHandler);
    node.removeEventListener('mousemove', props._mouseMoveHandler);
    node.ownerDocument.removeEventListener('mouseup', props._mouseUpHandler);
    node.removeEventListener('wheel', props._wheelHandler);
    node.removeEventListener('click', props._ghostClickHandler);

    delete chartInstance.$zoom;

    var mc = chartInstance._mc;
    if (mc) {
      mc.remove('pinchstart');
      mc.remove('pinch');
      mc.remove('pinchend');
      mc.remove('panstart');
      mc.remove('pan');
      mc.remove('panend');
      mc.destroy();
    }
  }
};

export default zoomPlugin;
