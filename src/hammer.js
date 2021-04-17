import {callback as call} from 'chart.js/helpers';
import Hammer from 'hammerjs';
import {doPan, doZoom} from './core';
import {getEnabledScalesByPoint} from './utils';

function createEnabler(chart, panOptions) {
  return function(recognizer, event) {
    if (!panOptions || !panOptions.enabled) {
      return false;
    }
    if (!event || !event.srcEvent) { // Sometimes Hammer queries this with a null event.
      return true;
    }
    const requireModifier = panOptions.modifierKey && (event.pointerType === 'mouse');
    if (requireModifier && !event.srcEvent[panOptions.modifierKey + 'Key']) {
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

function createPinchHandlers(chart, zoomOptions) {
  // Hammer reports the total scaling. We need the incremental amount
  let currentPinchScaling;
  const handlePinch = function(e) {
    const {center, pointers} = e;
    const zoom = 1 / (currentPinchScaling) * e.scale;
    const rect = e.target.getBoundingClientRect();
    const focalPoint = {
      x: center.x - rect.left,
      y: center.y - rect.top
    };

    const xy = pinchAxes(pointers[0], pointers[1]);

    doZoom(chart, zoom, zoom, focalPoint, zoomOptions, xy);

    // Keep track of overall scale
    currentPinchScaling = e.scale;
  };
  return {
    start() {
      currentPinchScaling = 1;
    },
    pinch: handlePinch,
    end(e) {
      handlePinch(e);
      currentPinchScaling = null; // reset
      call(zoomOptions.onZoomComplete, [chart]);
    }
  };
}

function createPanHandlers(chart, panOptions) {
  let delta = null;
  let enabledScales = null;
  const handlePan = function(e) {
    if (delta !== null) {
      chart.panning = true;
      doPan(chart, e.deltaX - delta.x, e.deltaY - delta.y, panOptions, enabledScales);
      delta = {x: e.deltaX, y: e.deltaY};
    }
  };

  return {
    start(e) {
      const rect = e.target.getBoundingClientRect();
      const x = e.center.x - rect.left;
      const y = e.center.y - rect.top;
      enabledScales = getEnabledScalesByPoint(panOptions, x, y, chart);

      delta = {x: 0, y: 0};
      handlePan(e);
    },
    move: handlePan,
    end() {
      delta = null;
      setTimeout(() => (chart.panning = false), 500);
      call(panOptions.onPanComplete, [chart]);
    }
  };
}

const hammers = new WeakMap();
export function startHammer(chart, options) {
  const canvas = chart.canvas;
  const {pan: panOptions, zoom: zoomOptions} = options;

  const mc = new Hammer.Manager(canvas);
  if (zoomOptions && zoomOptions.enabled) {
    const {start, pinch, end} = createPinchHandlers(chart, zoomOptions);

    mc.add(new Hammer.Pinch());
    mc.on('pinchstart', start);
    mc.on('pinch', pinch);
    mc.on('pinchend', end);
  }

  if (panOptions && panOptions.enabled) {
    const {start, move, end} = createPanHandlers(chart, panOptions);
    mc.add(new Hammer.Pan({
      threshold: panOptions.threshold,
      enable: createEnabler(chart, panOptions)
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
