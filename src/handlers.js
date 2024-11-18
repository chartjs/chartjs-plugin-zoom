import {directionEnabled, debounce, keyNotPressed, getModifierKey, keyPressed} from './utils';
import {zoom, zoomRect} from './core';
import {callback as call, getRelativePosition, _isPointInArea} from 'chart.js/helpers';
import {getState} from './state';

function removeHandler(chart, type) {
  const {handlers} = getState(chart);
  const handler = handlers[type];
  if (handler && handler.target) {
    handler.target.removeEventListener(type, handler);
    delete handlers[type];
  }
}

function addHandler(chart, target, type, handler) {
  const {handlers, options} = getState(chart);
  const oldHandler = handlers[type];
  if (oldHandler && oldHandler.target === target) {
    // already attached
    return;
  }
  removeHandler(chart, type);
  handlers[type] = (event) => handler(chart, event, options);
  handlers[type].target = target;

  // `passive: false` for wheel events, to prevent chrome warnings. Use default value for other events.
  const passive = type === 'wheel' ? false : undefined;
  target.addEventListener(type, handlers[type], {passive});
}

export function mouseMove(chart, event) {
  const state = getState(chart);
  if (state.dragStart) {
    state.dragging = true;
    state.dragEnd = event;
    chart.update('none');
  }
}

function keyDown(chart, event) {
  const state = getState(chart);
  if (!state.dragStart || event.key !== 'Escape') {
    return;
  }

  removeHandler(chart, 'keydown');
  state.dragging = false;
  state.dragStart = state.dragEnd = null;
  chart.update('none');
}

function getPointPosition(event, chart) {
  const point = getRelativePosition(event, chart);
  const canvasArea = chart.canvas.getBoundingClientRect();
  if (!_isPointInArea(event, canvasArea)) {
    point.x = event.clientX - canvasArea.left;
    point.y = event.clientY - canvasArea.top;
  }
  return point;
}

function zoomStart(chart, event, zoomOptions) {
  const {onZoomStart, onZoomRejected} = zoomOptions;
  if (onZoomStart) {
    const point = getPointPosition(event, chart);
    if (call(onZoomStart, [{chart, event, point}]) === false) {
      call(onZoomRejected, [{chart, event}]);
      return false;
    }
  }
}

export function mouseDown(chart, event) {
  if (chart.legend) {
    const point = getRelativePosition(event, chart);
    if (_isPointInArea(point, chart.legend)) {
      return;
    }
  }
  const state = getState(chart);
  const {pan: panOptions, zoom: zoomOptions = {}} = state.options;
  if (
    event.button !== 0 ||
    keyPressed(getModifierKey(panOptions), event) ||
    keyNotPressed(getModifierKey(zoomOptions.drag), event)
  ) {
    return call(zoomOptions.onZoomRejected, [{chart, event}]);
  }

  if (zoomStart(chart, event, zoomOptions) === false) {
    return;
  }
  state.dragStart = event;

  addHandler(chart, chart.canvas.ownerDocument, 'mousemove', mouseMove);
  addHandler(chart, window.document, 'keydown', keyDown);
}

function applyAspectRatio(endPoint, beginPoint, aspectRatio) {
  let width = endPoint.x - beginPoint.x;
  let height = endPoint.y - beginPoint.y;
  const ratio = Math.abs(width / height);

  if (ratio > aspectRatio) {
    width = Math.sign(width) * Math.abs(height * aspectRatio);
  } else if (ratio < aspectRatio) {
    height = Math.sign(height) * Math.abs(width / aspectRatio);
  }

  endPoint.x = beginPoint.x + width;
  endPoint.y = beginPoint.y + height;
}

function applyMinMaxProps(rect, beginPoint, endPoint, {min, max, prop}) {
  rect[min] = Math.max(0, Math.min(beginPoint[prop], endPoint[prop]));
  rect[max] = Math.max(beginPoint[prop], endPoint[prop]);
}

function getReplativePoints(chart, points, maintainAspectRatio) {
  const beginPoint = getPointPosition(points.dragStart, chart);
  const endPoint = getPointPosition(points.dragEnd, chart);

  if (maintainAspectRatio) {
    const aspectRatio = chart.chartArea.width / chart.chartArea.height;
    applyAspectRatio(endPoint, beginPoint, aspectRatio);
  }

  return {beginPoint, endPoint};
}

