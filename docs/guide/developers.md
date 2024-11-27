# Developers

## Imperative Zoom/Pan API

Alongside user-driven interactions, it is also possible to imperatively interact with the chart, either to manually zoom into a selected region, or to get information about the current zoom status.

### `chart.pan(delta, scales?, mode = 'none'): void`

Pans the current chart by the specified amount in one or more axes.  The value of `delta` can be a number, in which case all axes are panned by the same amount, or it can be an `{x, y}` object to pan different amounts in the horizontal and vertical directions.  The value of `scales` is a list of scale objects that should be panned - by default, all scales of the chart will be panned.  The value of `mode` should be one of the Chart.js [animation modes](https://www.chartjs.org/docs/latest/configuration/animations.html#default-transitions).

### `chart.zoom(zoomLevel, mode = 'none'): void`

Zooms the current chart by the specified amount in one more axes.  The value of `zoomLevel` can be a number, in which case all axes are zoomed by the same amount, or it can be an `{x, y}` object to zoom different amounts in the horizontal and vertical directions.  The value of `mode` should be one of the Chart.js [animation modes](https://www.chartjs.org/docs/latest/configuration/animations.html#default-transitions).

### `chart.zoomScale(scaleId, newRange, mode = 'none'): void`

Zooms the specified scale to the range given by `newRange`.  This is an object in the form `{min, max}` and represents the new bounds of that scale.  The value of `mode` should be one of the Chart.js [animation modes](https://www.chartjs.org/docs/latest/configuration/animations.html#default-transitions).

### `chart.resetZoom(mode = 'none'): void`

Resets the current chart bounds to the defaults that were used before any zooming or panning occurred.  The value of `mode` should be one of the Chart.js [animation modes](https://www.chartjs.org/docs/latest/configuration/animations.html#default-transitions).

### `chart.getZoomLevel(): number`

Returns the current zoom level.  If this is the same as the chart's initial scales, the value returned will be `1.0`.  Otherwise, the value will be less than one if the chart has been zoomed out, and more than one if it has been zoomed in.  If different axes have been zoomed by different amounts, the returned value will be the zoom level of the most zoomed out axis if any have been zoomed out, otherwise it will be the zoom level of the most zoomed-in axis.

If the chart has been panned but not zoomed, this method will still return `1.0`.

### `chart.getInitialScaleBounds(): Record<string, {min: number | undefined, max: number | undefined}>`

Returns the initial scale bounds of each scale before any zooming or panning took place.  This is returned in the format of an object, e.g.

```json
{
  x: {min: 0, max: 100},
  y1: {min: 50, max: 80},
  y2: {min: 0.1, max: 0.8}
}
```

### `chart.getZoomedScaleBounds(): Record<string, {min: number, max: number}>`

Returns the updated scale bounds of each scale after any zooming or panning took place.  This is returned in the format of an object, e.g.

```json
{
  x: {min: 25, max: 75},
  y1: {min: 60, max: 90},
  y2: undefined
}
```

Scale IDs that have not been zoomed will be `undefined` within the returned object.

### `chart.isZoomedOrPanned(): boolean`

Returns whether the chart has been zoomed or panned - i.e. whether the initial scale of any axis is different to the one used currently.

### `chart.isZoomingOrPanning(): boolean`

Returns whether the user is currently in the middle of a drag operation or pan operation.

## Custom Scales

You can extend chartjs-plugin-zoom with support for [custom scales](https://www.chartjs.org/docs/latest/developers/axes.html) by using the zoom plugin's `zoomFunctions`, `zoomRectFunctions`, and `panFunctions` members. These objects are indexed by scale types (scales' `id` members) and give optional handlers for zoom and pan functionality.

```js
import {Scale} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'

class MyScale extends Scale {
  /* extensions ... */
}
MyScale.id = 'myScale'
MyScale.defaults = defaultConfigObject

zoomPlugin.zoomFunctions.myScale = (scale, zoom, center, limits) => false
zoomPlugin.zoomRectFunctions.myScale = (scale, from, to, limits) => false
zoomPlugin.panFunctions.myScale = (scale, delta, limits) => false
// zoomRectFunctions can normally be omitted, since zooming by specific pixel
// coordinates rarely needs special handling.
```

The zoom, zoomRect, and pan functions take the following arguments:

| Name | Type | For | Description
| ---- | ---- | --- | ----------
| `scale` | `Scale` | Zoom, Pan | The custom scale instance (usually derived from `Chart.Scale`)
| `zoom` | `number` | Zoom | The zoom fraction; 1.0 is unzoomed, 0.5 means zoomed in to 50% of the original area, etc.
| `center` | `{x, y}` | Zoom | Pixel coordinates of the center of the zoom operation. `{x: 0, y: 0}` is the upper left corner of the chart's canvas.
| `from` | `number` | ZoomRect | Pixel coordinate of the start of the zoomRect operation.
| `to` | `number` | ZoomRect | Pixel coordinate of the end of the zoomRect operation.
| `delta` | `number` | Pan | Pixel amount to pan by
| `limits` | [Limits](./options#limits) | Zoom, Pan | Zoom and pan limits (from chart options)

For examples, see chartjs-plugin-zoom's [default zoomFunctions, zoomRectFunctions, and panFunctions handling for standard Chart.js axes](https://github.com/chartjs/chartjs-plugin-zoom/blob/v1.0.1/src/scale.types.js#L128).
