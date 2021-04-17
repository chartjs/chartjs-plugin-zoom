import {each, callback as call} from 'chart.js/helpers';
import {panFunctions, zoomFunctions} from './scale.types';
import {getState} from './state';
import {directionEnabled, getEnabledScalesByPoint} from './utils';

function storeOriginalScaleLimits(chart) {
  const {originalScaleLimits} = getState(chart);
  each(chart.scales, function(scale) {
    if (!originalScaleLimits[scale.id]) {
      originalScaleLimits[scale.id] = {min: scale.options.min, max: scale.options.max};
    }
  });
  each(originalScaleLimits, function(opt, key) {
    if (!chart.scales[key]) {
      delete originalScaleLimits[key];
    }
  });
  return originalScaleLimits;
}

function zoomScale(scale, zoom, center, zoomOptions) {
  const fn = zoomFunctions[scale.type] || zoomFunctions.default;
  call(fn, [scale, zoom, center, zoomOptions]);
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
  if (!focalPoint) {
    const ca = chart.chartArea;
    focalPoint = {
      x: (ca.left + ca.right) / 2,
      y: (ca.top + ca.bottom) / 2,
    };
  }

  storeOriginalScaleLimits(chart);
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
      zoomScale(scale, percentZoomX, focalPoint, zoomOptions);
    } else if (!scale.isHorizontal() && directionEnabled(zoomMode, 'y', chart) && directionEnabled(_whichAxes, 'y', chart)) {
      zoomScale(scale, percentZoomY, focalPoint, zoomOptions);
    }
  });

  chart.update(useTransition ? 'zoom' : 'none');

  call(zoomOptions.onZoom, [chart]);
}

export function resetZoom(chart) {
  const originalScaleLimits = storeOriginalScaleLimits(chart);

  each(chart.scales, function(scale) {
    const scaleOptions = scale.options;
    if (originalScaleLimits[scale.id]) {
      scaleOptions.min = originalScaleLimits[scale.id].min;
      scaleOptions.max = originalScaleLimits[scale.id].max;
    } else {
      delete scaleOptions.min;
      delete scaleOptions.max;
    }
  });
  chart.update();
}

function panScale(scale, delta, panOptions) {
  const fn = panFunctions[scale.type] || panFunctions.default;
  call(fn, [scale, delta, panOptions]);
}

export function doPan(chart, deltaX, deltaY, panOptions, panningScales) {
  storeOriginalScaleLimits(chart);
  if (panOptions.enabled) {
    const panMode = typeof panOptions.mode === 'function' ? panOptions.mode({chart}) : panOptions.mode;

    each(panningScales || chart.scales, function(scale) {
      if (scale.isHorizontal() && directionEnabled(panMode, 'x', chart) && deltaX !== 0) {
        panScale(scale, deltaX, panOptions);
      } else if (!scale.isHorizontal() && directionEnabled(panMode, 'y', chart) && deltaY !== 0) {
        panScale(scale, deltaY, panOptions);
      }
    });

    chart.update('none');

    call(panOptions.onPan, [chart]);
  }
}

