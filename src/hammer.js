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
    const requireModifier = panOptions.modifierKey
      && (event.pointerType === 'mouse');
    if (requireModifier && !event.srcEvent[panOptions.modifierKey + 'Key']) {
      if (typeof panOptions.onPanRejected === 'function') {
        panOptions.onPanRejected({
          chart: chart,
          event: event
        });
      }
      return false;
    }
    return true;
  };
}

export function startHammer(chart, options) {
  const node = chart.canvas;
  const {pan: panOptions, zoom: zoomOptions} = options;

  const mc = new Hammer.Manager(node);
  if (zoomOptions && zoomOptions.enabled) {
    mc.add(new Hammer.Pinch());
  }
  if (panOptions && panOptions.enabled) {
    mc.add(new Hammer.Pan({
      threshold: panOptions.threshold,
      enable: createEnabler(chart, panOptions)
    }));
  }

  // Hammer reports the total scaling. We need the incremental amount
  var currentPinchScaling;
  var handlePinch = function(e) {
    var diff = 1 / (currentPinchScaling) * e.scale;
    var rect = e.target.getBoundingClientRect();
    var offsetX = e.center.x - rect.left;
    var offsetY = e.center.y - rect.top;
    var center = {
      x: offsetX,
      y: offsetY
    };

    // fingers position difference
    var x = Math.abs(e.pointers[0].clientX - e.pointers[1].clientX);
    var y = Math.abs(e.pointers[0].clientY - e.pointers[1].clientY);

    // diagonal fingers will change both (xy) axes
    var p = x / y;
    var xy;
    if (p > 0.3 && p < 1.7) {
      xy = 'xy';
    } else if (x > y) {
      xy = 'x'; // x axis
    } else {
      xy = 'y'; // y axis
    }

    doZoom(chart, diff, diff, center, zoomOptions, xy);

    if (typeof zoomOptions.onZoom === 'function') {
      zoomOptions.onZoom({chart: chart});
    }

    // Keep track of overall scale
    currentPinchScaling = e.scale;
  };

  mc.on('pinchstart', function() {
    currentPinchScaling = 1; // reset tracker
  });
  mc.on('pinch', handlePinch);
  mc.on('pinchend', function(e) {
    handlePinch(e);
    currentPinchScaling = null; // reset
    if (typeof zoomOptions.onZoomComplete === 'function') {
      zoomOptions.onZoomComplete({chart: chart});
    }
  });

  let currentDeltaX = null;
  let currentDeltaY = null;
  let panning = false;
  let panningScales = null;
  const handlePan = function(e) {
    if (currentDeltaX !== null && currentDeltaY !== null) {
      panning = true;
      const deltaX = e.deltaX - currentDeltaX;
      const deltaY = e.deltaY - currentDeltaY;
      currentDeltaX = e.deltaX;
      currentDeltaY = e.deltaY;
      doPan(chart, deltaX, deltaY, panOptions, panningScales);
    }
  };

  mc.on('panstart', function(e) {
    if (panOptions.enabled) {
      const rect = e.target.getBoundingClientRect();
      const x = e.center.x - rect.left;
      const y = e.center.y - rect.top;
      panningScales = getEnabledScalesByPoint(panOptions, x, y, chart);
    }

    currentDeltaX = 0;
    currentDeltaY = 0;
    handlePan(e);
  });
  mc.on('panmove', handlePan);
  mc.on('panend', function() {
    currentDeltaX = null;
    currentDeltaY = null;
    setTimeout(function() {
      panning = false;
    }, 500);
    if (typeof panOptions.onPanComplete === 'function') {
      panOptions.onPanComplete({chart: chart});
    }
  });

  chart.$zoom._ghostClickHandler = function(e) {
    if (panning && e.cancelable) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  };
  node.addEventListener('click', chart.$zoom._ghostClickHandler);

  chart._mc = mc;
}

export function stopHammer(chart) {
  const mc = chart._mc;
  if (mc) {
    mc.remove('pinchstart');
    mc.remove('pinch');
    mc.remove('pinchend');
    mc.remove('panstart');
    mc.remove('pan');
    mc.remove('panend');
    mc.destroy();
  }
}
