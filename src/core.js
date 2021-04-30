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

function zoomScale(scale, zoom, center, limits) {
  const fn = zoomFunctions[scale.type] || zoomFunctions.default;
  call(fn, [scale, zoom, center, limits]);
}

function getCenter(chart) {
  const ca = chart.chartArea;
  return {
    x: (ca.left + ca.right) / 2,
    y: (ca.top + ca.bottom) / 2,
  };
}

/**
 * @param chart The chart instance
 * @param {number | {x?: number, y?: number, focalPoint?: {x: number, y: number}}} zoom The zoom percentage or percentages and focal point
 * @param {boolean} [useTransition] Whether to use `zoom` transition
 */
export function doZoom(chart, zoom, useTransition) {
  const {x = 1, y = 1, focalPoint = getCenter(chart)} = typeof zoom === 'number' ? {x: zoom, y: zoom} : zoom;
  const {options: {limits, zoom: zoomOptions}} = getState(chart);
  const {mode = 'xy', overScaleMode} = zoomOptions || {};

  storeOriginalScaleLimits(chart);

  const xEnabled = x !== 1 && directionEnabled(mode, 'x', chart);
  const yEnabled = y !== 1 && directionEnabled(mode, 'y', chart);
  const enabledScales = overScaleMode && getEnabledScalesByPoint(overScaleMode, focalPoint, chart);

  each(enabledScales || chart.scales, function(scale) {
    if (scale.isHorizontal() && xEnabled) {
      zoomScale(scale, x, focalPoint, limits);
    } else if (!scale.isHorizontal() && yEnabled) {
      zoomScale(scale, y, focalPoint, limits);
    }
  });

  chart.update(useTransition ? 'zoom' : 'none');

  call(zoomOptions.onZoom, [{chart}]);
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

function panScale(scale, delta, limits) {
  const {panDelta} = getState(scale.chart);
  // Add possible cumulative delta from previous pan attempts where scale did not change
  delta += panDelta[scale.id] || 0;
  const fn = panFunctions[scale.type] || panFunctions.default;
  if (call(fn, [scale, delta, limits])) {
    // The scale changed, reset cumulative delta
    panDelta[scale.id] = 0;
  } else {
    // The scale did not change, store cumulative delta
    panDelta[scale.id] = delta;
  }
}

export function doPan(chart, pan, enabledScales) {
  const {x = 0, y = 0} = typeof pan === 'number' ? {x: pan, y: pan} : pan;
  const {options: {pan: panOptions, limits}} = getState(chart);
  const {mode = 'xy', onPan} = panOptions || {};

  storeOriginalScaleLimits(chart);

  const xEnabled = x !== 0 && directionEnabled(mode, 'x', chart);
  const yEnabled = y !== 0 && directionEnabled(mode, 'y', chart);

  each(enabledScales || chart.scales, function(scale) {
    if (scale.isHorizontal() && xEnabled) {
      panScale(scale, x, limits);
    } else if (!scale.isHorizontal() && yEnabled) {
      panScale(scale, y, limits);
    }
  });

  chart.update('none');

  call(onPan, [{chart}]);
}

