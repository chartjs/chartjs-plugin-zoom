import { panFunctions, zoomDelta } from './scale.types'
import { getState } from './state'
import type { Scale } from 'chart.js'

function createCategoryScale({
  categories,
  min,
  max,
  width,
}: {
  categories: number
  min: number
  max: number
  width: number
}) {
  const chart = {}
  const labels = Array.from({ length: categories }, (_, i) => `${i}`)
  const scale = {
    id: 'x',
    axis: 'x',
    type: 'category',
    chart,
    min,
    max,
    width,
    height: 0,
    options: {},
    getLabels: () => labels,
    isHorizontal: () => true,
    parse: (value: unknown) => value as number,
  } as unknown as Scale

  // `fixRange` reads the original limits for the scale, so they have to exist.
  getState(chart as never).originalScaleLimits[scale.id] = { min: {}, max: {} }

  return scale
}

describe('utils', () => {
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
  })
})
