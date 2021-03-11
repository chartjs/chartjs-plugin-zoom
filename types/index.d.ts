import { Plugin, ChartType } from 'chart.js';
import { ZoomPluginOptions } from './options';

declare module 'chart.js' {
	interface PluginOptionsByType<TType extends ChartType> {
	  zoom: ZoomPluginOptions;
	}
}

export declare const Zoom: Plugin;
