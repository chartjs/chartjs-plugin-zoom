import {each} from 'chart.js/helpers';

export const getModifierKey = opts => opts && opts.enabled && opts.modifierKey;
export const keyPressed = (key, event) => key && event[key + 'Key'];
export const keyNotPressed = (key, event) => key && !event[key + 'Key'];

/**
 * @param {string|function} mode can be 'x', 'y' or 'xy'
 * @param {string} dir can be 'x' or 'y'
 * @param {import('chart.js').Chart} chart instance of the chart in question
 * @returns {boolean}
 */
export function directionEnabled(mode, dir, chart) {
  if (mode === undefined) {
    return true;
  } else if (typeof mode === 'string') {
    return mode.indexOf(dir) !== -1;
  } else if (typeof mode === 'function') {
    return mode({chart}).indexOf(dir) !== -1;
  }

  return false;
}

function directionsEnabled(mode, chart) {
  if (typeof mode === 'function') {
    mode = mode({chart});
  }
  if (typeof mode === 'string') {
    return {x: mode.indexOf('x') !== -1, y: mode.indexOf('y') !== -1};
  }

  return {x: false, y: false};
}

/**
 * Debounces calling `fn` for `delay` ms
 * @param {function} fn - Function to call. No arguments are passed.
 * @param {number} delay - Delay in ms. 0 = immediate invocation.
 * @returns {function}
 */
export function debounce(fn, delay) {
  let timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
    return delay;
  };
}

/**
 * Checks which axis is under the mouse cursor.
 * @param {{x: number, y: number}} point - the mouse location
 * @param {import('chart.js').Chart} [chart] instance of the chart in question
 * @return {import('chart.js').Scale}
 */
function getScaleUnderPoint({x, y}, chart) {
  const scales = chart.scales;
  const scaleIds = Object.keys(scales);
  for (let i = 0; i < scaleIds.length; i++) {
    const scale = scales[scaleIds[i]];
    if (y >= scale.top && y <= scale.bottom && x >= scale.left && x <= scale.right) {
      return scale;
    }
  }
  return null;
}

/**
 * Evaluate the chart's mode, scaleMode, and overScaleMode properties to
 * determine which axes are eligible for scaling.
 * options.overScaleMode can be a function if user want zoom only one scale of many for example.
 * @param options - Zoom or pan options
 * @param {{x: number, y: number}} point - the mouse location
 * @param {import('chart.js').Chart} [chart] instance of the chart in question
 * @return {import('chart.js').Scale[]}
 */
export function getEnabledScalesByPoint(options, point, chart) {
  const {mode = 'xy', scaleMode, overScaleMode} = options || {};
  const scale = getScaleUnderPoint(point, chart);

  const enabled = directionsEnabled(mode, chart);
  const scaleEnabled = directionsEnabled(scaleMode, chart);

  // Convert deprecated overScaleEnabled to new scaleEnabled.
  if (overScaleMode) {
    const overScaleEnabled = directionsEnabled(overScaleMode, chart);
    for (const axis of ['x', 'y']) {
      if (overScaleEnabled[axis]) {
        scaleEnabled[axis] = enabled[axis];
        enabled[axis] = false;
      }
    }
  }

  if (scale && scaleEnabled[scale.axis]) {
    return [scale];
  }

  const enabledScales = [];
  each(chart.scales, function(scaleItem) {
    if (enabled[scaleItem.axis]) {
      enabledScales.push(scaleItem);
    }
  });
  return enabledScales;
}
