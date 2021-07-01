import { Plugin, ChartType, Chart, Scale, UpdateMode, ScaleTypeRegistry } from 'chart.js';
import { DistributiveArray } from 'chart.js/types/utils';
import { LimitOptions, ZoomPluginOptions } from './options';

type Point = { x: number, y: number };
type ZoomAmount = number | Partial<Point> & { focalPoint?: Point };
type PanAmount = number | Partial<Point>;
type ScaleRange = { min: number, max: number };

declare module 'chart.js' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface PluginOptionsByType<TType extends ChartType> {
    zoom: ZoomPluginOptions;
  }

  enum UpdateModeEnum {
    zoom = 'zoom'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chart<TType extends keyof ChartTypeRegistry = keyof ChartTypeRegistry, TData = DistributiveArray<ChartTypeRegistry[TType]['defaultDataPoint']>, TLabel = unknown> {
    pan(pan: PanAmount, scales?: Scale[], mode?: UpdateMode): void;
    zoom(zoom: ZoomAmount, useTransition?: boolean, mode?: UpdateMode): void;
    zoomScale(id: string, range: ScaleRange, mode?: UpdateMode): void;
    resetZoom(mode?: UpdateMode): void;
    getZoomLevel(): number;
  }
}

export type ZoomFunction = (scale: Scale, zoom: number, center: Point, limits: LimitOptions) => boolean;
export type PanFunction = (scale: Scale, delta: number, limits: LimitOptions) => boolean;

type ScaleFunctions<T> = {
  [scaleType in keyof ScaleTypeRegistry]?: T | undefined;
} & {
  default: T;
};

declare const Zoom: Plugin & {
  zoomFunctions: ScaleFunctions<ZoomFunction>;
  panFunctions: ScaleFunctions<PanFunction>;
};

export default Zoom;

export function pan(chart: Chart, amount: PanAmount, scales?: Scale[], mode?: UpdateMode): void;
export function zoom(chart: Chart, amount: ZoomAmount, mode?: UpdateMode): void;
export function zoomScale(chart: Chart, scaleId: string, range: ScaleRange, mode?: UpdateMode): void;
export function resetZoom(chart: Chart, mode?: UpdateMode): void;
export function getZoomLevel(chart: Chart): number;