export function computeDragRect(chart, mode, points, maintainAspectRatio) {
  const xEnabled = directionEnabled(mode, 'x', chart);
  const yEnabled = directionEnabled(mode, 'y', chart);
  const {top, left, right, bottom, width: chartWidth, height: chartHeight} = chart.chartArea;
  const rect = {top, left, right, bottom};

  const {beginPoint, endPoint} = getReplativePoints(chart, points, maintainAspectRatio && xEnabled && yEnabled);

  if (xEnabled) {
    applyMinMaxProps(rect, beginPoint, endPoint, {min: 'left', max: 'right', prop: 'x'});
  }

  if (yEnabled) {
    applyMinMaxProps(rect, beginPoint, endPoint, {min: 'top', max: 'bottom', prop: 'y'});
  }

  const width = rect.right - rect.left;
  const height = rect.bottom - rect.top;

  return {
    ...rect,
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

  removeHandler(chart, 'mousemove');
  const {mode, onZoomComplete, drag: {threshold = 0, maintainAspectRatio}} = state.options.zoom;
  const rect = computeDragRect(chart, mode, {dragStart: state.dragStart, dragEnd: event}, maintainAspectRatio);
  const distanceX = directionEnabled(mode, 'x', chart) ? rect.width : 0;
  const distanceY = directionEnabled(mode, 'y', chart) ? rect.height : 0;
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

  // Remove drag start and end before chart update to stop drawing selected area
  state.dragStart = state.dragEnd = null;

  if (distance <= threshold) {
    state.dragging = false;
    chart.update('none');
    return;
  }

  zoomRect(chart, {x: rect.left, y: rect.top}, {x: rect.right, y: rect.bottom}, 'zoom');

  state.dragging = false;
  state.filterNextClick = true;
  call(onZoomComplete, [{chart}]);
}

function wheelPreconditions(chart, event, zoomOptions) {
  // Before preventDefault, check if the modifier key required and pressed
  if (keyNotPressed(getModifierKey(zoomOptions.wheel), event)) {
    call(zoomOptions.onZoomRejected, [{chart, event}]);
    return;
  }

  if (zoomStart(chart, event, zoomOptions) === false) {
    return;
  }

  // Prevent the event from triggering the default behavior (e.g. content scrolling).
  if (event.cancelable) {
    event.preventDefault();
  }

  // Firefox always fires the wheel event twice:
  // First without the delta and right after that once with the delta properties.
  if (event.deltaY === undefined) {
    return;
  }
  return true;
}

export function wheel(chart, event) {
  const {handlers: {onZoomComplete}, options: {zoom: zoomOptions}} = getState(chart);

  if (!wheelPreconditions(chart, event, zoomOptions)) {
    return;
  }

  const rect = event.target.getBoundingClientRect();
  const speed = zoomOptions.wheel.speed;
  const percentage = event.deltaY >= 0 ? 2 - 1 / (1 - speed) : 1 + speed;
  const amount = {
    x: percentage,
    y: percentage,
    focalPoint: {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  };

  zoom(chart, amount);

  call(onZoomComplete, [{chart}]);
}

function addDebouncedHandler(chart, name, handler, delay) {
  if (handler) {
    getState(chart).handlers[name] = debounce(() => call(handler, [{chart}]), delay);
  }
}

export function addListeners(chart, options) {
  const canvas = chart.canvas;
  const {wheel: wheelOptions, drag: dragOptions, onZoomComplete} = options.zoom;

  // Install listeners. Do this dynamically based on options so that we can turn zoom on and off
  // We also want to make sure listeners aren't always on. E.g. if you're scrolling down a page
  // and the mouse goes over a chart you don't want it intercepted unless the plugin is enabled
  if (wheelOptions.enabled) {
    addHandler(chart, canvas, 'wheel', wheel);
    addDebouncedHandler(chart, 'onZoomComplete', onZoomComplete, 250);
  } else {
    removeHandler(chart, 'wheel');
  }
  if (dragOptions.enabled) {
    addHandler(chart, canvas, 'mousedown', mouseDown);
    addHandler(chart, canvas.ownerDocument, 'mouseup', mouseUp);
  } else {
    removeHandler(chart, 'mousedown');
    removeHandler(chart, 'mousemove');
    removeHandler(chart, 'mouseup');
    removeHandler(chart, 'keydown');
  }
}

export function removeListeners(chart) {
  removeHandler(chart, 'mousedown');
  removeHandler(chart, 'mousemove');
  removeHandler(chart, 'mouseup');
  removeHandler(chart, 'wheel');
  removeHandler(chart, 'click');
  removeHandler(chart, 'keydown');
}
