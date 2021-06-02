# Developers

You can extend chartjs-plugin-zoom with support for [custom scales](https://www.chartjs.org/docs/latest/developers/axes.html) by using the zoom plugin's `zoomFunctions` and `panFunctions` members. These objects are indexed by scale types (scales' `id` members) and give optional handlers for zoom and pan functionality.

```js
import {Scale} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

class MyScale extends Scale {
  /* extensions ... */
}
MyScale.id = 'myScale';
MyScale.defaults = defaultConfigObject;

zoomPlugin.zoomFunctions.myScale = (scale, zoom, center, limits) => false;
zoomPlugin.panFunctions.myScale = (scale, delta, limits) => false;
```

The zoom and pan functions take the following arguments:

| Name | Type | For | Description
| ---- | ---- | --- | ----------
| `scale` | `Scale` | Zoom, Pan | The custom scale instance (usually derived from `Chart.Scale`)
| `zoom` | `number` | Zoom | The zoom fraction; 1.0 is unzoomed, 0.5 means zoomed in to 50% of the original area, etc.
| `center` | `{x, y}` | Zoom | Pixel coordinates of the center of the zoom operation. `{x: 0, y: 0}` is the upper left corner of the chart's canvas.
| `pan` | `number` | Pan | Pixel amount to pan by
| `limits` | [Limits](./options#limits) | Zoom, Pan | Zoom and pan limits (from chart options)

For examples, see chartjs-plugin-zoom's [default zoomFunctions and panFunctions handling for standard Chart.js axes](https://github.com/chartjs/chartjs-plugin-zoom/blob/v1.0.1/src/scale.types.js#L128).
