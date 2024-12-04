import { zoomDelta } from './scale.types'

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
})
