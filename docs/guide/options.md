# Options

The options for chartjs-plugin-zoom should be placed in `options.plugins.zoom` in chart.js configuration.

The options are split in three sub-objects, [limits](#limits), [pan](#pan) and [zoom](#zoom).

```js
export const chart = new Chart('id', {
  type: 'bar',
  data: {},
  options: {
    plugins: {
      zoom: {
        pan: {
          // pan options and/or events
        },
        limits: {
          // axis limits
        },
        zoom: {
          // zoom options and/or events
        }
      }
    }
  }
})
```

## Pan

### Pan Options

| Name | Type | Default | Description
| ---- | ---- | ------- | ----------
| `enabled` | `boolean` | `false` | Enable panning
| `mode` | `'x'`\|`'y'`\|`'xy'` | `'xy'` | Allowed panning directions
| `modifierKey` | `'ctrl'`\|`'alt'`\|`'shift'`\|`'meta'` | `null` |  Modifier key required for panning with mouse
| `scaleMode` | `'x'`\|`'y'`\|`'xy'` | `undefined` | Enable panning over a scale for that axis (regardless of mode)
| `overScaleMode` | `'x'`\|`'y'`\|`'xy'` | `undefined` | Enable panning over a scale for that axis (but only if mode is also enabled), and disables panning along that axis otherwise. Deprecated.
| `threshold` | `number` | `10` | Minimal pan distance required before actually applying pan

### Pan Events

| Name | Arguments | Description
| ---- | --------- | -----------
| `onPan` | `{chart,trigger,delta,ranges}` | Called while the chart is being panned. See [what the callbacks are told](#what-onzoom-and-onpan-are-told)
| `onPanComplete` | `{chart}` | Called once panning is completed
| `onPanRejected` | `{chart,event}` | Called when panning is rejected due to missing modifier key. `event` is the normalized gesture event that failed
| `onPanStart` | `{chart,event,point}` | Called when panning is about to start. If this callback returns false, panning is aborted and `onPanRejected` is invoked

## Zoom

### Zoom Options

| Name | Type | Default | Description
| ---- | ---- | ------- | ----------
| `wheel` | [`WheelOptions`](#wheel-options) | | Options of the mouse wheel behavior
| `drag` | [`DragOptions`](#drag-options) | | Options of the drag-to-zoom behavior
| `pinch` | [`PinchOptions`](#pinch-options) | | Options of the pinch behavior
| `mode` | `'x'`\|`'y'`\|`'xy'` | `'xy'` | Allowed zoom directions
| `scaleMode` | `'x'`\|`'y'`\|`'xy'` | `undefined` | Which of the enabled zooming directions should only be available when the mouse cursor is over a scale for that axis
| `overScaleMode` | `'x'`\|`'y'`\|`'xy'` | `undefined` | Allowed zoom directions when the mouse cursor is over a scale for that axis (but only if mode is also enabled), and disables zooming along that axis otherwise. Deprecated; use `scaleMode` instead.

#### Wheel options

| Name | Type | Default | Description
| ---- | -----| ------- | -----------
| `enabled` | `boolean` | `false` | Enable zooming via mouse wheel
| `speed` | `number` | `0.1` | Factor of zoom speed applied per notch of a mouse wheel
| `modifierKey` | `'ctrl'`\|`'alt'`\|`'shift'`\|`'meta'` | `null` |  Modifier key required for zooming via mouse wheel

#### Drag options

| Name | Type | Default | Description
| ---- | -----| ------- | -----------
| `enabled` | `boolean` | `false` | Enable drag-to-zoom
| `backgroundColor` | `Color` | `'rgba(225,225,225,0.3)'` | Fill color
| `borderColor` | `Color` | `'rgba(225,225,225)'` | Stroke color
| `borderWidth` | `number` | `0` | Stroke width
| [`drawTime`](#draw-time) | `string` | `beforeDatasetsDraw` | When the dragging box is drawn on the chart
| `threshold` | `number` | `0` | Minimal zoom distance required before actually applying zoom
| `modifierKey` | `'ctrl'`\|`'alt'`\|`'shift'`\|`'meta'` | `null` |  Modifier key required for drag-to-zoom
| `maintainAspectRatio` | `boolean` | `undefined` | Maintain aspect ratio of the chart

## Draw Time

The `drawTime` option for zooming determines where in the chart lifecycle the drag box drawing occurs. Four potential options are available:

| Option | Notes
| ---- | ----
| `'beforeDraw'` | Occurs before any drawing takes place
| `'beforeDatasetsDraw'` | Occurs after drawing of axes, but before datasets
| `'afterDatasetsDraw'` | Occurs after drawing of datasets but before items such as the tooltip
| `'afterDraw'` | After other drawing is completed

#### Pinch options

| Name | Type | Default | Description
| ---- | -----| ------- | -----------
| `enabled` | `boolean` | `false` | Enable zooming via pinch

### Zoom Events

| Name | Arguments | Description
| ---- | --------- | -----------
| `onZoom` | `{chart,trigger,ranges,amount}` | Called while the chart is being zoomed. See [what the callbacks are told](#what-onzoom-and-onpan-are-told)
| `onZoomComplete` | `{chart}` | Called once zooming is completed
| `onZoomRejected` | `{chart,event}` | Called when zoom is rejected due to missing modifier key. `event` is the native event that failed
| `onZoomStart` | `{chart,event,point}` | Called when zooming is about to start. If this callback returns false, zooming is aborted and `onZoomRejected` is invoked

### What `onZoom` and `onPan` are told

| Name | Type | In | Description
| ---- | ---- | -- | -----------
| `chart` | `Chart` | both | The chart
| `trigger` | `string` | both | What caused it. For a zoom `'wheel'`, `'drag'`, `'pinch'` or `'api'`, for a pan `'drag'` or `'api'`. `'api'` is a call from code, such as `chart.zoom()` or `chart.pan()`
| `ranges` | `{[scaleId]: {min, max}}` | both | The scales the zoom or pan acted on, each with the range it has afterwards. Limits have been applied
| `amount` | `{x, y, focalPoint}` | `onZoom` | The zoom factors that were asked for. Only present when zooming by a factor, which is with the wheel, a pinch or `chart.zoom()`; a drag zoom and `chart.zoomScale()` zoom to a range instead
| `delta` | `{x, y}` | `onPan` | The distance in pixels the pan was asked for

`amount` and `delta` are the request, before limits. They only mean the same on another chart if that chart has the same size and the same scales, so to repeat what the user did on other charts, use `ranges`:

```js
function sync({chart, trigger, ranges}) {
  if (trigger === 'api') {
    // Came from the loop below, on another chart.
    return
  }
  for (const other of charts) {
    if (other !== chart) {
      for (const [scaleId, range] of Object.entries(ranges)) {
        other.zoomScale(scaleId, range)
      }
    }
  }
}

const options = {
  plugins: {
    zoom: {
      pan: {enabled: true, onPan: sync},
      zoom: {wheel: {enabled: true}, onZoom: sync},
    }
  }
}
```

## Touch devices

When panning or pinch zooming is enabled, the plugin sets the [`touch-action`](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) style of the canvas so that touch gestures reach the chart instead of scrolling or zooming the page. It claims only the directions those gestures use:

| Directions used | `touch-action` | On the chart
| ---- | ---- | ----
| `x` only | `pan-y` | A vertical swipe scrolls the page
| `y` only | `pan-x` | A horizontal swipe scrolls the page
| both | `none` | The page does not scroll

The directions used are those of `pan.mode` and `pan.scaleMode` when panning is enabled, and of `zoom.mode` when pinch zooming is enabled. A `modifierKey` only applies to the mouse, so it does not free a direction for scrolling. The value is recomputed on every chart update.

To keep a page scrollable on a phone when the chart fills most of the screen, limit these to one axis. The browser's own pinch zoom is always turned off over the chart, in all three cases.

## Limits

Limits options define the limits per axis for pan and zoom.

### Limit options

| Name | Type | Description
| ---- | -----| -----------
| `x` | [`ScaleLimits`](#scale-limits) | Limits for x-axis
| `y` | [`ScaleLimits`](#scale-limits) | Limits for y-axis

If you're using multiple or custom axes (scales), you can define limits for those, too.

```js
export const chart = new Chart('id', {
  type: 'line',
  data: {},
  options: {
    scales: {
      y: {
        min: 20,
        max: 80,
      },
      y2: {
        position: 'right',
        min: -5,
        max: 5
      }
    },
    plugins: {
      zoom: {
        limits: {
          y: {min: 0, max: 100},
          y2: {min: -5, max: 5}
        },
      }
    }
  }
})
```

#### Scale Limits

| Name | Type | Description
| ---- | -----| -----------
| `min` | `number | 'original'` | Minimum allowed value for scale.min
| `max` | `number | 'original'` | Maximum allowed value for scale.max
| `minRange` | `number` | Minimum allowed range (max - min). This defines the max zoom level.

You may use the keyword `'original'` in place of a numeric limit to instruct chartjs-plugin-zoom to use whatever limits the scale had when the chart was first displayed.
