import {callback as call} from 'chart.js/helpers';
import Hammer from 'hammerjs';
import {doPan, doZoom} from './core';
import {getState} from './state';
import {getEnabledScalesByPoint} from './utils';

function createEnabler(chart) {
  const state = getState(chart);
  return function(recognizer, event) {
    const panOptions = state.options.pan;
    if (!panOptions || !panOptions.enabled) {
      return false;
    }
    if (!event || !event.srcEvent) { // Sometimes Hammer queries this with a null event.
      return true;
    }
    const modifierKey = panOptions.modifierKey;
    const requireModifier = modifierKey && (event.pointerType === 'mouse');
    if (requireModifier && !event.srcEvent[modifierKey + 'Key']) {
      call(panOptions.onPanRejected, [{chart, event}]);
      return false;
    }
    return true;
  };
}

function pinchAxes(p0, p1) {
  // fingers position difference
  const x = Math.abs(p0.clientX - p1.clientX);
  const y = Math.abs(p0.clientY - p1.clientY);

  // diagonal fingers will change both (xy) axes
  const p = x / y;
  return p > 0.3 && p < 1.7 ? 'xy' : x > y ? 'x' : 'y';
}

function createPinchHandlers(chart) {
  const state = getState(chart);
  // Hammer reports the total scaling. We need the incremental amount
  const handlePinch = function(e) {
    const {center, pointers} = e;
    const zoom = 1 / state.scale * e.scale;
    const rect = e.target.getBoundingClientRect();
    const focalPoint = {
      x: center.x - rect.left,
      y: center.y - rect.top
    };

    const xy = pinchAxes(pointers[0], pointers[1]);

    doZoom(chart, zoom, zoom, focalPoint, state.options.zoom, xy);

    // Keep track of overall scale
    state.scale = e.scale;
  };
  return {
    start() {
      state.scale = 1;
    },
    pinch: handlePinch,
    end(e) {
      handlePinch(e);
      state.scale = null; // reset
      call(state.options.zoom.onZoomComplete, [chart]);
    }
  };
}

function createPanHandlers(chart) {
  const state = getState(chart);
  const handlePan = function(e) {
    const delta = state.delta;
    if (delta !== null) {
      state.panning = true;
      doPan(chart, e.deltaX - delta.x, e.deltaY - delta.y, state.options.pan, state.panScales);
      state.delta = {x: e.deltaX, y: e.deltaY};
    }
  };

  return {
    start(e) {
      const panOptions = state.options.pan;
      if (!panOptions.enabled) {
        return;
      }
      const rect = e.target.getBoundingClientRect();
      const x = e.center.x - rect.left;
      const y = e.center.y - rect.top;

      state.panScales = getEnabledScalesByPoint(panOptions, x, y, chart);
      state.delta = {x: 0, y: 0};
      handlePan(e);
    },
    move: handlePan,
    end() {
      state.delta = null;
      if (state.panning) {
        setTimeout(() => (state.panning = false), 500);
        call(state.options.pan.onPanComplete, [chart]);
      }
    }
  };
}

const hammers = new WeakMap();
export function startHammer(chart, options) {
  const canvas = chart.canvas;
  const {pan: panOptions, zoom: zoomOptions} = options;

  const mc = new Hammer.Manager(canvas);
  if (zoomOptions && zoomOptions.enabled) {
    const {start, pinch, end} = createPinchHandlers(chart);

    mc.add(new Hammer.Pinch());
    mc.on('pinchstart', start);
    mc.on('pinch', pinch);
    mc.on('pinchend', end);
  }

  if (panOptions && panOptions.enabled) {
    const {start, move, end} = createPanHandlers(chart);
    mc.add(new Hammer.Pan({
      threshold: panOptions.threshold,
      enable: createEnabler(chart)
    }));
    mc.on('panstart', start);
    mc.on('panmove', move);
    mc.on('panend', end);
  }

  hammers.set(chart, mc);
}

export function stopHammer(chart) {
  const mc = hammers.get(chart);
  if (mc) {
    mc.remove('pinchstart');
    mc.remove('pinch');
    mc.remove('pinchend');
    mc.remove('panstart');
    mc.remove('pan');
    mc.remove('panend');
    mc.destroy();
    hammers.delete(chart);
  }
}
