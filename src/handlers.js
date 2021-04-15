import {directionEnabled, debounce} from './utils';
import {doZoom} from './core';
import {callback as call} from 'chart.js/helpers';

function remove(target, type, chart) {
  const props = chart.$zoom;
  const handlers = props._handlers || (props._handlers = {});
  const handler = handlers[type];
  if (handler) {
    target.removeEventListener(type, handler);
    delete handlers[type];
  }
}

function add(target, type, handler, {chart, options}) {
  const props = chart.$zoom;
  const handlers = props._handlers || (props._handlers = {});
  remove(target, type, chart);
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
  add(chart.canvas, 'mousemove', mouseMove, {chart, options});
  chart.$zoom._dragZoomStart = event;
}

export function mouseUp(chart, event, options) {
  if (!chart.$zoom || !chart.$zoom._dragZoomStart) {
    return;
  }

  const zoomOptions = options.zoom;
  remove(chart.canvas, 'mousemove', chart);

  const beginPoint = chart.$zoom._dragZoomStart;

  const {left: offsetX, top: offsetY} = beginPoint.target.getBoundingClientRect();

  const startX = Math.min(beginPoint.clientX, event.clientX) - offsetX;
  const endX = Math.max(beginPoint.clientX, event.clientX) - offsetX;

  const startY = Math.min(beginPoint.clientY, event.clientY) - offsetY;
  const endY = Math.max(beginPoint.clientY, event.clientY) - offsetY;

  const dragDistanceX = endX - startX;
  const dragDistanceY = endY - startY;

  // Remove drag start and end before chart update to stop drawing selected area
  chart.$zoom._dragZoomStart = null;
  chart.$zoom._dragZoomEnd = null;

  const zoomThreshold = zoomOptions.threshold || 0;
  if (dragDistanceX <= zoomThreshold && dragDistanceY <= zoomThreshold) {
    return;
  }

  const {top, left, width, height} = chart.chartArea;
  const xEnabled = directionEnabled(zoomOptions.mode, 'x', chart);
  const zoomX = xEnabled && dragDistanceX ? 1 + ((width - dragDistanceX) / width) : 1;

  const yEnabled = directionEnabled(zoomOptions.mode, 'y', chart);
  const zoomY = yEnabled && dragDistanceY ? 1 + ((height - dragDistanceY) / height) : 1;

  doZoom(chart, zoomX, zoomY, {
    x: (startX - left) / (1 - dragDistanceX / width) + left,
    y: (startY - top) / (1 - dragDistanceY / height) + top
  }, zoomOptions, undefined, true);

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
  const offsetX = event.clientX - rect.left;
  const offsetY = event.clientY - rect.top;

  const center = {
    x: offsetX,
    y: offsetY
  };

  let speedPercent = zoomOptions.speed;

  if (event.deltaY >= 0) {
    speedPercent = -speedPercent;
  }
  doZoom(chart, 1 + speedPercent, 1 + speedPercent, center, zoomOptions);

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
    add(canvas, 'wheel', wheel, {chart, options});
  } else if (props._wheelHandler) {
    remove(canvas, 'wheel', chart);
  }
  if (zoomEnabled && dragEnabled) {
    add(canvas, 'mousedown', mouseDown, {chart, options});
    add(canvas.ownerDocument, 'mouseup', mouseUp, {chart, options});
  } else {
    remove(canvas, 'mousedown', chart);
    remove(canvas, 'mousemove', chart);
    remove(canvas.ownerDocument, 'mouseup', chart);
  }
}

export function removeListeners(chart) {
  const {canvas, $zoom: props} = chart;
  if (!canvas || !props) {
    return;
  }
  remove(canvas, 'mousedown', chart);
  remove(canvas, 'mousemove', chart);
  remove(canvas.ownerDocument, 'mouseup', chart);
  remove(canvas, 'wheel', chart);
  remove(canvas, 'click', chart);
}
