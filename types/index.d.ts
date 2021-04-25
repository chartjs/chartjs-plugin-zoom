import { Plugin, ChartType } from 'chart.js';
import { ZoomPluginOptions } from './options';

declare module 'chart.js' {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface PluginOptionsByType<TType extends ChartType> {
    zoom: ZoomPluginOptions;
	}
}

export declare const Zoom: Plugin;
