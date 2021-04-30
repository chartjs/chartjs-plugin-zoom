import {directionEnabled, debounce} from './utils';
import {zoom} from './core';
import {callback as call} from 'chart.js/helpers';
import {getState} from './state';

function removeHandler(chart, target, type) {
  const {handlers} = getState(chart);
  const handler = handlers[type];
  if (handler) {
    target.removeEventListener(type, handler);
    delete handlers[type];
  }
}

function addHandler(chart, target, type, handler) {
  const {handlers, options} = getState(chart);
  removeHandler(chart, target, type);
  handlers[type] = (event) => handler(chart, event, options);
  target.addEventListener(type, handlers[type]);
}

export function mouseMove(chart, event) {
  const state = getState(chart);
  if (state.dragStart) {
    state.dragEnd = event;
    chart.update('none');
  }
}

export function mouseDown(chart, event) {
  const state = getState(chart);
  state.dragStart = event;

  addHandler(chart, chart.canvas, 'mousemove', mouseMove);
}

export function computeDragRect(chart, mode, beginPoint, endPoint) {
  const {left: offsetX, top: offsetY} = beginPoint.target.getBoundingClientRect();
  const xEnabled = directionEnabled(mode, 'x', chart);
  const yEnabled = directionEnabled(mode, 'y', chart);
  let {top, left, right, bottom, width: chartWidth, height: chartHeight} = chart.chartArea;

  if (xEnabled) {
    left = Math.min(beginPoint.clientX, endPoint.clientX) - offsetX;
    right = Math.max(beginPoint.clientX, endPoint.clientX) - offsetX;
  }

  if (yEnabled) {
    top = Math.min(beginPoint.clientY, endPoint.clientY) - offsetY;
    bottom = Math.max(beginPoint.clientY, endPoint.clientY) - offsetY;
  }
  const width = right - left;
  const height = bottom - top;

  return {
    left,
    top,
    right,
    bottom,
    width,
    height,
    zoomX: xEnabled && width ? 1 + ((chartWidth - width) / chartWidth) : 1,
    zoomY: yEnabled && height ? 1 + ((chartHeight - height) / chartHeight) : 1
  };
}

export function mouseUp(chart, event) {
  const state = getState(chart);
  if (!state.dragStart) {
    return;
  }

  removeHandler(chart.canvas, 'mousemove', chart);
  const zoomOptions = state.options.zoom;
  const rect = computeDragRect(chart, zoomOptions.mode, state.dragStart, event);
  const {width: dragDistanceX, height: dragDistanceY} = rect;

  // Remove drag start and end before chart update to stop drawing selected area
  state.dragStart = null;
  state.dragEnd = null;

  const zoomThreshold = zoomOptions.threshold || 0;
  if (dragDistanceX <= zoomThreshold && dragDistanceY <= zoomThreshold) {
    return;
  }

  const {top, left, width, height} = chart.chartArea;
  const amount = {
    x: rect.zoomX,
    y: rect.zoomY,
    focalPoint: {
      x: (rect.left - left) / (1 - dragDistanceX / width) + left,
      y: (rect.top - top) / (1 - dragDistanceY / height) + top
    }
  };
  zoom(chart, amount, 'zoom');

  call(zoomOptions.onZoomComplete, [chart]);
}

export function wheel(chart, event) {
  const {handlers, options: {zoom: zoomOptions}} = getState(chart);
  const {wheelModifierKey, onZoomRejected, onZoomComplete} = zoomOptions;

  // Before preventDefault, check if the modifier key required and pressed
  if (wheelModifierKey && !event[wheelModifierKey + 'Key']) {
    return call(onZoomRejected, [{chart, event}]);
  }

  // Prevent the event from triggering the default behavior (eg. Content scrolling).
  if (event.cancelable) {
    event.preventDefault();
  }

  // Firefox always fires the wheel event twice:
  // First without the delta and right after that once with the delta properties.
  if (event.deltaY === undefined) {
    return;
  }

  const rect = event.target.getBoundingClientRect();
  const speed = 1 + (event.deltaY >= 0 ? -zoomOptions.speed : zoomOptions.speed);
  const amount = {
    x: speed,
    y: speed,
    focalPoint: {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  };

  zoom(chart, amount);

  if (onZoomComplete) {
    const handler = handlers.onzc || (handlers.onzc = debounce(() => call(onZoomComplete, [{chart}]), 250));
    handler();
  }
}

export function addListeners(chart, options) {
  const canvas = chart.canvas;

  // Install listeners. Do this dynamically based on options so that we can turn zoom on and off
  // We also want to make sure listeners aren't always on. E.g. if you're scrolling down a page
  // and the mouse goes over a chart you don't want it intercepted unless the plugin is enabled
  const zoomEnabled = options.zoom && options.zoom.enabled;
  const dragEnabled = options.zoom.drag;
  if (zoomEnabled && !dragEnabled) {
    addHandler(chart, canvas, 'wheel', wheel);
  } else {
    removeHandler(chart, canvas, 'wheel');
  }
  if (zoomEnabled && dragEnabled) {
    addHandler(chart, canvas, 'mousedown', mouseDown);
    addHandler(chart, canvas.ownerDocument, 'mouseup', mouseUp);
  } else {
    removeHandler(chart, canvas, 'mousedown');
    removeHandler(chart, canvas, 'mousemove');
    removeHandler(chart, canvas.ownerDocument, 'mouseup');
  }
}

export function removeListeners(chart) {
  const {canvas} = chart;
  if (!canvas) {
    return;
  }
  removeHandler(chart, canvas, 'mousedown');
  removeHandler(chart, canvas, 'mousemove');
  removeHandler(chart, canvas.ownerDocument, 'mouseup');
  removeHandler(chart, canvas, 'wheel');
  removeHandler(chart, canvas, 'click');
}
