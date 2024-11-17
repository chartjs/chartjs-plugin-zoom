import {each, callback as call, sign, valueOrDefault} from 'chart.js/helpers';
import {panFunctions, updateRange, zoomFunctions, zoomRectFunctions} from './scale.types';
import {getState} from './state';
import {directionEnabled, getEnabledScalesByPoint} from './utils';

function shouldUpdateScaleLimits(scale, originalScaleLimits, updatedScaleLimits) {
  const {id, options: {min, max}} = scale;
  if (!originalScaleLimits[id] || !updatedScaleLimits[id]) {
    return true;
  }
  const previous = updatedScaleLimits[id];
  return previous.min !== min || previous.max !== max;
}

function removeMissingScales(limits, scales) {
  each(limits, (opt, key) => {
    if (!scales[key]) {
      delete limits[key];
    }
  });
}

function storeOriginalScaleLimits(chart, state) {
  const {scales} = chart;
  const {originalScaleLimits, updatedScaleLimits} = state;

  each(scales, function(scale) {
    if (shouldUpdateScaleLimits(scale, originalScaleLimits, updatedScaleLimits)) {
      originalScaleLimits[scale.id] = {
        min: {scale: scale.min, options: scale.options.min},
        max: {scale: scale.max, options: scale.options.max},
      };
    }
  });

  removeMissingScales(originalScaleLimits, scales);
  removeMissingScales(updatedScaleLimits, scales);
  return originalScaleLimits;
}

function doZoom(scale, amount, center, limits) {
  const fn = zoomFunctions[scale.type] || zoomFunctions.default;
  call(fn, [scale, amount, center, limits]);
}

function doZoomRect(scale, from, to, limits) {
  const fn = zoomRectFunctions[scale.type] || zoomRectFunctions.default;
  call(fn, [scale, from, to, limits]);
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
 * @param {string} [transition] Which transition mode to use. Defaults to 'none'
 */
export function zoom(chart, amount, transition = 'none') {
  const {x = 1, y = 1, focalPoint = getCenter(chart)} = typeof amount === 'number' ? {x: amount, y: amount} : amount;
  const state = getState(chart);
  const {options: {limits, zoom: zoomOptions}} = state;

  storeOriginalScaleLimits(chart, state);

  const xEnabled = x !== 1;
  const yEnabled = y !== 1;
  const enabledScales = getEnabledScalesByPoint(zoomOptions, focalPoint, chart);

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

export function zoomRect(chart, p0, p1, transition = 'none') {
  const state = getState(chart);
  const {options: {limits, zoom: zoomOptions}} = state;
  const {mode = 'xy'} = zoomOptions;

  storeOriginalScaleLimits(chart, state);
  const xEnabled = directionEnabled(mode, 'x', chart);
  const yEnabled = directionEnabled(mode, 'y', chart);

  each(chart.scales, function(scale) {
    if (scale.isHorizontal() && xEnabled) {
      doZoomRect(scale, p0.x, p1.x, limits);
    } else if (!scale.isHorizontal() && yEnabled) {
      doZoomRect(scale, p0.y, p1.y, limits);
    }
  });

  chart.update(transition);

  call(zoomOptions.onZoom, [{chart}]);
}

export function zoomScale(chart, scaleId, range, transition = 'none') {
  const state = getState(chart);
  storeOriginalScaleLimits(chart, state);
  const scale = chart.scales[scaleId];
  updateRange(scale, range, undefined, true);
  chart.update(transition);

  call(state.options.zoom?.onZoom, [{chart}]);
}

export function resetZoom(chart, transition = 'default') {
  const state = getState(chart);
  const originalScaleLimits = storeOriginalScaleLimits(chart, state);

  each(chart.scales, function(scale) {
    const scaleOptions = scale.options;
    if (originalScaleLimits[scale.id]) {
      scaleOptions.min = originalScaleLimits[scale.id].min.options;
      scaleOptions.max = originalScaleLimits[scale.id].max.options;
    } else {
      delete scaleOptions.min;
      delete scaleOptions.max;
    }
    delete state.updatedScaleLimits[scale.id];
  });
  chart.update(transition);

  call(state.options.zoom.onZoomComplete, [{chart}]);
}

function getOriginalRange(state, scaleId) {
  const original = state.originalScaleLimits[scaleId];
  if (!original) {
    return;
  }
  const {min, max} = original;
  return valueOrDefault(max.options, max.scale) - valueOrDefault(min.options, min.scale);
}

export function getZoomLevel(chart) {
  const state = getState(chart);
  let min = 1;
  let max = 1;
  each(chart.scales, function(scale) {
    const origRange = getOriginalRange(state, scale.id);
    if (origRange) {
      const level = Math.round(origRange / (scale.max - scale.min) * 100) / 100;
      min = Math.min(min, level);
      max = Math.max(max, level);
    }
  });
  return min < 1 ? min : max;
}

function panScale(scale, delta, limits, state) {
  const {panDelta} = state;
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
  const state = getState(chart);
  const {options: {pan: panOptions, limits}} = state;
  const {onPan} = panOptions || {};

  storeOriginalScaleLimits(chart, state);

  const xEnabled = x !== 0;
  const yEnabled = y !== 0;

  each(enabledScales || chart.scales, function(scale) {
    if (scale.isHorizontal() && xEnabled) {
      panScale(scale, x, limits, state);
    } else if (!scale.isHorizontal() && yEnabled) {
      panScale(scale, y, limits, state);
    }
  });

  chart.update(transition);

  call(onPan, [{chart}]);
}

export function getInitialScaleBounds(chart) {
  const state = getState(chart);
  storeOriginalScaleLimits(chart, state);
  const scaleBounds = {};
  for (const scaleId of Object.keys(chart.scales)) {
    const {min, max} = state.originalScaleLimits[scaleId] || {min: {}, max: {}};
    scaleBounds[scaleId] = {min: min.scale, max: max.scale};
  }

  return scaleBounds;
}

export function getZoomedScaleBounds(chart) {
  const state = getState(chart);
  const scaleBounds = {};
  for (const scaleId of Object.keys(chart.scales)) {
    scaleBounds[scaleId] = state.updatedScaleLimits[scaleId];
  }

  return scaleBounds;
}

export function isZoomedOrPanned(chart) {
  const scaleBounds = getInitialScaleBounds(chart);
  for (const scaleId of Object.keys(chart.scales)) {
    const {min: originalMin, max: originalMax} = scaleBounds[scaleId];

    if (originalMin !== undefined && chart.scales[scaleId].min !== originalMin) {
      return true;
    }

    if (originalMax !== undefined && chart.scales[scaleId].max !== originalMax) {
      return true;
    }
  }

  return false;
}

export function isZoomingOrPanning(chart) {
  const state = getState(chart);
  return state.panning || state.dragging;
}
