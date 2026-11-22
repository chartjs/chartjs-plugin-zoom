import { panFunctions, updateRange, zoomDelta, zoomFunctions, zoomRectFunctions } from './scale.types'
import { getState, type OriginalLimits } from './state'
import type { Scale } from 'chart.js'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

type MockScaleConfig = {
  min: number
  max: number
  id?: string
  axis?: 'x' | 'y'
  type?: string
  /** Length of the scale in pixels. Pixel 0 is at `min`. */
  length?: number
  labels?: number
  options?: object
  original?: OriginalLimits
  parse?: (value: unknown) => unknown
}

/**
 * A scale that maps values to pixels linearly (or logarithmically, for the
 * logarithmic type) over its current min and max, like the real ones do.
 */
function createScale({
  min,
  max,
  id,
  axis = 'x',
  type = 'linear',
  length = 100,
  labels = 0,
  options = {},
  original = { min: {}, max: {} },
  parse = (value) => value,
}: MockScaleConfig) {
  const chart = {}
  const log = type === 'logarithmic'
  const toLinear = (value: number) => (log ? Math.log10(value) : value)
  const fromLinear = (value: number) => (log ? Math.pow(10, value) : value)
  const labelList = Array.from({ length: labels }, (_, i) => `${i}`)
  const scale = {
    id: id ?? axis,
    axis,
    type,
    chart,
    min,
    max,
    width: axis === 'x' ? length : 0,
    height: axis === 'y' ? length : 0,
    options,
    getLabels: () => labelList,
    isHorizontal: () => axis === 'x',
    parse,
    getValueForPixel(pixel: number): number | undefined {
      const start = toLinear(scale.min)
      return fromLinear(start + (pixel / length) * (toLinear(scale.max) - start))
    },
    getPixelForValue(value: number) {
      const start = toLinear(scale.min)
      return ((toLinear(value) - start) / (toLinear(scale.max) - start)) * length
    },
  }

  // `fixRange` reads the original limits for the scale, so they have to exist.
  getState(chart as never).originalScaleLimits[scale.id] = original

  return scale as unknown as Scale
}

const rangeOf = (scale: Scale) => ({ min: scale.options.min, max: scale.options.max })
const at = (pixel: number) => ({ x: pixel, y: pixel })

/** For ranges that come out of a pixel round trip, and so are not exact. */
function expectRangeCloseTo(scale: Scale, min: number, max: number) {
  expect(scale.options.min).toBeCloseTo(min)
  expect(scale.options.max).toBeCloseTo(max)
}

const createCategoryScale = ({
  categories,
  min,
  max,
  width,
}: {
  categories: number
  min: number
  max: number
  width: number
}) => createScale({ min, max, type: 'category', labels: categories, length: width })

