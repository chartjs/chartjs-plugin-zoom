import { Chart, Point, Color } from 'chart.js';


type Mode =  'x' | 'y' | 'xy';

interface DragEffectOptions {
	borderColor?: Color;
	borderWidth?: number;
	backgroundColor?: Color;
	animationDuration?: number;
}

/**
 * Container for zoop options
 */
interface ZoomOptions {
	/**
	 * Boolean to enable zooming
	 */
	enabled: boolean;

	/**
	 * Enable drag-to-zoom behavior
	 **/
	drag: boolean | DragEffectOptions;


	/** 
	 * Zooming directions. Remove the appropriate direction to disable
	 * Eg. 'y' would only allow zooming in the y direction
	 * A function that is called as the user is zooming and returns the
	 * available directions can also be used:
	 *    mode: function({ chart }) {
	 *      return 'xy';
	 *    },
	 */	
	mode: Mode | { (char: Chart): Mode };

	/**
	 * Format of min zoom range depends on scale type
	 */
	rangeMin?: Point;
	
	/**
	 * Format of max zoom range depends on scale type
	 */
	rangeMax?: Point;

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
	 * On category scale, minimal zoom level before actually applying zoom
	 */	
	sensitivity?: number;

	/**
	 * Function called while the user is zooming
	 */
	onZoom?: (chart: Chart) => void;
	
	/**
	 * Function called once zooming is completed
	 */
	onZoomComplete?: (chart: Chart) => void;
	
	/**
	 * Function called when wheel input occurs without modifier key
	 */
	onZoomRejected?: (chart: Chart, event: Event) => void;
	
}

/**
 * Container for pan options
 */
interface PanOptions {
	/**
	 * Boolean to enable panning
	 */
	enabled: boolean;


	/**
	 * Panning directions. Remove the appropriate direction to disable
	 * Eg. 'y' would only allow panning in the y direction
	 * A function that is called as the user is panning and returns the
	 * available directions can also be used:
	 *   mode: function({ chart }) {
	 *     return 'xy';
	 *   },
	 */
	mode: Mode | { (char: Chart): Mode };

	/**
	 * Format of min pan range depends on scale type
	 */
	rangeMin?: Point;
	
	/**
	 * Format of max pan range depends on scale type
	 */
	rangeMax?: Point;


	/**
	 * On category scale, factor of pan velocity
	 */
	speed?: number;

	/**
	 * Minimal pan distance required before actually applying pan
	 */
	threshold?: number;

	/**
	 * Function called while the user is panning
	 */
	onPan?: (chart: Chart) => void;
	
	/**
	 * Function called once panning is completed
	 */
	onPanComplete?: (chart: Chart) => void;
	
	/**
	 * Function called when pan fails because modifier key was not detected.
	 * event is the a hammer event that failed - see https://hammerjs.github.io/api#event-object
	 */
	onPanRejected: (chart: Chart, event: Event) => void;
}


export interface ZoomPluginOptions {
	pan?: PanOptions;
	zoom?: ZoomOptions;
}
