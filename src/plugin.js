'use strict';

import Chart from 'chart.js';
import Hammer from 'hammerjs';

var helpers = Chart.helpers;

// Take the zoom namespace of Chart
var zoomNS = Chart.Zoom = Chart.Zoom || {};

// Where we store functions to handle different scale types
var zoomFunctions = zoomNS.zoomFunctions = zoomNS.zoomFunctions || {};
var panFunctions = zoomNS.panFunctions = zoomNS.panFunctions || {};

// Default options if none are provided
var defaultOptions = zoomNS.defaults = {
	pan: {
		enabled: true,
		mode: 'xy',
		speed: 20,
		threshold: 10
	},
	zoom: {
		enabled: true,
		mode: 'xy',
		sensitivity: 3
	}
};

function directionEnabled(mode, dir) {
	if (mode === undefined) {
		return true;
	} else if (typeof mode === 'string') {
		return mode.indexOf(dir) !== -1;
	}

	return false;
}

function rangeMaxLimiter(zoomPanOptions, newMax) {
	if (zoomPanOptions.scaleAxes && zoomPanOptions.rangeMax &&
			!helpers.isNullOrUndef(zoomPanOptions.rangeMax[zoomPanOptions.scaleAxes])) {
		var rangeMax = zoomPanOptions.rangeMax[zoomPanOptions.scaleAxes];
		if (newMax > rangeMax) {
			newMax = rangeMax;
		}
	}
	return newMax;
}

function rangeMinLimiter(zoomPanOptions, newMin) {
	if (zoomPanOptions.scaleAxes && zoomPanOptions.rangeMin &&
			!helpers.isNullOrUndef(zoomPanOptions.rangeMin[zoomPanOptions.scaleAxes])) {
		var rangeMin = zoomPanOptions.rangeMin[zoomPanOptions.scaleAxes];
		if (newMin < rangeMin) {
			newMin = rangeMin;
		}
	}
	return newMin;
}

function zoomCategoryScale(scale, zoom, center, zoomOptions) {
	var labels = scale.chart.data.labels;
	var minIndex = scale.minIndex;
	var lastLabelIndex = labels.length - 1;
	var maxIndex = scale.maxIndex;
	var sensitivity = zoomOptions.sensitivity;
	var chartCenter = scale.isHorizontal() ? scale.left + (scale.width / 2) : scale.top + (scale.height / 2);
	var centerPointer = scale.isHorizontal() ? center.x : center.y;

	zoomNS.zoomCumulativeDelta = zoom > 1 ? zoomNS.zoomCumulativeDelta + 1 : zoomNS.zoomCumulativeDelta - 1;

	if (Math.abs(zoomNS.zoomCumulativeDelta) > sensitivity) {
		if (zoomNS.zoomCumulativeDelta < 0) {
			if (centerPointer >= chartCenter) {
				if (minIndex <= 0) {
					maxIndex = Math.min(lastLabelIndex, maxIndex + 1);
				} else {
					minIndex = Math.max(0, minIndex - 1);
				}
			} else if (centerPointer < chartCenter) {
				if (maxIndex >= lastLabelIndex) {
					minIndex = Math.max(0, minIndex - 1);
				} else {
					maxIndex = Math.min(lastLabelIndex, maxIndex + 1);
				}
			}
			zoomNS.zoomCumulativeDelta = 0;
		} else if (zoomNS.zoomCumulativeDelta > 0) {
			if (centerPointer >= chartCenter) {
				minIndex = minIndex < maxIndex ? minIndex = Math.min(maxIndex, minIndex + 1) : minIndex;
			} else if (centerPointer < chartCenter) {
				maxIndex = maxIndex > minIndex ? maxIndex = Math.max(minIndex, maxIndex - 1) : maxIndex;
			}
			zoomNS.zoomCumulativeDelta = 0;
		}
		scale.options.ticks.min = rangeMinLimiter(zoomOptions, labels[minIndex]);
		scale.options.ticks.max = rangeMaxLimiter(zoomOptions, labels[maxIndex]);
	}
}

