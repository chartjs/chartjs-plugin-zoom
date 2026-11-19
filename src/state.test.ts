import { getState, removeState } from './state'
import type { Chart } from 'chart.js'

describe('state', () => {
  it('creates an empty state for a chart', () => {
    expect(getState({} as Chart)).toEqual({
      originalScaleLimits: {},
      updatedScaleLimits: {},
      handlers: {},
      options: {},
      targets: {},
      panDelta: {},
      dragging: false,
      panning: false,
    })
  })

  it('returns the same state for the same chart', () => {
    const chart = {} as Chart
    const state = getState(chart)
    state.dragging = true

    expect(getState(chart)).toBe(state)
  })

  it('keeps the state of each chart separate', () => {
    expect(getState({} as Chart)).not.toBe(getState({} as Chart))
  })

  it('starts over after the state is removed', () => {
    const chart = {} as Chart
    const state = getState(chart)
    state.panning = true

    removeState(chart)

    expect(getState(chart)).not.toBe(state)
    expect(getState(chart).panning).toBe(false)
  })
})
