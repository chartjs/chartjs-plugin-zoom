import {directionEnabled, debounce} from './utils';
import {doZoom} from './core';
import {callback as call} from 'chart.js/helpers';

function removeHandler(target, type, chart) {
  const props = chart.$zoom;
  const handlers = props._handlers || (props._handlers = {});
  const handler = handlers[type];
  if (handler) {
    target.removeEventListener(type, handler);
    delete handlers[type];
  }
}

function addHandler(target, type, handler, {chart, options}) {
  const props = chart.$zoom;
  const handlers = props._handlers || (props._handlers = {});
  removeHandler(target, type, chart);
  handlers[type] = (event) => handler(chart, event, options);
  target.addEventListener(type, handlers[type]);
}

export function mouseMove(chart, event) {
  if (chart.$zoom._dragZoomStart) {
    chart.$zoom._dragZoomEnd = event;
    chart.update('none');
  }
}

export function mouseDown(chart, event, options) {
  addHandler(chart.canvas, 'mousemove', mouseMove, {chart, options});
  chart.$zoom._dragZoomStart = event;
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

export function mouseUp(chart, event, options) {
  if (!chart.$zoom || !chart.$zoom._dragZoomStart) {
    return;
  }

  const zoomOptions = options.zoom;
  removeHandler(chart.canvas, 'mousemove', chart);

  const props = chart.$zoom;
  const beginPoint = props._dragZoomStart;
  const rect = computeDragRect(chart, zoomOptions.mode, beginPoint, event);
  const {width: dragDistanceX, height: dragDistanceY} = rect;

  // Remove drag start and end before chart update to stop drawing selected area
  props._dragZoomStart = null;
  props._dragZoomEnd = null;

  const zoomThreshold = zoomOptions.threshold || 0;
  if (dragDistanceX <= zoomThreshold && dragDistanceY <= zoomThreshold) {
    return;
  }

  const {top, left, width, height} = chart.chartArea;
  const focalPoint = {
    x: (rect.left - left) / (1 - dragDistanceX / width) + left,
    y: (rect.top - top) / (1 - dragDistanceY / height) + top
  };
  doZoom(chart, rect.zoomX, rect.zoomY, focalPoint, zoomOptions, undefined, true);

  call(zoomOptions.onZoomComplete, [chart]);
}

export function wheel(chart, event, options) {
  const zoomOptions = options.zoom;
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
  if (typeof event.deltaY === 'undefined') {
    return;
  }

  const rect = event.target.getBoundingClientRect();
  const speed = 1 + (event.deltaY >= 0 ? -zoomOptions.speed : zoomOptions.speed);
  const center = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };

  doZoom(chart, speed, speed, center, zoomOptions);

  if (onZoomComplete) {
    debounce(() => call(onZoomComplete, [{chart}]), 250);
  }
}

export function addListeners(chart, options) {
  const props = chart.$zoom;
  const canvas = chart.canvas;

  // Install listeners. Do this dynamically based on options so that we can turn zoom on and off
  // We also want to make sure listeners aren't always on. E.g. if you're scrolling down a page
  // and the mouse goes over a chart you don't want it intercepted unless the plugin is enabled
  const zoomEnabled = options.zoom && options.zoom.enabled;
  const dragEnabled = options.zoom.drag;
  if (zoomEnabled && !dragEnabled) {
    addHandler(canvas, 'wheel', wheel, {chart, options});
  } else if (props._wheelHandler) {
    removeHandler(canvas, 'wheel', chart);
  }
  if (zoomEnabled && dragEnabled) {
    addHandler(canvas, 'mousedown', mouseDown, {chart, options});
    addHandler(canvas.ownerDocument, 'mouseup', mouseUp, {chart, options});
  } else {
    removeHandler(canvas, 'mousedown', chart);
    removeHandler(canvas, 'mousemove', chart);
    removeHandler(canvas.ownerDocument, 'mouseup', chart);
  }
}

export function removeListeners(chart) {
  const {canvas, $zoom: props} = chart;
  if (!canvas || !props) {
    return;
  }
  removeHandler(canvas, 'mousedown', chart);
  removeHandler(canvas, 'mousemove', chart);
  removeHandler(canvas.ownerDocument, 'mouseup', chart);
  removeHandler(canvas, 'wheel', chart);
  removeHandler(canvas, 'click', chart);
}
