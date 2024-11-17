import {almostEquals, valueOrDefault} from 'chart.js/helpers';
import {getState} from './state';

/**
 * @typedef {import('chart.js').Point} Point
 * @typedef {import('chart.js').Scale} Scale
 * @typedef {import('../types/options').LimitOptions} LimitOptions
 * @typedef {{min: number, max: number}} ScaleRange
 * @typedef {import('../types/options').ScaleLimits} ScaleLimits
 */

/**
 *
 * @param {number} val
 * @param {number} min
 * @param {number} range
 * @param {number} newRange
 * @returns {ScaleRange}
 */
function zoomDelta(val, min, range, newRange) {
  const minPercent = Math.max(0, Math.min(1, (val - min) / range || 0));
  const maxPercent = 1 - minPercent;

  return {
    min: newRange * minPercent,
    max: newRange * maxPercent
  };
}

/**
 * @param {Scale} scale
 * @param {Point} point
 * @returns number | undefined
 */
function getValueAtPoint(scale, point) {
  const pixel = scale.isHorizontal() ? point.x : point.y;

  return scale.getValueForPixel(pixel);
}

/**
 * @param {Scale} scale
 * @param {number} zoom
 * @param {Point} center
 * @returns {ScaleRange}
 */
function linearZoomDelta(scale, zoom, center) {
  const range = scale.max - scale.min;
  const newRange = range * (zoom - 1);
  const centerValue = getValueAtPoint(scale, center);

  return zoomDelta(centerValue, scale.min, range, newRange);
}

/**
 * @param {Scale} scale
 * @param {number} zoom
 * @param {Point} center
 * @returns {ScaleRange}
 */
function logarithmicZoomRange(scale, zoom, center) {
  const centerValue = getValueAtPoint(scale, center);

  // Return the original range, if value could not be determined.
  if (centerValue === undefined) {
    return {min: scale.min, max: scale.max};
  }

  const logMin = Math.log10(scale.min);
  const logMax = Math.log10(scale.max);
  const logCenter = Math.log10(centerValue);
  const logRange = logMax - logMin;
  const newLogRange = logRange * (zoom - 1);
  const delta = zoomDelta(logCenter, logMin, logRange, newLogRange);

  return {
    min: Math.pow(10, logMin + delta.min),
    max: Math.pow(10, logMax - delta.max),
  };
}

/**
 * @param {Scale} scale
 * @param {LimitOptions|undefined} limits
 * @returns {ScaleLimits}
 */
function getScaleLimits(scale, limits) {
  return limits && (limits[scale.id] || limits[scale.axis]) || {};
}

function getLimit(state, scale, scaleLimits, prop, fallback) {
  let limit = scaleLimits[prop];
  if (limit === 'original') {
    const original = state.originalScaleLimits[scale.id][prop];
    limit = valueOrDefault(original.options, original.scale);
  }
  return valueOrDefault(limit, fallback);
}

/**
 * @param {Scale} scale
 * @param {number} pixel0
 * @param {number} pixel1
 * @returns {ScaleRange}
 */
function linearRange(scale, pixel0, pixel1) {
  const v0 = scale.getValueForPixel(pixel0);
  const v1 = scale.getValueForPixel(pixel1);
  return {
    min: Math.min(v0, v1),
    max: Math.max(v0, v1)
  };
}

/**
 * @param {number} range
 * @param {{ min: number; max: number; minLimit: number; maxLimit: number; }} options
 * @param {{ min: { scale?: number; options?: number; }; max: { scale?: number; options?: number; }}} [originalLimits]
 */
function fixRange(range, {min, max, minLimit, maxLimit}, originalLimits) {
  const offset = (range - max + min) / 2;
  min -= offset;
  max += offset;

  // In case the values are really close to the original values, use the original values.
  const origMin = originalLimits.min.options ?? originalLimits.min.scale;
  const origMax = originalLimits.max.options ?? originalLimits.max.scale;

  const epsilon = range / 1e6;
  if (almostEquals(min, origMin, epsilon)) {
    min = origMin;
  }
  if (almostEquals(max, origMax, epsilon)) {
    max = origMax;
  }

  // Apply limits
  if (min < minLimit) {
    min = minLimit;
    max = Math.min(minLimit + range, maxLimit);
  } else if (max > maxLimit) {
    max = maxLimit;
    min = Math.max(maxLimit - range, minLimit);
  }

  return {min, max};
}

/**
 * @param {Scale} scale
 * @param {ScaleRange} minMax
 * @param {LimitOptions} [limits]
 * @param {boolean|'pan'} [zoom]
 * @returns {boolean}
 */
