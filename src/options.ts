import type { Chart, Color, Point } from 'chart.js'

export type Mode = 'x' | 'y' | 'xy'
export type ModeFn = (context: { chart: Chart }) => Mode
export type ModeOption = Mode | ModeFn
export type ModifierKey = 'ctrl' | 'alt' | 'shift' | 'meta'
export type DrawTime = 'afterDraw' | 'afterDatasetsDraw' | 'beforeDraw' | 'beforeDatasetsDraw'
export type ZoomTrigger = 'api' | 'drag' | 'wheel' | 'pinch'

type RejectableStartEvent<T = Event | HammerInput> = (context: {
  chart: Chart
  event: T
  point: Point
}) => boolean | undefined
type RejectEvent<T = Event | HammerInput> = (context: { chart: Chart; event: T }) => void

type GenericEvent = (context: { chart: Chart }) => void

export interface WheelOptions {
  /**
   * Enable the zoom via mouse wheel
   */
  enabled?: boolean

  /**
   * Speed of zoom via mouse wheel
   * (percentage of zoom on a wheel event)
   */
  speed?: number

  /**
   * Modifier key required for zooming with mouse
   */
  modifierKey?: ModifierKey | null
}

export interface DragOptions {
  /**
   * Enable the zoom via drag
   */
  enabled?: boolean

  /**
   * Minimal zoom distance required before actually applying zoom
   */
  threshold?: number

  /**
   * Border color of the drag area
   */
  borderColor?: Color

  /**
   * Border width of the drag area
   */
  borderWidth?: number

  /**
   * Background color of the drag area
   */
  backgroundColor?: Color

  /**
   * Modifier key required for drag-to-zoom
   */
  modifierKey?: ModifierKey | null

  /**
   * Draw time required for drag-to-zoom
   */
  drawTime?: DrawTime

  /**
   * Maintain aspect ratio of the drag rectangle
   */
  maintainAspectRatio?: boolean
}

export interface PinchOptions {
  /**
   * Enable the zoom via pinch
   */
  enabled?: boolean
}

/**
 * Container for zoom options
 */
export interface ZoomOptions {
  /**
   * Zooming directions. Remove the appropriate direction to disable
   * E.g. 'y' would only allow zooming in the y direction
   * A function that is called as the user is zooming and returns the
   * available directions can also be used:
   *    mode: function({ chart }) {
   *      return 'xy';
   *    },
   */
  mode?: ModeOption

  /**
   * Options of the mouse wheel mode
   */
  wheel?: WheelOptions

  /**
   * Options of the drag-to-zoom mode
   */
  drag?: DragOptions

  /**
   * Options of the pinch mode
   */
  pinch?: PinchOptions

  scaleMode?: ModeOption
  /** @deprecated Use scaleMode instead */
  overScaleMode?: ModeOption

  /**
   * Function called while the user is zooming
   */
  onZoom?: (context: { chart: Chart; trigger: ZoomTrigger }) => void

  /**
   * Function called once zooming is completed
   */
  onZoomComplete?: GenericEvent

  /**
   * Function called when wheel input occurs without modifier key
   */
  onZoomRejected?: RejectEvent<Event>

  onZoomStart?: RejectableStartEvent<Event>
}

/**
 * Container for pan options
 */
export interface PanOptions {
  /**
   * Boolean to enable panning
   */
  enabled?: boolean

  /**
   * Panning directions. Remove the appropriate direction to disable
   * E.g. 'y' would only allow panning in the y direction
   * A function that is called as the user is panning and returns the
   * available directions can also be used:
   *   mode: function({ chart }) {
   *     return 'xy';
   *   },
   */
  mode?: ModeOption

  /**
   * Modifier key required for panning with mouse
   */
  modifierKey?: ModifierKey | null

  scaleMode?: ModeOption
  /** @deprecated Use scaleMode instead */
  overScaleMode?: ModeOption

  /**
   * Minimal pan distance required before actually applying pan
   */
  threshold?: number

  /**
   * Function called while the user is panning
   */
  onPan?: GenericEvent

  /**
   * Function called once panning is completed
   */
  onPanComplete?: GenericEvent

  /**
   * Function called when pan fails because modifier key was not detected.
   * event is the Hammer event that failed - see https://hammerjs.github.io/api#event-object
   */
  onPanRejected?: RejectEvent<HammerInput>

  onPanStart?: RejectableStartEvent<HammerInput>
}

export interface ScaleLimits {
  min?: number | 'original'
  max?: number | 'original'
  minRange?: number
}

export interface LimitOptions {
  // Scale limits, indexed by the scale's ID (key) or by axis (x/y)
  [axisId: string]: ScaleLimits
}

export interface ZoomPluginOptions {
  pan?: PanOptions
  limits?: LimitOptions
  zoom?: ZoomOptions
}
