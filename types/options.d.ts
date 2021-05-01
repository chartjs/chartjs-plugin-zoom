import { Chart, Color, Point } from 'chart.js';


type Mode = 'x' | 'y' | 'xy';

export interface DragEffectOptions {
  borderColor?: Color;
  borderWidth?: number;
  backgroundColor?: Color;
}

/**
 * Container for zoop options
 */
export interface ZoomOptions {
  /**
   * Boolean to enable zooming
   */
  enabled?: boolean;

  /**
   * Enable drag-to-zoom behavior
   **/
  drag?: boolean | DragEffectOptions;


  /**
   * Zooming directions. Remove the appropriate direction to disable
   * Eg. 'y' would only allow zooming in the y direction
   * A function that is called as the user is zooming and returns the
   * available directions can also be used:
   *    mode: function({ chart }) {
   *      return 'xy';
   *    },
   */
  mode?: Mode | { (char: Chart): Mode };

  overScaleMode?: Mode | { (char: Chart): Mode };

  /**
   * Speed of zoom via mouse wheel
   * (percentage of zoom on a wheel event)
   */
  speed?: number;

  /**
   * Minimal zoom distance required before actually applying zoom
   */
  threshold?: number;

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
   * Eg. 'y' would only allow panning in the y direction
   * A function that is called as the user is panning and returns the
   * available directions can also be used:
   *   mode: function({ chart }) {
   *     return 'xy';
   *   },
   */
  mode?: Mode | { (char: Chart): Mode };

  overScaleMode?: Mode | { (char: Chart): Mode };

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

export interface LimitOptions {
  x?: {
    min?: number;
    max?: number;
    minRange?: number;
  },
  y?: {
    min?: number;
    max?: number;
    minRange?: number;
  }
}

export interface ZoomPluginOptions {
  pan?: PanOptions;
  limits?: LimitOptions;
  zoom?: ZoomOptions;
}