function zoomTimeScale(scale, zoom, center, zoomOptions) {
	var options = scale.options;

	var range;
	var minPercent;
	if (scale.isHorizontal()) {
		range = scale.right - scale.left;
		minPercent = (center.x - scale.left) / range;
	} else {
		range = scale.bottom - scale.top;
		minPercent = (center.y - scale.top) / range;
	}

	var maxPercent = 1 - minPercent;
	var newDiff = range * (zoom - 1);

	var minDelta = newDiff * minPercent;
	var maxDelta = newDiff * maxPercent;

	var newMin = scale.getValueForPixel(scale.getPixelForValue(scale.min) + minDelta);
	var newMax = scale.getValueForPixel(scale.getPixelForValue(scale.max) - maxDelta);

	var diffMinMax = newMax.diff(newMin);
	var minLimitExceeded = rangeMinLimiter(zoomOptions, diffMinMax) !== diffMinMax;
	var maxLimitExceeded = rangeMaxLimiter(zoomOptions, diffMinMax) !== diffMinMax;

	if (!minLimitExceeded && !maxLimitExceeded) {
		options.time.min = newMin;
		options.time.max = newMax;
	}
}

function zoomNumericalScale(scale, zoom, center, zoomOptions) {
	var range = scale.max - scale.min;
	var newDiff = range * (zoom - 1);

	var cursorPixel = scale.isHorizontal() ? center.x : center.y;
	var minPercent = (scale.getValueForPixel(cursorPixel) - scale.min) / range;
	var maxPercent = 1 - minPercent;

	var minDelta = newDiff * minPercent;
	var maxDelta = newDiff * maxPercent;

	scale.options.ticks.min = rangeMinLimiter(zoomOptions, scale.min + minDelta);
	scale.options.ticks.max = rangeMaxLimiter(zoomOptions, scale.max - maxDelta);
}

function zoomScale(scale, zoom, center, zoomOptions) {
	var fn = zoomFunctions[scale.options.type];
	if (fn) {
		fn(scale, zoom, center, zoomOptions);
	}
}

/**
 * @param chart The chart instance
 * @param {number} percentZoomX The zoom percentage in the x direction
 * @param {number} percentZoomY The zoom percentage in the y direction
 * @param {{x: number, y: number}} focalPoint The x and y coordinates of zoom focal point. The point which doesn't change while zooming. E.g. the location of the mouse cursor when "drag: false"
 * @param {string} whichAxes `xy`, 'x', or 'y'
 */
function doZoom(chart, percentZoomX, percentZoomY, focalPoint, whichAxes) {
	var ca = chart.chartArea;
	if (!focalPoint) {
		focalPoint = {
			x: (ca.left + ca.right) / 2,
			y: (ca.top + ca.bottom) / 2,
		};
	}

	var zoomOptions = chart.options.zoom;

	if (zoomOptions && helpers.getValueOrDefault(zoomOptions.enabled, defaultOptions.zoom.enabled)) {
		// Do the zoom here
		var zoomMode = helpers.getValueOrDefault(chart.options.zoom.mode, defaultOptions.zoom.mode);
		zoomOptions.sensitivity = helpers.getValueOrDefault(chart.options.zoom.sensitivity, defaultOptions.zoom.sensitivity);

		// Which axe should be modified when figers were used.
		var _whichAxes;
		if (zoomMode === 'xy' && whichAxes !== undefined) {
			// based on fingers positions
			_whichAxes = whichAxes;
		} else {
			// no effect
			_whichAxes = 'xy';
		}

		helpers.each(chart.scales, function(scale) {
			if (scale.isHorizontal() && directionEnabled(zoomMode, 'x') && directionEnabled(_whichAxes, 'x')) {
				zoomOptions.scaleAxes = 'x';
				zoomScale(scale, percentZoomX, focalPoint, zoomOptions);
			} else if (!scale.isHorizontal() && directionEnabled(zoomMode, 'y') && directionEnabled(_whichAxes, 'y')) {
				// Do Y zoom
				zoomOptions.scaleAxes = 'y';
				zoomScale(scale, percentZoomY, focalPoint, zoomOptions);
			}
		});

		chart.update(0);

		if (typeof zoomOptions.onZoom === 'function') {
			zoomOptions.onZoom({chart: chart});
		}
	}
}

function panCategoryScale(scale, delta, panOptions) {
	var labels = scale.chart.data.labels;
	var lastLabelIndex = labels.length - 1;
	var offsetAmt = Math.max(scale.ticks.length, 1);
	var panSpeed = panOptions.speed;
	var minIndex = scale.minIndex;
	var step = Math.round(scale.width / (offsetAmt * panSpeed));
	var maxIndex;

	zoomNS.panCumulativeDelta += delta;

	minIndex = zoomNS.panCumulativeDelta > step ? Math.max(0, minIndex - 1) : zoomNS.panCumulativeDelta < -step ? Math.min(lastLabelIndex - offsetAmt + 1, minIndex + 1) : minIndex;
	zoomNS.panCumulativeDelta = minIndex !== scale.minIndex ? 0 : zoomNS.panCumulativeDelta;

	maxIndex = Math.min(lastLabelIndex, minIndex + offsetAmt - 1);

	scale.options.ticks.min = rangeMinLimiter(panOptions, labels[minIndex]);
	scale.options.ticks.max = rangeMaxLimiter(panOptions, labels[maxIndex]);
}

