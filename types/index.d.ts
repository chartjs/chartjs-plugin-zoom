import { Plugin, ChartType, Chart, Scale } from 'chart.js';
import { DistributiveArray } from 'chart.js/types/utils';
import { ZoomPluginOptions } from './options';

type Point = { x: number, y: number };
type ZoomAmount = number | Partial<Point> & { focalPoint?: Point };
type PanAmount = number | Partial<Point>;
declare module 'chart.js' {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface PluginOptionsByType<TType extends ChartType> {
    zoom: ZoomPluginOptions;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chart<TType extends keyof ChartTypeRegistry = keyof ChartTypeRegistry, TData = DistributiveArray<ChartTypeRegistry[TType]['defaultDataPoint']>, TLabel = unknown> {
    pan(pan: PanAmount, scales?: Scale[]): void;
    zoom(zoom: ZoomAmount, useTransition?: boolean): void;
    resetZoom(): void;
  }
}

declare const Zoom: Plugin;

export default Zoom;

export function doPan(chart: Chart, pan: PanAmount, scales?: Scale[]): void;
export function doZoom(chart: Chart, zoom: ZoomAmount, useTransition?: boolean): void;
export function resetZoom(chart: Chart): void;
