import type { Chart, Point, Scale } from 'chart.js'
import type { DragOptions, ModeOption, ModifierKey, PanOptions } from './options'

const eventKey = (key: ModifierKey): 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey' => `${key}Key`

export const getModifierKey = (opts?: DragOptions | PanOptions): ModifierKey | undefined =>
  opts?.enabled && opts.modifierKey ? opts.modifierKey : undefined
export const keyPressed = (key: ModifierKey | undefined, event: TouchEvent | MouseEvent | PointerEvent) =>
  key && event[eventKey(key)]
export const keyNotPressed = (key: ModifierKey | undefined, event: TouchEvent | MouseEvent | PointerEvent) =>
  key && !event[eventKey(key)]

export function directionEnabled(mode: ModeOption | undefined, dir: 'x' | 'y', chart: Chart): boolean {
  if (mode === undefined) {
    return true
  } else if (typeof mode === 'string') {
    return mode.indexOf(dir) !== -1
  } else if (typeof mode === 'function') {
    return mode({ chart }).indexOf(dir) !== -1
  }

  return false
}

function directionsEnabled(mode: ModeOption | undefined, chart: Chart) {
  if (typeof mode === 'function') {
    mode = mode({ chart })
  }
  if (typeof mode === 'string') {
    return { x: mode.indexOf('x') !== -1, y: mode.indexOf('y') !== -1 }
  }

  return { x: false, y: false }
}

export function debounce(fn: () => void, delay: number | undefined) {
  let timeout: number | NodeJS.Timeout
  return function () {
    clearTimeout(timeout)
    timeout = setTimeout(fn, delay)
    return delay
  }
}

function getScaleUnderPoint({ x, y }: Point, chart: Chart): Scale | null {
  const scales = chart.scales
  const scaleIds = Object.keys(scales)
  for (let i = 0; i < scaleIds.length; i++) {
    const scale = scales[scaleIds[i]]
    if (y >= scale.top && y <= scale.bottom && x >= scale.left && x <= scale.right) {
      return scale
    }
  }
  return null
}

/**
 * Evaluate the chart's mode, scaleMode, and overScaleMode properties to
 * determine which axes are eligible for scaling.
 * options.overScaleMode can be a function if user want zoom only one scale of many for example.
 */
export function getEnabledScalesByPoint(options: PanOptions | undefined, point: Point, chart: Chart): Scale[] {
  const { mode = 'xy', scaleMode, overScaleMode } = options || {}
  const scale = getScaleUnderPoint(point, chart)

  const enabled = directionsEnabled(mode, chart)
  const scaleEnabled = directionsEnabled(scaleMode, chart)

  // Convert deprecated overScaleEnabled to new scaleEnabled.
  if (overScaleMode) {
    const overScaleEnabled = directionsEnabled(overScaleMode, chart)
    for (const axis of ['x', 'y'] as const) {
      if (overScaleEnabled[axis]) {
        scaleEnabled[axis] = enabled[axis]
        enabled[axis] = false
      }
    }
  }

  if (scale && scaleEnabled[scale.axis as 'x' | 'y']) {
    return [scale]
  }

  const enabledScales: Scale[] = []

  for (const scaleItem of Object.values(chart.scales)) {
    if (enabled[scaleItem.axis as 'x' | 'y']) {
      enabledScales.push(scaleItem)
    }
  }

  return enabledScales || Object.values(chart.scales)
}
