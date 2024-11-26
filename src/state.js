/**
 * @typedef {import("chart.js").Chart} Chart
 * @typedef {{originalScaleLimits: any; updatedScaleLimits: any; handlers: any; panDelta: any; dragging: boolean; panning: boolean; options?: import("../types/options").ZoomPluginOptions, dragStart?: any, dragEnd?: any, filterNextClick?: boolean}} ZoomPluginState
 */

/**
 * @type WeakMap<Chart, ZoomPluginState>
 */
const chartStates = new WeakMap();

/**
 * @param {import("chart.js").Chart} chart
 * @returns {ZoomPluginState}
 */
export function getState(chart) {
  let state = chartStates.get(chart);
  if (!state) {
    state = {
      originalScaleLimits: {},
      updatedScaleLimits: {},
      handlers: {},
      panDelta: {},
      dragging: false,
      panning: false
    };
    chartStates.set(chart, state);
  }
  return state;
}

export function removeState(chart) {
  chartStates.delete(chart);
}
