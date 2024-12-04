import type { Chart } from 'chart.js'
import type { ModeOption } from './options.js'
import { directionEnabled } from './utils.js'

describe('utils', () => {
  describe('directionEnabled', () => {
    const chart = {} as Chart
    const testCases: Array<{ mode: ModeOption | undefined; dir: 'x' | 'y'; expected: boolean }> = [
      { mode: 'xy', dir: 'x', expected: true },
      { mode: 'x', dir: 'x', expected: true },
      { mode: 'y', dir: 'x', expected: false },

      { mode: 'xy', dir: 'y', expected: true },
      { mode: 'x', dir: 'y', expected: false },
      { mode: 'y', dir: 'y', expected: true },
    ]

    for (const { mode, dir, expected } of testCases) {
      it(`returns ${expected} when mode is ${mode} and required direction is ${dir}`, () => {
        expect(directionEnabled(mode, dir, chart)).toEqual(expected)

        const modeFn = jasmine.createSpy('mode').and.returnValue(mode)

        expect(directionEnabled(modeFn, dir, chart)).toEqual(expected)
        expect(modeFn).toHaveBeenCalledWith({ chart })
      })
    }
  })
})
