import { Plugin, ChartType, Scale, UpdateMode, ScaleTypeRegistry } from 'chart.js';
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
    zoom(zoom: ZoomAmount, mode?: UpdateMode): void;
    zoomRect(p0: Point, p1: Point, mode?: UpdateMode): void;
    zoomScale(id: string, range: ScaleRange, mode?: UpdateMode): void;
    resetZoom(mode?: UpdateMode): void;
    getZoomLevel(): number;
    getInitialScaleBounds(): Record<string, {min: number, max: number}>;
    isZoomedOrPanned(): boolean;
  }
}

export type ZoomFunction = (scale: Scale, zoom: number, center: Point, limits: LimitOptions) => boolean;
export type ZoomRectFunction = (scale: Scale, from: number, to: number, limits: LimitOptions) => boolean;
export type PanFunction = (scale: Scale, delta: number, limits: LimitOptions) => boolean;

type ScaleFunctions<T> = {
  [scaleType in keyof ScaleTypeRegistry]?: T | undefined;
} & {
  default: T;
};

declare const Zoom: Plugin & {
  zoomFunctions: ScaleFunctions<ZoomFunction>;
  zoomRectFunctions: ScaleFunctions<ZoomRectFunction>;
  panFunctions: ScaleFunctions<PanFunction>;
};

export default Zoom;
