import {isNullOrUndef} from 'chart.js/helpers';

function rangeMaxLimiter(rangeMax, axis, newMax) {
  const limit = rangeMax && rangeMax[axis];
  return !isNullOrUndef(limit) && newMax > limit ? limit : newMax;
}

function rangeMinLimiter(rangeMin, axis, newMin) {
  const limit = rangeMin && rangeMin[axis];
  return !isNullOrUndef(limit) && newMin < limit ? limit : newMin;
}

function zoomDelta(scale, zoom, center) {
  const range = scale.max - scale.min;
  const newDiff = range * (zoom - 1);

  const centerPoint = scale.isHorizontal() ? center.x : center.y;
  const minPercent = (scale.getValueForPixel(centerPoint) - scale.min) / range;
  const maxPercent = 1 - minPercent;

  return {
    min: newDiff * minPercent,
    max: newDiff * maxPercent
  };
}

function zoomNumericalScale(scale, zoom, center, zoomOptions) {
  const delta = zoomDelta(scale, zoom, center);
  const {axis, options: scaleOpts} = scale;
  scaleOpts.min = rangeMinLimiter(zoomOptions.rangeMin, axis, scale.min + delta.min);
  scaleOpts.max = rangeMaxLimiter(zoomOptions.rangeMax, axis, scale.max - delta.max);
}

const integerChange = (v) => v === 0 || isNaN(v) ? 0 : v < 0 ? Math.min(Math.round(v), -1) : Math.max(Math.round(v), 1);

function zoomCategoryScale(scale, zoom, center, zoomOptions) {
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
  const {axis, options: scaleOpts} = scale;
  scaleOpts.min = Math.max(0, rangeMinLimiter(zoomOptions.rangeMin, axis, scale.min + integerChange(delta.min)));
  scaleOpts.max = Math.min(maxIndex, rangeMaxLimiter(zoomOptions.rangeMax, axis, scale.max - integerChange(delta.max)));
}

const categoryDelta = new WeakMap();
function panCategoryScale(scale, delta, panOptions) {
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

  const {axis, options: scaleOpts} = scale;
  scaleOpts.min = rangeMinLimiter(panOptions.rangeMin, axis, minIndex);
  scaleOpts.max = rangeMaxLimiter(panOptions.rangeMax, axis, maxIndex);
}

function panNumericalScale(scale, delta, panOptions) {
  const {axis, min: prevStart, max: prevEnd, options: scaleOpts} = scale;
  const newMin = scale.getValueForPixel(scale.getPixelForValue(prevStart) - delta);
  const newMax = scale.getValueForPixel(scale.getPixelForValue(prevEnd) - delta);
  const rangeMin = rangeMinLimiter(panOptions.rangeMin, axis, newMin);
  const rangeMax = rangeMaxLimiter(panOptions.rangeMax, axis, newMax);
  let diff;

  if (newMin >= rangeMin && newMax <= rangeMax) {
    scaleOpts.min = newMin;
    scaleOpts.max = newMax;
  } else if (newMin < rangeMin) {
    diff = prevStart - rangeMin;
    scaleOpts.min = rangeMin;
    scaleOpts.max = prevEnd - diff;
  } else if (newMax > rangeMax) {
    diff = rangeMax - prevEnd;
    scaleOpts.max = rangeMax;
    scaleOpts.min = prevStart + diff;
  }
}

export const zoomFunctions = {
  category: zoomCategoryScale,
  default: zoomNumericalScale,
};

export const panFunctions = {
  category: panCategoryScale,
  default: panNumericalScale,
};
