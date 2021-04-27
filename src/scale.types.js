function zoomDelta(scale, zoom, center) {
  const range = scale.max - scale.min;
  const newRange = range * (zoom - 1);

  const centerPoint = scale.isHorizontal() ? center.x : center.y;
  const minPercent = (scale.getValueForPixel(centerPoint) - scale.min) / range || 0;
  const maxPercent = 1 - minPercent;

  return {
    min: newRange * minPercent,
    max: newRange * maxPercent
  };
}

function updateRange(scale, {min, max}, limits, zoom = false) {
  const {axis, options: scaleOpts} = scale;
  const {min: minLimit = -Infinity, max: maxLimit = Infinity, range: minRange = 0} = limits && limits[axis] || {};
  const cmin = Math.max(min, minLimit);
  const cmax = Math.min(max, maxLimit);
  const range = zoom ? Math.max(cmax - cmin, minRange) : scale.max - scale.min;
  if (cmax - cmin !== range) {
    if (minLimit > cmax - range) {
      min = cmin;
      max = cmin + range;
    } else if (maxLimit < cmin + range) {
      max = cmax;
      min = cmax - range;
    } else if (zoom && range === minRange) {
      min = scale.min;
      max = scale.max;
    } else {
      const offset = (range - cmax + cmin) / 2;
      min = cmin - offset;
      max = cmax + offset;
    }
  } else {
    min = cmin;
    max = cmax;
  }
  scaleOpts.min = min;
  scaleOpts.max = max;
}

function zoomNumericalScale(scale, zoom, center, limits) {
  const delta = zoomDelta(scale, zoom, center);
  const newRange = {min: scale.min + delta.min, max: scale.max - delta.max};
  updateRange(scale, newRange, limits, true);
}

const integerChange = (v) => v === 0 || isNaN(v) ? 0 : v < 0 ? Math.min(Math.round(v), -1) : Math.max(Math.round(v), 1);

function zoomCategoryScale(scale, zoom, center, limits) {
  const labels = scale.getLabels();
  const maxIndex = labels.length - 1;
  if (scale.min === scale.max && zoom < 1) {
    if (scale.min > 0) {
      scale.min--;
    } else if (scale.max < maxIndex) {
      scale.max++;
    }
  }
  const delta = zoomDelta(scale, zoom, center);
  const newRange = {min: scale.min + integerChange(delta.min), max: scale.max - integerChange(delta.max)};
  updateRange(scale, newRange, limits, true);
}

const categoryDelta = new WeakMap();
function panCategoryScale(scale, delta, panOptions, limits) {
  const labels = scale.getLabels();
  const lastLabelIndex = labels.length - 1;
  const offsetAmt = Math.max(scale.ticks.length, 1);
  const panSpeed = panOptions.speed;
  const step = Math.round(scale.width / (offsetAmt * panSpeed));
  const cumDelta = (categoryDelta.get(scale) || 0) + delta;
  const scaleMin = scale.min;
  const minIndex = cumDelta > step ? Math.max(0, scaleMin - 1)
    : cumDelta < -step ? Math.min(lastLabelIndex - offsetAmt + 1, scaleMin + 1)
    : scaleMin;
  const maxIndex = Math.min(lastLabelIndex, minIndex + offsetAmt - 1);

  categoryDelta.set(scale, minIndex !== scaleMin ? 0 : cumDelta);

  updateRange(scale, {min: minIndex, max: maxIndex}, limits);
}

function panNumericalScale(scale, delta, panOptions, limits) {
  const {min: prevStart, max: prevEnd} = scale;
  const newMin = scale.getValueForPixel(scale.getPixelForValue(prevStart) - delta);
  const newMax = scale.getValueForPixel(scale.getPixelForValue(prevEnd) - delta);
  updateRange(scale, {min: newMin, max: newMax}, limits);
}

export const zoomFunctions = {
  category: zoomCategoryScale,
  default: zoomNumericalScale,
};

export const panFunctions = {
  category: panCategoryScale,
  default: panNumericalScale,
};
