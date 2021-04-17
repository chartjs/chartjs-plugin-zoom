const chartStates = new WeakMap();

export function getState(chart) {
  let state = chartStates.get(chart);
  if (!state) {
    state = {
      originalScaleLimits: {},
      handlers: {},
    };
    chartStates.set(chart, state);
  }
  return state;
}

export function removeState(chart) {
  chartStates.delete(chart);
}
