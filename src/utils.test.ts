import type { Chart, Scale } from 'chart.js'
import type { ModeOption, PanOptions } from './options.js'
import {
  debounce,
  directionEnabled,
  getEnabledScalesByPoint,
  getModifierKey,
  keyNotPressed,
  keyPressed,
} from './utils.js'

describe('utils', () => {
  describe('getModifierKey', () => {
    it('returns the key of enabled options', () => {
      expect(getModifierKey({ enabled: true, modifierKey: 'ctrl' })).toBe('ctrl')
    })

    it('returns undefined when the options are disabled, have no key or are missing', () => {
      expect(getModifierKey({ enabled: false, modifierKey: 'ctrl' })).toBeUndefined()
      expect(getModifierKey({ enabled: true })).toBeUndefined()
      expect(getModifierKey(undefined)).toBeUndefined()
    })
  })

  describe('keyPressed and keyNotPressed', () => {
    const event = (init: Partial<MouseEvent>) => init as MouseEvent

    for (const key of ['ctrl', 'alt', 'shift', 'meta'] as const) {
      it(`reads ${key}Key from the event`, () => {
        expect(keyPressed(key, event({ [`${key}Key`]: true }))).toBe(true)
        expect(keyPressed(key, event({ [`${key}Key`]: false }))).toBe(false)
        expect(keyNotPressed(key, event({ [`${key}Key`]: true }))).toBe(false)
        expect(keyNotPressed(key, event({ [`${key}Key`]: false }))).toBe(true)
      })
    }

    it('is falsy both ways when no key is required', () => {
      expect(keyPressed(undefined, event({ ctrlKey: true }))).toBeFalsy()
      expect(keyNotPressed(undefined, event({ ctrlKey: false }))).toBeFalsy()
    })
  })

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

        const modeFn = vi.fn().mockReturnValue(mode)

        expect(directionEnabled(modeFn, dir, chart)).toEqual(expected)
        expect(modeFn).toHaveBeenCalledWith({ chart })
      })
    }

    it('enables both directions when no mode is set', () => {
      expect(directionEnabled(undefined, 'x', chart)).toBe(true)
      expect(directionEnabled(undefined, 'y', chart)).toBe(true)
    })

    it('enables nothing for a mode that is neither a string nor a function', () => {
      expect(directionEnabled(1 as unknown as ModeOption, 'x', chart)).toBe(false)
    })
  })

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns the delay', () => {
      expect(debounce(() => undefined, 250)()).toBe(250)
    })

    it('calls the function once, after the delay has passed since the last call', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)

      debounced()
      vi.advanceTimersByTime(60)
      debounced()
      vi.advanceTimersByTime(60)

      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(40)

      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('getEnabledScalesByPoint', () => {
    // A 100x100 chart area with the x scale below it, y on the left and y2 on the right.
    const x = { id: 'x', axis: 'x', left: 10, right: 110, top: 100, bottom: 110 } as Scale
    const y = { id: 'y', axis: 'y', left: 0, right: 10, top: 0, bottom: 100 } as Scale
    const y2 = { id: 'y2', axis: 'y', left: 110, right: 120, top: 0, bottom: 100 } as Scale
    const chart = { scales: { x, y, y2 } } as unknown as Chart

    const inChartArea = { x: 50, y: 50 }
    const overX = { x: 50, y: 105 }
    const overY = { x: 5, y: 50 }
    const overY2 = { x: 115, y: 50 }

    const scalesFor = (options: PanOptions | undefined, point = inChartArea) =>
      getEnabledScalesByPoint(options, point, chart)

    it('returns every scale by default', () => {
      expect(scalesFor(undefined)).toEqual([x, y, y2])
      expect(scalesFor({})).toEqual([x, y, y2])
    })

    it('returns the scales of the axes in mode', () => {
      expect(scalesFor({ mode: 'x' })).toEqual([x])
      expect(scalesFor({ mode: 'y' })).toEqual([y, y2])
      expect(scalesFor({ mode: 'xy' })).toEqual([x, y, y2])
    })

    it('accepts a function as mode', () => {
      const mode = vi.fn().mockReturnValue('y')

      expect(scalesFor({ mode })).toEqual([y, y2])
      expect(mode).toHaveBeenCalledWith({ chart })
    })

    it('returns nothing for a mode that is neither a string nor a function', () => {
      expect(scalesFor({ mode: 1 as unknown as ModeOption })).toEqual([])
    })

    it('ignores the scale under the point without scaleMode', () => {
      expect(scalesFor({ mode: 'x' }, overY)).toEqual([x])
    })

    it('returns only the scale under the point when its axis is in scaleMode', () => {
      expect(scalesFor({ mode: 'xy', scaleMode: 'y' }, overY)).toEqual([y])
      expect(scalesFor({ mode: 'xy', scaleMode: 'y' }, overY2)).toEqual([y2])
      expect(scalesFor({ mode: 'xy', scaleMode: 'xy' }, overX)).toEqual([x])
    })

    it('falls back to mode when the scale under the point is not in scaleMode', () => {
      expect(scalesFor({ mode: 'xy', scaleMode: 'y' }, overX)).toEqual([x, y, y2])
      expect(scalesFor({ mode: 'xy', scaleMode: 'y' }, inChartArea)).toEqual([x, y, y2])
    })

    it('accepts a function as scaleMode', () => {
      expect(scalesFor({ mode: 'x', scaleMode: () => 'y' }, overY)).toEqual([y])
    })

    describe('with the deprecated overScaleMode', () => {
      it('returns only the scale under the point when its axis is in overScaleMode', () => {
        expect(scalesFor({ mode: 'xy', overScaleMode: 'y' }, overY)).toEqual([y])
      })

      it('removes the axes in overScaleMode from mode elsewhere', () => {
        expect(scalesFor({ mode: 'xy', overScaleMode: 'y' }, inChartArea)).toEqual([x])
        expect(scalesFor({ mode: 'xy', overScaleMode: 'y' }, overX)).toEqual([x])
      })

      it('does not enable an axis that mode leaves out', () => {
        expect(scalesFor({ mode: 'x', overScaleMode: 'y' }, overY)).toEqual([x])
      })

      it('accepts a function', () => {
        expect(scalesFor({ mode: 'xy', overScaleMode: () => 'x' }, overX)).toEqual([x])
        expect(scalesFor({ mode: 'xy', overScaleMode: () => 'x' }, inChartArea)).toEqual([y, y2])
      })
    })
  })
})
