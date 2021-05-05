import {each, callback as call, sign} from 'chart.js/helpers';
import {panFunctions, updateRange, zoomFunctions} from './scale.types';
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

function doZoom(scale, amount, center, limits) {
  const fn = zoomFunctions[scale.type] || zoomFunctions.default;
  call(fn, [scale, amount, center, limits]);
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
 * @param {number | {x?: number, y?: number, focalPoint?: {x: number, y: number}}} amount The zoom percentage or percentages and focal point
 * @param {string} [transition] Which transiton mode to use. Defaults to 'none'
 */
export function zoom(chart, amount, transition = 'none') {
  const {x = 1, y = 1, focalPoint = getCenter(chart)} = typeof amount === 'number' ? {x: amount, y: amount} : amount;
  const {options: {limits, zoom: zoomOptions}} = getState(chart);
  const {mode = 'xy', overScaleMode} = zoomOptions || {};

  storeOriginalScaleLimits(chart);

  const xEnabled = x !== 1 && directionEnabled(mode, 'x', chart);
  const yEnabled = y !== 1 && directionEnabled(mode, 'y', chart);
  const enabledScales = overScaleMode && getEnabledScalesByPoint(overScaleMode, focalPoint, chart);

  each(enabledScales || chart.scales, function(scale) {
    if (scale.isHorizontal() && xEnabled) {
      doZoom(scale, x, focalPoint, limits);
    } else if (!scale.isHorizontal() && yEnabled) {
      doZoom(scale, y, focalPoint, limits);
    }
  });

  chart.update(transition);

  call(zoomOptions.onZoom, [{chart}]);
}

function getRange(scale, pixel0, pixel1) {
  const v0 = scale.getValueForPixel(pixel0);
  const v1 = scale.getValueForPixel(pixel1);
  return {
    min: Math.min(v0, v1),
    max: Math.max(v0, v1)
  };
}

export function zoomRect(chart, p0, p1, transition = 'none') {
  const {options: {limits, zoom: zoomOptions}} = getState(chart);
  const {mode = 'xy'} = zoomOptions;

  storeOriginalScaleLimits(chart);
  const xEnabled = directionEnabled(mode, 'x', chart);
  const yEnabled = directionEnabled(mode, 'y', chart);

  each(chart.scales, function(scale) {
    if (scale.isHorizontal() && xEnabled) {
      updateRange(scale, getRange(scale, p0.x, p1.x), limits, true);
    } else if (!scale.isHorizontal() && yEnabled) {
      updateRange(scale, getRange(scale, p0.y, p1.y), limits, true);
    }
  });

  chart.update(transition);

  call(zoomOptions.onZoom, [{chart}]);
}

export function zoomScale(chart, scaleId, range, transition = 'none') {
  storeOriginalScaleLimits(chart);
  const scale = chart.scales[scaleId];
  updateRange(scale, range, undefined, true);
  chart.update(transition);
}


export function resetZoom(chart, transition = 'default') {
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
  chart.update(transition);
}

function panScale(scale, delta, limits) {
  const {panDelta} = getState(scale.chart);
  // Add possible cumulative delta from previous pan attempts where scale did not change
  const storedDelta = panDelta[scale.id] || 0;
  if (sign(storedDelta) === sign(delta)) {
    delta += storedDelta;
  }
  const fn = panFunctions[scale.type] || panFunctions.default;
  if (call(fn, [scale, delta, limits])) {
    // The scale changed, reset cumulative delta
    panDelta[scale.id] = 0;
  } else {
    // The scale did not change, store cumulative delta
    panDelta[scale.id] = delta;
  }
}

export function pan(chart, delta, enabledScales, transition = 'none') {
  const {x = 0, y = 0} = typeof delta === 'number' ? {x: delta, y: delta} : delta;
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

  chart.update(transition);

  call(onPan, [{chart}]);
}