describe('scale.types', () => {
  describe('zoomDelta', () => {
    for (const { val, min, range, newRange, expected } of [
      { val: undefined, min: 100, range: 100, newRange: -10, expected: { min: -0, max: -10 } },
      { val: undefined, min: undefined, range: 1, newRange: 1, expected: { min: 0, max: 1 } },
      { val: undefined, min: undefined, range: undefined, newRange: 1, expected: { min: 0, max: 1 } },
      { val: undefined, min: undefined, range: undefined, newRange: undefined, expected: { min: NaN, max: NaN } },

      { val: 0, min: 0, range: 0, newRange: 1, expected: { min: 0, max: 1 } },

      { val: 0, min: 0, range: 2, newRange: -1, expected: { min: -0, max: -1 } },

      { val: 0, min: 0, range: 1, newRange: 2, expected: { min: 0, max: 2 } },
      { val: 1, min: 0, range: 1, newRange: 2, expected: { min: 2, max: 0 } },
      { val: 1, min: 1, range: 1, newRange: 2, expected: { min: 0, max: 2 } },

      { val: 1, min: 0, range: 2, newRange: 4, expected: { min: 2, max: 2 } },
    ]) {
      it(`returns ${expected} for ${val}, ${min}, ${range}, ${newRange},`, () => {
        // @ts-expect-error using invalid values
        expect(zoomDelta(val, min, range, newRange)).toEqual(expected)
      })
    }
  })

  describe('panFunctions.category', () => {
    it('pans by a proportional number of categories when they are wider than a pixel', () => {
      // 400px / 20 visible categories = 20px per category, so a 25px drag moves one category.
      const scale = createCategoryScale({ categories: 100, min: 40, max: 59, width: 400 })

      panFunctions.category(scale, 25, {})

      expect(scale.options.min).toBe(39)
      expect(scale.options.max).toBe(58)
    })

    it('pans by a proportional number of categories when they are narrower than a pixel', () => {
      // 400px / 5000 visible categories = 0.08px per category, so a 10px drag moves 125 of them.
      // Rounding that step down to a whole pixel makes it 0, and panning then jumps to the end.
      const scale = createCategoryScale({ categories: 10000, min: 4000, max: 8999, width: 400 })

      panFunctions.category(scale, 10, {})

      expect(scale.options.min).toBe(3875)
      expect(scale.options.max).toBe(8874)
    })

    it('does not pan past the first category', () => {
      const scale = createCategoryScale({ categories: 10000, min: 50, max: 5049, width: 400 })

      panFunctions.category(scale, 10, {})

      expect(scale.options.min).toBe(0)
      expect(scale.options.max).toBe(4999)
    })

    it('does not pan past the last category', () => {
      const scale = createCategoryScale({ categories: 10000, min: 4950, max: 9949, width: 400 })

      panFunctions.category(scale, -10, {})

      expect(scale.options.min).toBe(5000)
      expect(scale.options.max).toBe(9999)
    })

    it('reports a pan that reaches the first or the last category as applied', () => {
      const atEnd = createCategoryScale({ categories: 10, min: 5, max: 9, width: 100 })

      // The range does not change, but there is no delta left to store either.
      expect(panFunctions.category(atEnd, -25, {})).toBe(true)
      expect(rangeOf(atEnd)).toEqual({ min: 5, max: 9 })

      const atStart = createCategoryScale({ categories: 10, min: 0, max: 4, width: 100 })

      expect(panFunctions.category(atStart, 25, {})).toBe(true)
      expect(rangeOf(atStart)).toEqual({ min: 0, max: 4 })
    })

    it('does not pan before the drag is one step long', () => {
      const scale = createCategoryScale({ categories: 10, min: 2, max: 6, width: 100 })

      expect(panFunctions.category(scale, 5, {})).toBe(false)
      expect(panFunctions.category(scale, -5, {})).toBe(false)
      expect(rangeOf(scale)).toEqual({ min: 2, max: 6 })
    })

    it('keeps a single visible category single', () => {
      const dragLeft = createCategoryScale({ categories: 10, min: 5, max: 5, width: 100 })

      expect(panFunctions.category(dragLeft, -20, {})).toBe(true)
      expect(rangeOf(dragLeft)).toEqual({ min: 7, max: 7 })

      const dragRight = createCategoryScale({ categories: 10, min: 5, max: 5, width: 100 })

      expect(panFunctions.category(dragRight, 20, {})).toBe(true)
      expect(rangeOf(dragRight)).toEqual({ min: 3, max: 3 })
    })

    it('uses the height of a vertical scale', () => {
      const scale = createScale({ min: 40, max: 59, axis: 'y', type: 'category', labels: 100, length: 400 })

      panFunctions.category(scale, 25, {})

      expect(rangeOf(scale)).toEqual({ min: 39, max: 58 })
    })
  })

  describe('updateRange', () => {
    it('stores the new range in the scale options and in the state', () => {
      const scale = createScale({ min: 0, max: 100 })

      expect(updateRange(scale, { min: 20, max: 60 }, undefined, true)).toBe(true)
      expect(rangeOf(scale)).toEqual({ min: 20, max: 60 })
      expect(getState(scale.chart).updatedScaleLimits.x).toEqual({ min: 20, max: 60 })
    })

    it('returns false when the range does not change', () => {
      const scale = createScale({ min: 0, max: 100 })

      expect(updateRange(scale, { min: 0, max: 100 }, undefined, true)).toBe(false)
    })

    it('compares parsed values to tell if the range changed', () => {
      const scale = createScale({ min: 0, max: 100, parse: (value) => Math.round(value as number) })

      expect(updateRange(scale, { min: 0.2, max: 99.8 }, undefined, true)).toBe(false)
    })

    it('keeps the size of the range when not zooming, centered on the requested one', () => {
      const scale = createScale({ min: 0, max: 100 })

      updateRange(scale, { min: 10, max: 50 })

      expect(rangeOf(scale)).toEqual({ min: -20, max: 80 })
    })

    it('snaps to the original limits when the range is very close to them', () => {
      const scale = createScale({ min: 20, max: 80, original: { min: { scale: 0 }, max: { scale: 100 } } })

      updateRange(scale, { min: 0.00001, max: 99.99999 }, undefined, true)

      expect(rangeOf(scale)).toEqual({ min: 0, max: 100 })
    })

    describe('limits', () => {
      it('moves the range up when it starts below the minimum', () => {
        const scale = createScale({ min: 0, max: 100 })

        updateRange(scale, { min: -30, max: 20 }, { x: { min: 0 } }, true)

        expect(rangeOf(scale)).toEqual({ min: 0, max: 50 })
      })

      it('moves the range down when it ends above the maximum', () => {
        const scale = createScale({ min: 0, max: 100 })

        updateRange(scale, { min: 80, max: 130 }, { x: { max: 100 } }, true)

        expect(rangeOf(scale)).toEqual({ min: 50, max: 100 })
      })

      it('clamps a range wider than the limits to the limits', () => {
        const below = createScale({ min: 0, max: 100 })
        updateRange(below, { min: -30, max: 120 }, { x: { min: 0, max: 100 } }, true)

        expect(rangeOf(below)).toEqual({ min: 0, max: 100 })

        const above = createScale({ min: 0, max: 100 })
        updateRange(above, { min: 10, max: 160 }, { x: { min: 0, max: 100 } }, true)

        expect(rangeOf(above)).toEqual({ min: 0, max: 100 })
      })

      it('are looked up by scale id first, then by axis', () => {
        const byAxis = createScale({ min: 0, max: 100, id: 'top' })
        updateRange(byAxis, { min: -30, max: 20 }, { x: { min: -10 } }, true)

        expect(rangeOf(byAxis)).toEqual({ min: -10, max: 40 })

        const byId = createScale({ min: 0, max: 100, id: 'top' })
        updateRange(byId, { min: -30, max: 20 }, { top: { min: -5 }, x: { min: -10 } }, true)

        expect(rangeOf(byId)).toEqual({ min: -5, max: 45 })
      })

      it('do not apply to other scales', () => {
        const scale = createScale({ min: 0, max: 100 })

        updateRange(scale, { min: -30, max: 20 }, { y: { min: 0 } }, true)

        expect(rangeOf(scale)).toEqual({ min: -30, max: 20 })
      })

      it('stop a pan that would cross them, keeping the size of the range', () => {
        const limits = { x: { min: 0, max: 100 } }

        const low = createScale({ min: 10, max: 60 })
        expect(updateRange(low, { min: -20, max: 30 }, limits, false, true)).toBe(true)
        expect(rangeOf(low)).toEqual({ min: 0, max: 50 })

        const high = createScale({ min: 10, max: 60 })
        expect(updateRange(high, { min: 70, max: 120 }, limits, false, true)).toBe(true)
        expect(rangeOf(high)).toEqual({ min: 50, max: 100 })
      })

      it('leave the options alone when a pan ends where the scale already is', () => {
        const scale = createScale({ min: 0, max: 100 })
        const limits = { x: { min: 0, max: 100 } }

        // true tells the caller there is no delta left to store
        expect(updateRange(scale, { min: -5, max: 95 }, limits, false, true)).toBe(true)
        expect(updateRange(scale, { min: 5, max: 105 }, limits, false, true)).toBe(true)
        expect(rangeOf(scale)).toEqual({ min: undefined, max: undefined })
      })

      it('drop a pan that would cross them on a scale that pans by zooming', () => {
        const scale = createScale({ min: 10, max: 60 })
        const limits = { x: { min: 0, max: 100 } }

        expect(updateRange(scale, { min: -20, max: 30 }, limits, true, true)).toBe(true)
        expect(updateRange(scale, { min: 70, max: 120 }, limits, true, true)).toBe(true)
        expect(rangeOf(scale)).toEqual({ min: undefined, max: undefined })
      })

      it('widen a zoom that is narrower than minRange', () => {
        const scale = createScale({ min: 0, max: 100 })

        updateRange(scale, { min: 25, max: 75 }, { x: { minRange: 80 } }, true)

        expect(rangeOf(scale)).toEqual({ min: 10, max: 90 })
      })

      it('leave the range alone when the scale is already at minRange', () => {
        const scale = createScale({ min: 10, max: 90 })

        expect(updateRange(scale, { min: 25, max: 75 }, { x: { minRange: 80 } }, true)).toBe(true)
        expect(rangeOf(scale)).toEqual({ min: undefined, max: undefined })
      })
    })

    describe("'original' limits", () => {
      const limits = { x: { min: 'original', max: 'original' } } as const

      it('use the numeric min and max of the original scale options', () => {
        const scale = createScale({
          min: 20,
          max: 80,
          original: { min: { options: 10, scale: 0 }, max: { options: 90, scale: 100 } },
        })

        updateRange(scale, { min: -50, max: 150 }, limits, true)

        expect(rangeOf(scale)).toEqual({ min: 10, max: 90 })
      })

      it('parse original scale options that are not numbers', () => {
        const scale = createScale({
          min: 20,
          max: 80,
          original: {
            min: { options: '1970-01-01T00:00:00.015Z', scale: 0 },
            max: { options: '1970-01-01T00:00:00.085Z', scale: 100 },
          },
          parse: (value) => (typeof value === 'string' ? Date.parse(value) : value),
        })

        updateRange(scale, { min: -50, max: 150 }, limits, true)

        expect(rangeOf(scale)).toEqual({ min: 15, max: 85 })
      })

      it('use the original scale range when the options are missing or cannot be parsed', () => {
        const scale = createScale({
          min: 20,
          max: 80,
          original: { min: { scale: 0 }, max: { options: 'nonsense', scale: 100 } },
          parse: Number,
        })

        updateRange(scale, { min: -50, max: 150 }, limits, true)

        expect(rangeOf(scale)).toEqual({ min: 0, max: 100 })
      })
    })
  })

  describe('zoomFunctions.default', () => {
    it('zooms in around the center point', () => {
      const scale = createScale({ min: 0, max: 100 })

      expect(zoomFunctions.default(scale, 1.5, at(50), {})).toBe(true)
      expect(rangeOf(scale)).toEqual({ min: 25, max: 75 })
    })

    it('keeps the value under the center point in place', () => {
      const atStart = createScale({ min: 0, max: 100 })
      zoomFunctions.default(atStart, 1.2, at(0), {})

      expect(rangeOf(atStart)).toEqual({ min: 0, max: 80 })

      const atEnd = createScale({ min: 0, max: 100 })
      zoomFunctions.default(atEnd, 1.2, at(100), {})

      expect(rangeOf(atEnd)).toEqual({ min: 20, max: 100 })
    })

    it('treats a center point outside the scale as its nearest end', () => {
      const scale = createScale({ min: 0, max: 100 })

      zoomFunctions.default(scale, 1.2, at(-40), {})

      expect(rangeOf(scale)).toEqual({ min: 0, max: 80 })
    })

    it('zooms out', () => {
      const scale = createScale({ min: 0, max: 100 })

      zoomFunctions.default(scale, 0.5, at(50), {})

      expect(rangeOf(scale)).toEqual({ min: -25, max: 125 })
    })

    it('reads the y coordinate of the center point for a vertical scale', () => {
      const scale = createScale({ min: 0, max: 100, axis: 'y' })

      zoomFunctions.default(scale, 1.2, { x: 0, y: 100 }, {})

      expect(rangeOf(scale)).toEqual({ min: 20, max: 100 })
    })

    it('respects the limits', () => {
      const scale = createScale({ min: 0, max: 100 })

      expect(zoomFunctions.default(scale, 0.5, at(50), { x: { min: 0, max: 100 } })).toBe(false)
      expect(rangeOf(scale)).toEqual({ min: 0, max: 100 })
    })
  })

  describe('zoomFunctions.logarithmic', () => {
    it('zooms in by orders of magnitude around the center point', () => {
      const scale = createScale({ min: 1, max: 10000, type: 'logarithmic' })

      expect(zoomFunctions.logarithmic(scale, 1.5, at(50), {})).toBe(true)
      expectRangeCloseTo(scale, 10, 1000)
    })

    it('zooms out', () => {
      const scale = createScale({ min: 10, max: 1000, type: 'logarithmic' })

      zoomFunctions.logarithmic(scale, 0.5, at(50), {})

      expectRangeCloseTo(scale, Math.pow(10, 0.5), Math.pow(10, 3.5))
    })

    it('keeps the range when there is no value at the center point', () => {
      const scale = createScale({ min: 1, max: 10000, type: 'logarithmic' })
      scale.getValueForPixel = () => undefined

      expect(zoomFunctions.logarithmic(scale, 1.5, at(50), {})).toBe(false)
      expect(rangeOf(scale)).toEqual({ min: 1, max: 10000 })
    })
  })

  describe('zoomFunctions.category', () => {
    const category = (min: number, max: number) => createScale({ min, max, type: 'category', labels: 10 })

    it('zooms in by whole categories', () => {
      const scale = category(2, 8)

      expect(zoomFunctions.category(scale, 1.5, at(50), {})).toBe(true)
      expect(rangeOf(scale)).toEqual({ min: 4, max: 6 })
    })

    it('zooms out by whole categories', () => {
      const scale = category(2, 8)

      zoomFunctions.category(scale, 0.5, at(50), {})

      expect(rangeOf(scale)).toEqual({ min: 1, max: 9 })
    })

    it('changes by at least one category for any zoom', () => {
      const zoomedIn = category(2, 8)
      zoomFunctions.category(zoomedIn, 1.01, at(50), {})

      expect(rangeOf(zoomedIn)).toEqual({ min: 3, max: 7 })

      const zoomedOut = category(2, 8)
      zoomFunctions.category(zoomedOut, 0.99, at(50), {})

      expect(rangeOf(zoomedOut)).toEqual({ min: 1, max: 9 })
    })

    it('does not change without a zoom', () => {
      const scale = category(2, 8)

      expect(zoomFunctions.category(scale, 1, at(50), {})).toBe(false)
      expect(rangeOf(scale)).toEqual({ min: 2, max: 8 })
    })

    it('zooms out from a single category', () => {
      const scale = category(5, 5)

      zoomFunctions.category(scale, 0.5, at(50), {})

      expect(rangeOf(scale)).toEqual({ min: 4, max: 6 })
    })

    it('zooms out from the first or the last category without leaving the labels', () => {
      const first = category(0, 0)
      zoomFunctions.category(first, 0.5, at(50), {})

      expect(rangeOf(first)).toEqual({ min: 0, max: 1 })

      const last = category(9, 9)
      zoomFunctions.category(last, 0.5, at(50), {})

      expect(rangeOf(last)).toEqual({ min: 8, max: 9 })
    })

    it('stays on a single category when zooming in', () => {
      const scale = category(5, 5)

      // true tells the caller there is no delta left to store
      expect(zoomFunctions.category(scale, 1.5, at(50), {})).toBe(true)
      expect(rangeOf(scale)).toEqual({ min: undefined, max: undefined })
    })
  })

  describe('zoomRectFunctions.default', () => {
    it('zooms to the values at the two pixels, in either order', () => {
      const forward = createScale({ min: 0, max: 100 })

      expect(zoomRectFunctions.default(forward, 20, 80, {})).toBe(true)
      expect(rangeOf(forward)).toEqual({ min: 20, max: 80 })

      const backward = createScale({ min: 0, max: 100 })
      zoomRectFunctions.default(backward, 80, 20, {})

      expect(rangeOf(backward)).toEqual({ min: 20, max: 80 })
    })

    it('uses the current range for pixels that have no value', () => {
      const scale = createScale({ min: 0, max: 100 })
      scale.getValueForPixel = () => undefined

      expect(zoomRectFunctions.default(scale, 20, 80, {})).toBe(false)
      expect(rangeOf(scale)).toEqual({ min: 0, max: 100 })
    })

    it('respects the limits', () => {
      const scale = createScale({ min: 0, max: 100 })

      zoomRectFunctions.default(scale, 20, 80, { x: { minRange: 80 } })

      expect(rangeOf(scale)).toEqual({ min: 10, max: 90 })
    })
  })

  describe('panFunctions.default', () => {
    it('moves the range against the direction of the drag', () => {
      const dragRight = createScale({ min: 0, max: 100 })

      expect(panFunctions.default(dragRight, 10, {})).toBe(true)
      expectRangeCloseTo(dragRight, -10, 90)

      const dragLeft = createScale({ min: 0, max: 100 })
      panFunctions.default(dragLeft, -10, {})

      expectRangeCloseTo(dragLeft, 10, 110)
    })

    it('scales the delta by the length of the scale', () => {
      const scale = createScale({ min: 0, max: 100, length: 400 })

      panFunctions.default(scale, 100, {})

      expectRangeCloseTo(scale, -25, 75)
    })

    it('does not pan past the limits', () => {
      const scale = createScale({ min: 0, max: 100 })

      expect(panFunctions.default(scale, 10, { x: { min: 0 } })).toBe(true)
      expect(rangeOf(scale)).toEqual({ min: undefined, max: undefined })
    })

    it('does not change a scale that has no dimensions', () => {
      const scale = createScale({ min: 0, max: 100 })
      scale.getValueForPixel = () => NaN

      expect(panFunctions.default(scale, 10, {})).toBe(true)
      expect(rangeOf(scale)).toEqual({ min: undefined, max: undefined })

      scale.getValueForPixel = () => undefined

      expect(panFunctions.default(scale, 10, {})).toBe(true)
      expect(rangeOf(scale)).toEqual({ min: undefined, max: undefined })
    })

    it('pans a time scale', () => {
      const scale = createScale({ min: 0, max: 10 * DAY, type: 'time', options: { time: {} } })

      panFunctions.default(scale, -10, {})

      expectRangeCloseTo(scale, DAY, 11 * DAY)
    })

    it('offsets a rounded time scale by half of the rounding unit', () => {
      // Without the offset, a drag shorter than half a day would always round back to where it started.
      const scale = createScale({ min: 0, max: 10 * DAY, type: 'time', options: { time: { round: 'day' } } })

      panFunctions.default(scale, -10, {})

      expectRangeCloseTo(scale, DAY + 12 * HOUR, 11 * DAY + 12 * HOUR)
    })

    it('does not offset other scale types', () => {
      const scale = createScale({ min: 0, max: 10 * DAY, options: { time: { round: 'day' } } })

      panFunctions.default(scale, -10, {})

      expectRangeCloseTo(scale, DAY, 11 * DAY)
    })
  })

  for (const type of ['logarithmic', 'timeseries'] as const) {
    describe(`panFunctions.${type}`, () => {
      it('takes the size of the range from where the ends land, as the scale is not linear', () => {
        const scale = createScale({ min: 1, max: 10000, type: 'logarithmic' })

        expect(panFunctions[type](scale, 25, {})).toBe(true)
        expectRangeCloseTo(scale, 0.1, 1000)
      })

      it('does not pan past the limits', () => {
        const scale = createScale({ min: 1, max: 10000, type: 'logarithmic' })

        expect(panFunctions[type](scale, 25, { x: { min: 1 } })).toBe(true)
        expect(rangeOf(scale)).toEqual({ min: undefined, max: undefined })
      })

      it('makes a pan that would cross a limit end at the limit', () => {
        // Two decades over 100px, so 75px is a decade and a half: half a decade too far.
        const limits = { x: { min: 1, max: 10000 } }
        const towardsMin = createScale({ min: 10, max: 1000, type: 'logarithmic' })

        expect(panFunctions[type](towardsMin, 75, limits)).toBe(true)
        expect(towardsMin.options.min).toBe(1)
        expect(towardsMin.options.max).toBeCloseTo(100)

        const towardsMax = createScale({ min: 10, max: 1000, type: 'logarithmic' })

        expect(panFunctions[type](towardsMax, -75, limits)).toBe(true)
        expect(towardsMax.options.min).toBeCloseTo(100)
        expect(towardsMax.options.max).toBe(10000)
      })

      it('still drops a pan further out from a view the limits do not cover', () => {
        const scale = createScale({ min: 10, max: 1000, type: 'logarithmic' })

        expect(panFunctions[type](scale, 25, { x: { min: 100 } })).toBe(true)
        expect(rangeOf(scale)).toEqual({ min: undefined, max: undefined })
      })
    })
  }
})
