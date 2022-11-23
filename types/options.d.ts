import { Chart, Color, Point } from 'chart.js';


type Mode = 'x' | 'y' | 'xy';
type Key = 'ctrl' | 'alt' | 'shift' | 'meta';
type DrawTime = 'afterDraw' | 'afterDatasetsDraw' | 'beforeDraw' | 'beforeDatasetsDraw';

export interface WheelOptions {
  /**
   * Enable the zoom via mouse wheel
   */
  enabled?: boolean;

  /**
   * Speed of zoom via mouse wheel
   * (percentage of zoom on a wheel event)
   */
  speed?: number;

  /**
   * Modifier key required for zooming with mouse
   */
  modifierKey?: Key;
}

export interface DragOptions {
  /**
   * Enable the zoom via drag
   */
  enabled?: boolean;

  /**
   * Minimal zoom distance required before actually applying zoom
   */
  threshold?: number;

  /**
   * Border color of the drag area
   */
  borderColor?: Color;

  /**
   * Border width of the drag area
   */
  borderWidth?: number;

  /**
   * Background color of the drag area
   */
  backgroundColor?: Color;

  /**
   * Modifier key required for drag-to-zoom
   */
  modifierKey?: Key;

  /**
   * Draw time required for drag-to-zoom
   */
  drawTime?: DrawTime;
}

export interface PinchOptions {
  /**
   * Enable the zoom via pinch
   */
  enabled?: boolean;
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
  mode?: Mode | { (chart: Chart): Mode };

  /**
   * Options of the mouse wheel mode
   */
  wheel?: WheelOptions;

  /**
   * Options of the drag-to-zoom mode
   */
  drag?: DragOptions;

  /**
   * Options of the pinch mode
   */
  pinch?: PinchOptions;

  scaleMode?: Mode | { (chart: Chart): Mode };
  /** @deprecated Use scaleMode instead */
  overScaleMode?: Mode | { (chart: Chart): Mode };

  /**
   * Function called while the user is zooming
   */
  onZoom?: (context: { chart: Chart }) => void;

  /**
   * Function called once zooming is completed
   */
  onZoomComplete?: (context: { chart: Chart }) => void;

  /**
   * Function called when wheel input occurs without modifier key
   */
  onZoomRejected?: (context: { chart: Chart, event: Event }) => void;

  onZoomStart?: (context: { chart: Chart, event: Event, point: Point }) => void;
}

/**
 * Container for pan options
 */
export interface PanOptions {
  /**
   * Boolean to enable panning
   */
  enabled?: boolean;

  /**
   * Panning directions. Remove the appropriate direction to disable
   * E.g. 'y' would only allow panning in the y direction
   * A function that is called as the user is panning and returns the
   * available directions can also be used:
   *   mode: function({ chart }) {
   *     return 'xy';
   *   },
   */
  mode?: Mode | { (char: Chart): Mode };

  /**
   * Modifier key required for panning with mouse
   */
  modifierKey?: Key;

  scaleMode?: Mode | { (chart: Chart): Mode };
  /** @deprecated Use scaleMode instead */
  overScaleMode?: Mode | { (chart: Chart): Mode };

  /**
   * Minimal pan distance required before actually applying pan
   */
  threshold?: number;

  /**
   * Function called while the user is panning
   */
  onPan?: (context: { chart: Chart }) => void;

  /**
   * Function called once panning is completed
   */
  onPanComplete?: (context: { chart: Chart }) => void;

  /**
   * Function called when pan fails because modifier key was not detected.
   * event is the a hammer event that failed - see https://hammerjs.github.io/api#event-object
   */
  onPanRejected?: (context: { chart: Chart, event: Event }) => void;

  onPanStart?: (context: { chart: Chart, event: Event, point: Point }) => boolean | undefined;
}

export interface ScaleLimits {
  min?: number | 'original';
  max?: number | 'original';
  minRange?: number;
}

export interface LimitOptions {
  // Scale limits, indexed by the scale's ID (key) or by axis (x/y)
  [axisId: string]: ScaleLimits;
}

export interface ZoomPluginOptions {
  pan?: PanOptions;
  limits?: LimitOptions;
  zoom?: ZoomOptions;
}
