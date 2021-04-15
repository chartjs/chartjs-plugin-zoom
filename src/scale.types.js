import {isNullOrUndef} from 'chart.js/helpers';

function rangeMaxLimiter(zoomPanOptions, newMax) {
  const {scaleAxes, rangeMax} = zoomPanOptions;
  if (scaleAxes && rangeMax && !isNullOrUndef(rangeMax[scaleAxes])) {
    const limit = rangeMax[scaleAxes];
    if (newMax > limit) {
      newMax = limit;
    }
  }
  return newMax;
}

function rangeMinLimiter(zoomPanOptions, newMin) {
  const {scaleAxes, rangeMin} = zoomPanOptions;
  if (scaleAxes && rangeMin && !isNullOrUndef(rangeMin[scaleAxes])) {
    const limit = rangeMin[scaleAxes];
    if (newMin < limit) {
      newMin = limit;
    }
  }
  return newMin;
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
  scale.options.min = rangeMinLimiter(zoomOptions, scale.min + delta.min);
  scale.options.max = rangeMaxLimiter(zoomOptions, scale.max - delta.max);
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
  scale.options.min = labels[Math.max(0, rangeMinLimiter(zoomOptions, scale.min + integerChange(delta.min)))];
  scale.options.max = labels[Math.min(maxIndex, rangeMaxLimiter(zoomOptions, scale.max - integerChange(delta.max)))];
}

const categoryDelta = new WeakMap();
function panCategoryScale(scale, delta, panOptions) {
  const labels = scale.getLabels();
  const lastLabelIndex = labels.length - 1;
  const offsetAmt = Math.max(scale.ticks.length, 1);
  const panSpeed = panOptions.speed;
  const step = Math.round(scale.width / (offsetAmt * panSpeed));
  const cumDelta = (categoryDelta.get(scale) || 0) + delta;

  let minIndex = scale.min;
  let maxIndex;

  minIndex = cumDelta > step ? Math.max(0, minIndex - 1) : cumDelta < -step ? Math.min(lastLabelIndex - offsetAmt + 1, minIndex + 1) : minIndex;
  categoryDelta.set(scale, minIndex !== scale.min ? 0 : cumDelta);

  maxIndex = Math.min(lastLabelIndex, minIndex + offsetAmt - 1);

  scale.options.min = rangeMinLimiter(panOptions, labels[minIndex]);
  scale.options.max = rangeMaxLimiter(panOptions, labels[maxIndex]);
}

function panNumericalScale(scale, delta, panOptions) {
  const scaleOpts = scale.options;
  const prevStart = scale.min;
  const prevEnd = scale.max;
  const newMin = scale.getValueForPixel(scale.getPixelForValue(prevStart) - delta);
  const newMax = scale.getValueForPixel(scale.getPixelForValue(prevEnd) - delta);
  const rangeMin = rangeMinLimiter(panOptions, newMin);
  const rangeMax = rangeMaxLimiter(panOptions, newMax);
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
  time: zoomNumericalScale,
  linear: zoomNumericalScale,
  logarithmic: zoomNumericalScale,
};

export const panFunctions = {
  category: panCategoryScale,
  time: panNumericalScale,
  linear: panNumericalScale,
  logarithmic: panNumericalScale,
};
