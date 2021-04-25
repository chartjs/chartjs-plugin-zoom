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
 * @param {object} [options] The zoom options
 * @param {boolean} [useTransition] Whether to use `zoom` transition
 */
export function doZoom(chart, zoom, options = {}, useTransition) {
  const {x = 1, y = 1, focalPoint = getCenter(chart)} = typeof zoom === 'number' ? {x: zoom, y: zoom} : zoom;
  const {mode = 'xy', overScaleMode} = options;

  storeOriginalScaleLimits(chart);

  const xEnabled = x !== 1 && directionEnabled(mode, 'x', chart);
  const yEnabled = y !== 1 && directionEnabled(mode, 'y', chart);
  const enabledScales = overScaleMode && getEnabledScalesByPoint(overScaleMode, focalPoint, chart);

  each(enabledScales || chart.scales, function(scale) {
    if (scale.isHorizontal() && xEnabled) {
      zoomScale(scale, x, focalPoint, options);
    } else if (!scale.isHorizontal() && yEnabled) {
      zoomScale(scale, y, focalPoint, options);
    }
  });

  chart.update(useTransition ? 'zoom' : 'none');

  call(options.onZoom, [chart]);
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

export function doPan(chart, pan, options = {}, enabledScales) {
  const {x = 0, y = 0} = typeof pan === 'number' ? {x: pan, y: pan} : pan;
  const {mode = 'xy', onPan} = options;

  storeOriginalScaleLimits(chart);

  const xEnabled= x !== 0 && directionEnabled(mode, 'x', chart);
  const yEnabled = y !== 0 && directionEnabled(mode, 'y', chart);

  each(enabledScales || chart.scales, function(scale) {
    if (scale.isHorizontal() && xEnabled) {
      panScale(scale, x, options);
    } else if (!scale.isHorizontal() && yEnabled) {
      panScale(scale, y, options);
    }
  });

  chart.update('none');

  call(onPan, [chart]);
}