export function updateRange(scale, {min, max}, limits, zoom = false) {
  const state = getState(scale.chart);
  const {options: scaleOpts} = scale;

  const scaleLimits = getScaleLimits(scale, limits);
  const {minRange = 0} = scaleLimits;
  const minLimit = getLimit(state, scale, scaleLimits, 'min', -Infinity);
  const maxLimit = getLimit(state, scale, scaleLimits, 'max', Infinity);

  if (zoom === 'pan' && (min < minLimit || max > maxLimit)) {
    // At limit: No change but return true to indicate no need to store the delta.
    return true;
  }

  const scaleRange = scale.max - scale.min;
  const range = zoom ? Math.max(max - min, minRange) : scaleRange;

  if (zoom && range === minRange && scaleRange <= minRange) {
    // At range limit: No change but return true to indicate no need to store the delta.
    return true;
  }

  const newRange = fixRange(range, {min, max, minLimit, maxLimit}, state.originalScaleLimits[scale.id]);

  scaleOpts.min = newRange.min;
  scaleOpts.max = newRange.max;

  state.updatedScaleLimits[scale.id] = newRange;

  // return true if the scale range is changed
  return scale.parse(newRange.min) !== scale.min || scale.parse(newRange.max) !== scale.max;
}

function zoomNumericalScale(scale, zoom, center, limits) {
  const delta = linearZoomDelta(scale, zoom, center);
  const newRange = {min: scale.min + delta.min, max: scale.max - delta.max};
  return updateRange(scale, newRange, limits, true);
}

function zoomLogarithmicScale(scale, zoom, center, limits) {
  const newRange = logarithmicZoomRange(scale, zoom, center);
  return updateRange(scale, newRange, limits, true);
}

/**
 * @param {Scale} scale
 * @param {number} from
 * @param {number} to
 * @param {LimitOptions} [limits]
 */
function zoomRectNumericalScale(scale, from, to, limits) {
  updateRange(scale, linearRange(scale, from, to), limits, true);
}

const integerChange = (v) => v === 0 || isNaN(v) ? 0 : v < 0 ? Math.min(Math.round(v), -1) : Math.max(Math.round(v), 1);

function existCategoryFromMaxZoom(scale) {
  const labels = scale.getLabels();
  const maxIndex = labels.length - 1;

  if (scale.min > 0) {
    scale.min -= 1;
  }
  if (scale.max < maxIndex) {
    scale.max += 1;
  }
}

function zoomCategoryScale(scale, zoom, center, limits) {
  const delta = linearZoomDelta(scale, zoom, center);
  if (scale.min === scale.max && zoom < 1) {
    existCategoryFromMaxZoom(scale);
  }
  const newRange = {min: scale.min + integerChange(delta.min), max: scale.max - integerChange(delta.max)};
  return updateRange(scale, newRange, limits, true);
}

function scaleLength(scale) {
  return scale.isHorizontal() ? scale.width : scale.height;
}

function panCategoryScale(scale, delta, limits) {
  const labels = scale.getLabels();
  const lastLabelIndex = labels.length - 1;
  let {min, max} = scale;
  // The visible range. Ticks can be skipped, and thus not reliable.
  const range = Math.max(max - min, 1);
  // How many pixels of delta is required before making a step. stepSize, but limited to max 1/10 of the scale length.
  const stepDelta = Math.round(scaleLength(scale) / Math.max(range, 10));
  const stepSize = Math.round(Math.abs(delta / stepDelta));
  let applied;
  if (delta < -stepDelta) {
    max = Math.min(max + stepSize, lastLabelIndex);
    min = range === 1 ? max : max - range;
    applied = max === lastLabelIndex;
  } else if (delta > stepDelta) {
    min = Math.max(0, min - stepSize);
    max = range === 1 ? min : min + range;
    applied = min === 0;
  }

  return updateRange(scale, {min, max}, limits) || applied;
}

const OFFSETS = {
  second: 500, // 500 ms
  minute: 30 * 1000, // 30 s
  hour: 30 * 60 * 1000, // 30 m
  day: 12 * 60 * 60 * 1000, // 12 h
  week: 3.5 * 24 * 60 * 60 * 1000, // 3.5 d
  month: 15 * 24 * 60 * 60 * 1000, // 15 d
  quarter: 60 * 24 * 60 * 60 * 1000, // 60 d
  year: 182 * 24 * 60 * 60 * 1000 // 182 d
};

function panNumericalScale(scale, delta, limits, pan = false) {
  const {min: prevStart, max: prevEnd, options} = scale;
  const round = options.time && options.time.round;
  const offset = OFFSETS[round] || 0;
  const newMin = scale.getValueForPixel(scale.getPixelForValue(prevStart + offset) - delta);
  const newMax = scale.getValueForPixel(scale.getPixelForValue(prevEnd + offset) - delta);
  if (isNaN(newMin) || isNaN(newMax)) {
    // NaN can happen for 0-dimension scales (either because they were configured
    // with min === max or because the chart has 0 plottable area).
    return true;
  }
  return updateRange(scale, {min: newMin, max: newMax}, limits, pan ? 'pan' : false);
}

function panNonLinearScale(scale, delta, limits) {
  return panNumericalScale(scale, delta, limits, true);
}

export const zoomFunctions = {
  category: zoomCategoryScale,
  default: zoomNumericalScale,
  logarithmic: zoomLogarithmicScale,
};

export const zoomRectFunctions = {
  default: zoomRectNumericalScale,
};

export const panFunctions = {
  category: panCategoryScale,
  default: panNumericalScale,
  logarithmic: panNonLinearScale,
  timeseries: panNonLinearScale,
};