function panTimeScale(scale, delta, panOptions) {
	var options = scale.options;
	var limitedMax = rangeMaxLimiter(panOptions, scale.getValueForPixel(scale.getPixelForValue(scale.max) - delta));
	var limitedMin = rangeMinLimiter(panOptions, scale.getValueForPixel(scale.getPixelForValue(scale.min) - delta));

	var limitedTimeDelta = delta < 0 ? limitedMax - scale.max : limitedMin - scale.min;

	options.time.max = scale.max + limitedTimeDelta;
	options.time.min = scale.min + limitedTimeDelta;
}

function panNumericalScale(scale, delta, panOptions) {
	var tickOpts = scale.options.ticks;
	var start = scale.start;
	var end = scale.end;

	if (tickOpts.reverse) {
		tickOpts.max = scale.getValueForPixel(scale.getPixelForValue(start) - delta);
		tickOpts.min = scale.getValueForPixel(scale.getPixelForValue(end) - delta);
	} else {
		tickOpts.min = scale.getValueForPixel(scale.getPixelForValue(start) - delta);
		tickOpts.max = scale.getValueForPixel(scale.getPixelForValue(end) - delta);
	}
	tickOpts.min = rangeMinLimiter(panOptions, tickOpts.min);
	tickOpts.max = rangeMaxLimiter(panOptions, tickOpts.max);
}

function panScale(scale, delta, panOptions) {
	var fn = panFunctions[scale.options.type];
	if (fn) {
		fn(scale, delta, panOptions);
	}
}

function doPan(chartInstance, deltaX, deltaY) {
	var panOptions = chartInstance.options.pan;
	if (panOptions && helpers.getValueOrDefault(panOptions.enabled, defaultOptions.pan.enabled)) {
		var panMode = helpers.getValueOrDefault(chartInstance.options.pan.mode, defaultOptions.pan.mode);
		panOptions.speed = helpers.getValueOrDefault(chartInstance.options.pan.speed, defaultOptions.pan.speed);

		helpers.each(chartInstance.scales, function(scale) {
			if (scale.isHorizontal() && directionEnabled(panMode, 'x') && deltaX !== 0) {
				panOptions.scaleAxes = 'x';
				panScale(scale, deltaX, panOptions);
			} else if (!scale.isHorizontal() && directionEnabled(panMode, 'y') && deltaY !== 0) {
				panOptions.scaleAxes = 'y';
				panScale(scale, deltaY, panOptions);
			}
		});

		chartInstance.update(0);

		if (typeof panOptions.onPan === 'function') {
			panOptions.onPan({chart: chartInstance});
		}
	}
}

function getXAxis(chartInstance) {
	var scales = chartInstance.scales;
	var scaleIds = Object.keys(scales);
	for (var i = 0; i < scaleIds.length; i++) {
		var scale = scales[scaleIds[i]];

		if (scale.isHorizontal()) {
			return scale;
		}
	}
}

function getYAxis(chartInstance) {
	var scales = chartInstance.scales;
	var scaleIds = Object.keys(scales);
	for (var i = 0; i < scaleIds.length; i++) {
		var scale = scales[scaleIds[i]];

		if (!scale.isHorizontal()) {
			return scale;
		}
	}
}

// Store these for later
zoomNS.zoomFunctions.category = zoomCategoryScale;
zoomNS.zoomFunctions.time = zoomTimeScale;
zoomNS.zoomFunctions.linear = zoomNumericalScale;
zoomNS.zoomFunctions.logarithmic = zoomNumericalScale;
zoomNS.panFunctions.category = panCategoryScale;
zoomNS.panFunctions.time = panTimeScale;
zoomNS.panFunctions.linear = panNumericalScale;
zoomNS.panFunctions.logarithmic = panNumericalScale;
// Globals for category pan and zoom
zoomNS.panCumulativeDelta = 0;
zoomNS.zoomCumulativeDelta = 0;

