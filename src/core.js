import {each, callback as call} from 'chart.js/helpers';
import {panFunctions, zoomFunctions} from './scale.types';
import {directionEnabled, getEnabledScalesByPoint} from './utils';

function storeOriginalOptions(chart) {
  var originalOptions = chart.$zoom._originalOptions;
  each(chart.scales, function(scale) {
    if (!originalOptions[scale.id]) {
      originalOptions[scale.id] = {min: scale.options.min, max: scale.options.max};
    }
  });
  each(originalOptions, function(opt, key) {
    if (!chart.scales[key]) {
      delete originalOptions[key];
    }
  });
}

function zoomScale(scale, zoom, center, zoomOptions) {
  call(zoomFunctions[scale.type], [scale, zoom, center, zoomOptions]);
}

/**
 * @param chart The chart instance
 * @param {number} percentZoomX The zoom percentage in the x direction
 * @param {number} percentZoomY The zoom percentage in the y direction
 * @param {{x: number, y: number}} focalPoint The x and y coordinates of zoom focal point. The point which doesn't change while zooming. E.g. the location of the mouse cursor when "drag: false"
 * @param {object} zoomOptions The zoom options
 * @param {string} [whichAxes] `xy`, 'x', or 'y'
 * @param {boolean} [useTransition] Whether to use `zoom` transition
 */
export function doZoom(chart, percentZoomX, percentZoomY, focalPoint, zoomOptions, whichAxes, useTransition) {
  const ca = chart.chartArea;
  if (!focalPoint) {
    focalPoint = {
      x: (ca.left + ca.right) / 2,
      y: (ca.top + ca.bottom) / 2,
    };
  }

  if (zoomOptions.enabled) {
    storeOriginalOptions(chart);
    // Do the zoom here
    const zoomMode = typeof zoomOptions.mode === 'function' ? zoomOptions.mode({chart: chart}) : zoomOptions.mode;

    // Which axes should be modified when fingers were used.
    let _whichAxes;
    if (zoomMode === 'xy' && whichAxes !== undefined) {
      // based on fingers positions
      _whichAxes = whichAxes;
    } else {
      // no effect
      _whichAxes = 'xy';
    }

    const enabledScales = getEnabledScalesByPoint(zoomOptions, focalPoint.x, focalPoint.y, chart);
    each(enabledScales || chart.scales, function(scale) {
      if (scale.isHorizontal() && directionEnabled(zoomMode, 'x', chart) && directionEnabled(_whichAxes, 'x', chart)) {
        zoomOptions.scaleAxes = 'x';
        zoomScale(scale, percentZoomX, focalPoint, zoomOptions);
      } else if (!scale.isHorizontal() && directionEnabled(zoomMode, 'y', chart) && directionEnabled(_whichAxes, 'y', chart)) {
        // Do Y zoom
        zoomOptions.scaleAxes = 'y';
        zoomScale(scale, percentZoomY, focalPoint, zoomOptions);
      }
    });

    chart.update(useTransition ? 'zoom' : 'none');

    call(zoomOptions.onZoom, [chart]);
  }
}

export function resetZoom(chart) {
  storeOriginalOptions(chart);
  var originalOptions = chart.$zoom._originalOptions;
  each(chart.scales, function(scale) {

    var scaleOptions = scale.options;
    if (originalOptions[scale.id]) {
      scaleOptions.min = originalOptions[scale.id].min;
      scaleOptions.max = originalOptions[scale.id].max;
    } else {
      delete scaleOptions.min;
      delete scaleOptions.max;
    }
  });
  chart.update();
}

function panScale(scale, delta, panOptions) {
  call(panFunctions[scale.type], [scale, delta, panOptions]);
}

export function doPan(chart, deltaX, deltaY, panOptions, panningScales) {
  storeOriginalOptions(chart);
  if (panOptions.enabled) {
    var panMode = typeof panOptions.mode === 'function' ? panOptions.mode({chart}) : panOptions.mode;

    each(panningScales || chart.scales, function(scale) {
      if (scale.isHorizontal() && directionEnabled(panMode, 'x', chart) && deltaX !== 0) {
        panOptions.scaleAxes = 'x';
        panScale(scale, deltaX, panOptions);
      } else if (!scale.isHorizontal() && directionEnabled(panMode, 'y', chart) && deltaY !== 0) {
        panOptions.scaleAxes = 'y';
        panScale(scale, deltaY, panOptions);
      }
    });

    chart.update('none');

    call(panOptions.onPan, [chart]);
  }
}

