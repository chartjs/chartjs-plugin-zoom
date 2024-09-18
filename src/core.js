import { each, callback as call, sign, valueOrDefault } from 'chart.js/helpers';
import { panFunctions, updateRange, zoomFunctions, zoomRectFunctions } from './scale.types';
import { getState } from './state';
import { directionEnabled, getEnabledScalesByPoint } from './utils';

function shouldUpdateScaleLimits(scale, originalLimits, updatedLimits) {
  const { id, options: { min, max } } = scale;
  const { min: prevMin, max: prevMax } = updatedLimits[id] || {};
  return !originalLimits[id] || !updatedLimits[id] || prevMin !== min || prevMax !== max;
}

function removeMissingScales(limits, scales) {
  Object.keys(limits).forEach(key => {
    if (!scales[key]) delete limits[key];
  });
}

function storeOriginalScaleLimits(chart, state) {
  const { scales } = chart;
  const { originalScaleLimits, updatedScaleLimits } = state;

  Object.values(scales).forEach(({ id, min, max, options }) => {
    if (shouldUpdateScaleLimits({ id, options }, originalScaleLimits, updatedScaleLimits)) {
      originalScaleLimits[id] = { min: { scale: min, options: options.min }, max: { scale: max, options: options.max } };
    }
  });

  [originalScaleLimits, updatedScaleLimits].forEach(limits => removeMissingScales(limits, scales));
  return originalScaleLimits;
}

function doZoom(scale, amount, center, limits) {
  (zoomFunctions[scale.type] || zoomFunctions.default)?.(scale, amount, center, limits);
}

function doZoomRect(scale, amount, from, to, limits) {
  (zoomRectFunctions[scale.type] || zoomRectFunctions.default)?.(scale, amount, from, to, limits);
}

function getCenter({ chartArea: { left, right, top, bottom } }) {
  return { x: (left + right) / 2, y: (top + bottom) / 2 };
}

export function zoom(chart, amount, transition = 'none') {
  const { x = 1, y = 1, focalPoint = getCenter(chart) } = typeof amount === 'number' ? { x: amount, y: amount } : amount;
  const state = getState(chart);
  const { options: { limits, zoom: zoomOptions } } = state;

  storeOriginalScaleLimits(chart, state);

  const xEnabled = x !== 1;
  const yEnabled = y !== 1;
  const enabledScales = getEnabledScalesByPoint(zoomOptions, focalPoint, chart);

  each(enabledScales || Object.values(chart.scales), scale => {
    if (scale.isHorizontal() && xEnabled) {
      doZoom(scale, x, focalPoint, limits);
    } else if (!scale.isHorizontal() && yEnabled) {
      doZoom(scale, y, focalPoint, limits);
    }
  });

  chart.update(transition);
  call(zoomOptions.onZoom, [{ chart }]);
}

export function zoomRect(chart, { x: x0, y: y0 }, { x: x1, y: y1 }, transition = 'none') {
  const { options: { limits, zoom: { mode = 'xy', onZoom } } } = getState(chart);

  storeOriginalScaleLimits(chart, getState(chart));

  Object.values(chart.scales).forEach(scale => {
    const isHorizontal = scale.isHorizontal();
    if ((isHorizontal && directionEnabled(mode, 'x', chart)) || 
        (!isHorizontal && directionEnabled(mode, 'y', chart))) {
      doZoomRect(scale, isHorizontal ? x0 : y0, isHorizontal ? x1 : y1, limits);
    }
  });

  chart.update(transition);
  if (onZoom) call(onZoom, [{ chart }]);
}

export function zoomScale(chart, scaleId, range, transition = 'none') {
  storeOriginalScaleLimits(chart, getState(chart));
  const scale = chart.scales[scaleId];
  updateRange(scale, range, undefined, true);
  chart.update(transition);
}

export function resetZoom(chart, transition = 'default') {
  const state = getState(chart);
  const { options: { zoom: { onZoomComplete } } } = state;
  const originalLimits = storeOriginalScaleLimits(chart, state);

  Object.values(chart.scales).forEach(({ id, options }) => {
    const { min, max } = originalLimits[id] || {};
    options.min = min?.options;
    options.max = max?.options;
    if (!min) delete options.min;
    if (!max) delete options.max;
  });

  chart.update(transition);
  if (onZoomComplete) call(onZoomComplete, [{ chart }]);
}

function getOriginalRange(state, scaleId) {
  const { min, max } = state.originalScaleLimits[scaleId] || {};
  return min && max ? valueOrDefault(max.options, max.scale) - valueOrDefault(min.options, min.scale) : undefined;
}

export function getZoomLevel(chart) {
  const state = getState(chart);

  return Object.values(chart.scales).reduce((acc, scale) => {
    const origRange = getOriginalRange(state, scale.id);
    if (origRange) {
      const level = Math.round(origRange / (scale.max - scale.min) * 100) / 100;
      acc.min = Math.min(acc.min, level);
      acc.max = Math.max(acc.max, level);
    }
    return acc;
  }, { min: 1, max: 1 });
}

function panScale(scale, delta, limits, { panDelta }) {
  const storedDelta = panDelta[scale.id] || 0;
  delta += (sign(storedDelta) === sign(delta)) ? storedDelta : 0;
  const fn = panFunctions[scale.type] || panFunctions.default;
  panDelta[scale.id] = call(fn, [scale, delta, limits]) ? 0 : delta;
}

export function pan(chart, delta, enabledScales, transition = 'none') {
  const { x = 0, y = 0 } = typeof delta === 'number' ? { x: delta, y: delta } : delta;
  const state = getState(chart);
  const { options: { pan: { onPan } = {}, limits }, scales } = state;

  storeOriginalScaleLimits(chart, state);

  (enabledScales || Object.values(scales)).forEach(scale => {
    const value = scale.isHorizontal() ? x : y;
    if (value) panScale(scale, value, limits, state);
  });

  chart.update(transition);
  onPan && call(onPan, [{ chart }]);
}


export function getInitialScaleBounds(chart) {
  const { originalScaleLimits } = getState(chart);
  storeOriginalScaleLimits(chart, getState(chart));

  return Object.keys(chart.scales).reduce((bounds, scaleId) => {
    const { min: { scale: minScale } = {}, max: { scale: maxScale } = {} } = originalScaleLimits[scaleId] || {};
    bounds[scaleId] = { min: minScale, max: maxScale };
    return bounds;
  }, {});
}

export function isZoomedOrPanned(chart) {
  const scaleBounds = getInitialScaleBounds(chart);

  return Object.entries(chart.scales).some(([scaleId, { min, max }]) => {
    const { min: originalMin, max: originalMax } = scaleBounds[scaleId];
    return min !== originalMin || max !== originalMax;
  });
}