// Chartjs Zoom Plugin
var zoomPlugin = {
	id: 'zoom',

	afterInit: function(chartInstance) {
		helpers.each(chartInstance.scales, function(scale) {
			scale.originalOptions = helpers.clone(scale.options);
		});

		chartInstance.resetZoom = function() {
			helpers.each(chartInstance.scales, function(scale) {
				var timeOptions = scale.options.time;
				var tickOptions = scale.options.ticks;

				if (timeOptions) {
					timeOptions.min = scale.originalOptions.time.min;
					timeOptions.max = scale.originalOptions.time.max;
				}

				if (tickOptions) {
					tickOptions.min = scale.originalOptions.ticks.min;
					tickOptions.max = scale.originalOptions.ticks.max;
				}
			});

			helpers.each(chartInstance.data.datasets, function(dataset) {
				dataset._meta = null;
			});

			chartInstance.update();
		};

	},

	beforeInit: function(chartInstance) {
		chartInstance.zoom = {};

		var node = chartInstance.zoom.node = chartInstance.chart.ctx.canvas;

		var options = chartInstance.options;
		var panThreshold = helpers.getValueOrDefault(options.pan ? options.pan.threshold : undefined, zoomNS.defaults.pan.threshold);
		if (!options.zoom || !options.zoom.enabled) {
			return;
		}

		chartInstance.zoom._mouseDownHandler = function(event) {
			if (chartInstance.options.zoom.drag) {
				node.addEventListener('mousemove', chartInstance.zoom._mouseMoveHandler);
				chartInstance.zoom._dragZoomStart = event;
			}
		};
		node.addEventListener('mousedown', chartInstance.zoom._mouseDownHandler);

		chartInstance.zoom._mouseMoveHandler = function(event) {
			if (chartInstance.options.zoom.drag && chartInstance.zoom._dragZoomStart) {
				chartInstance.zoom._dragZoomEnd = event;
				chartInstance.update(0);
			}
		};

		chartInstance.zoom._mouseUpHandler = function(event) {
			if (!chartInstance.options.zoom.drag || !chartInstance.zoom._dragZoomStart) {
				return;
			}

			node.removeEventListener('mousemove', chartInstance.zoom._mouseMoveHandler);

			var chartArea = chartInstance.chartArea;
			var xAxis = getXAxis(chartInstance);
			var yAxis = getYAxis(chartInstance);
			var beginPoint = chartInstance.zoom._dragZoomStart;
			var startX = xAxis.left;
			var endX = xAxis.right;
			var startY = yAxis.top;
			var endY = yAxis.bottom;

			if (directionEnabled(chartInstance.options.zoom.mode, 'x')) {
				var offsetX = beginPoint.target.getBoundingClientRect().left;
				startX = Math.min(beginPoint.clientX, event.clientX) - offsetX;
				endX = Math.max(beginPoint.clientX, event.clientX) - offsetX;
			}

			if (directionEnabled(chartInstance.options.zoom.mode, 'y')) {
				var offsetY = beginPoint.target.getBoundingClientRect().top;
				startY = Math.min(beginPoint.clientY, event.clientY) - offsetY;
				endY = Math.max(beginPoint.clientY, event.clientY) - offsetY;
			}

			var dragDistanceX = endX - startX;
			var chartDistanceX = chartArea.right - chartArea.left;
			var zoomX = 1 + ((chartDistanceX - dragDistanceX) / chartDistanceX);

			var dragDistanceY = endY - startY;
			var chartDistanceY = chartArea.bottom - chartArea.top;
			var zoomY = 1 + ((chartDistanceY - dragDistanceY) / chartDistanceY);

			// Remove drag start and end before chart update to stop drawing selected area
			chartInstance.zoom._dragZoomStart = null;
			chartInstance.zoom._dragZoomEnd = null;

			if (dragDistanceX > 0 || dragDistanceY > 0) {
				doZoom(chartInstance, zoomX, zoomY, {
					x: (startX - chartArea.left) / (1 - dragDistanceX / chartDistanceX) + chartArea.left,
					y: (startY - chartArea.top) / (1 - dragDistanceY / chartDistanceY) + chartArea.top
				});
			}
		};
		node.ownerDocument.addEventListener('mouseup', chartInstance.zoom._mouseUpHandler);

		chartInstance.zoom._wheelHandler = function(event) {
			if (!chartInstance.options.zoom.drag) {
				var rect = event.target.getBoundingClientRect();
				var offsetX = event.clientX - rect.left;
				var offsetY = event.clientY - rect.top;

				var center = {
					x: offsetX,
					y: offsetY
				};

				if (event.deltaY < 0) {
					doZoom(chartInstance, 1.1, 1.1, center);
				} else {
					doZoom(chartInstance, 0.909, 0.909, center);
				}
				// Prevent the event from triggering the default behavior (eg. Content scrolling).
				event.preventDefault();
			}
		};

		node.addEventListener('wheel', chartInstance.zoom._wheelHandler);

		if (Hammer) {
			var mc = new Hammer.Manager(node);
			mc.add(new Hammer.Pinch());
			mc.add(new Hammer.Pan({
				threshold: panThreshold
			}));

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

				doZoom(chartInstance, diff, center, xy);

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
				zoomNS.zoomCumulativeDelta = 0;
			});

			var currentDeltaX = null;
			var currentDeltaY = null;
			var panning = false;
			var handlePan = function(e) {
				if (currentDeltaX !== null && currentDeltaY !== null) {
					panning = true;
					var deltaX = e.deltaX - currentDeltaX;
					var deltaY = e.deltaY - currentDeltaY;
					currentDeltaX = e.deltaX;
					currentDeltaY = e.deltaY;
					doPan(chartInstance, deltaX, deltaY);
				}
			};

			mc.on('panstart', function(e) {
				currentDeltaX = 0;
				currentDeltaY = 0;
				handlePan(e);
			});
			mc.on('panmove', handlePan);
			mc.on('panend', function() {
				currentDeltaX = null;
				currentDeltaY = null;
				zoomNS.panCumulativeDelta = 0;
				setTimeout(function() {
					panning = false;
				}, 500);
			});

			chartInstance.zoom._ghostClickHandler = function(e) {
				if (panning) {
					e.stopImmediatePropagation();
					e.preventDefault();
				}
			};
			node.addEventListener('click', chartInstance.zoom._ghostClickHandler);

			chartInstance._mc = mc;
		}
	},

	beforeDatasetsDraw: function(chartInstance) {
		var ctx = chartInstance.chart.ctx;
		var chartArea = chartInstance.chartArea;
		ctx.save();
		ctx.beginPath();

		if (chartInstance.zoom._dragZoomEnd) {
			var xAxis = getXAxis(chartInstance);
			var yAxis = getYAxis(chartInstance);
			var beginPoint = chartInstance.zoom._dragZoomStart;
			var endPoint = chartInstance.zoom._dragZoomEnd;

			var startX = xAxis.left;
			var endX = xAxis.right;
			var startY = yAxis.top;
			var endY = yAxis.bottom;

			if (directionEnabled(chartInstance.options.zoom.mode, 'x')) {
				var offsetX = beginPoint.target.getBoundingClientRect().left;
				startX = Math.min(beginPoint.clientX, endPoint.clientX) - offsetX;
				endX = Math.max(beginPoint.clientX, endPoint.clientX) - offsetX;
			}

			if (directionEnabled(chartInstance.options.zoom.mode, 'y')) {
				var offsetY = beginPoint.target.getBoundingClientRect().top;
				startY = Math.min(beginPoint.clientY, endPoint.clientY) - offsetY;
				endY = Math.max(beginPoint.clientY, endPoint.clientY) - offsetY;
			}

			var rectWidth = endX - startX;
			var rectHeight = endY - startY;
			var dragOptions = chartInstance.options.zoom.drag;

			ctx.fillStyle = dragOptions.backgroundColor || 'rgba(225,225,225,0.3)';
			ctx.fillRect(startX, startY, rectWidth, rectHeight);

			if (dragOptions.borderWidth > 0) {
				ctx.lineWidth = dragOptions.borderWidth;
				ctx.strokeStyle = dragOptions.borderColor || 'rgba(225,225,225)';
				ctx.strokeRect(startX, startY, rectWidth, rectHeight);
			}
		}

		ctx.rect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
		ctx.clip();
	},

	afterDatasetsDraw: function(chartInstance) {
		chartInstance.chart.ctx.restore();
	},

	destroy: function(chartInstance) {
		if (chartInstance.zoom) {
			var options = chartInstance.options;
			var node = chartInstance.zoom.node;

			if (options.zoom) {
				node.removeEventListener('mousedown', chartInstance.zoom._mouseDownHandler);
				node.removeEventListener('mousemove', chartInstance.zoom._mouseMoveHandler);
				node.ownerDocument.removeEventListener('mouseup', chartInstance.zoom._mouseUpHandler);
				node.removeEventListener('wheel', chartInstance.zoom._wheelHandler);
			}

			if (Hammer) {
				node.removeEventListener('click', chartInstance.zoom._ghostClickHandler);
			}

			delete chartInstance.zoom;

			var mc = chartInstance._mc;
			if (mc) {
				mc.remove('pinchstart');
				mc.remove('pinch');
				mc.remove('pinchend');
				mc.remove('panstart');
				mc.remove('pan');
				mc.remove('panend');
			}
		}
	}
};

Chart.pluginService.register(zoomPlugin);
export default zoomPlugin;
