# Options

The options for chartjs-plugin-zoom should be placed in `options.plugins.zoom` in chart.js configuration.

The options are split in three sub-objects, [pan](#pan) [range](#range) and [zoom](#zoom).

```js
const chart = new Chart('id', {
  type: 'bar',
  data: {},
  options: {
    plugins: {
      zoom: {
        pan: {
          // pan options and/or events
        },
        range: {
          // scale range limits
        },
        zoom: {
          // zoom options and/or events
        }
      }
    }
  }
});
```

## Pan

### Pan Options

| Name | Type | Default | Description
| ---- | ---- | ------- | ----------
| `enabled` | `boolean` | `false` | Enable panning
| `mode` | `'x'`\|`'y'`\|`'xy'` | `'xy'` | Allowed panning directions
| `modifierKey` | `'ctrl'`\|`'alt'`\|`'shift'`\|`'meta'` | `null` |  Modifier key required for panning with mouse
| `overScaleMode` | `'x'`\|`'y'`\|`'xy'` | `undefined` | Which of the enabled panning directions should only be available when the mouse cursor is over a scale for that axis
| `speed` | `number` | `20` | Factor for pan velocity on **category scale**
| `threshold` | `number` | `10` | Mimimal pan distance required before actually applying pan

### Pan Events

| Name | Arguments | Description
| ---- | --------- | -----------
| `onPan` | `{chart}` | Called while the chart is being panned
| `onPanComplete` | `{chart}` | Called once panning is completed
| `onPanRejected` | `{chart,event}` | Called when panning is rejected due to missing modifier key. `event` is the a [hammer event](https://hammerjs.github.io/api#event-object) that failed

## Zoom

### Zoom Options

| Name | Type | Default | Description
| ---- | ---- | ------- | ----------
| `enabled` | `boolean` | `false` | Enable zooming
| `drag` | `boolean` | `undefined` | Enable drag-to-zoom behavior (disables zooming by wheel)
| `mode` | `'x'`\|`'y'`\|`'xy'` | `'xy'` | Allowed zoom directions
| `overScaleMode` | `'x'`\|`'y'`\|`'xy'` | `undefined` | Which of the enabled zooming directions should only be available when the mouse cursor is over a scale for that axis
| `speed` | `number` | `0.1` | Factor of zoom speed via mouse wheel.
| `threshold` | `number` | `0` | Mimimal zoom distance required before actually applying zoom
| `wheelModifierKey` | `'ctrl'`\|`'alt'`\|`'shift'`\|`'meta'` | `null` |  Modifier key required for zooming with mouse

### Zoom Events

| Name | Arguments | Description
| ---- | --------- | -----------
| `onZoom` | `{chart}` | Called while the chart is being zoomed
| `onZoomComplete` | `{chart}` | Called once zooming is completed
| `onZoomRejected` | `{chart,event}` | Called when zoom is rejected due to missing modifier key. `event` is the a [hammer event](https://hammerjs.github.io/api#event-object) that failed

## Range

Range options define the limits for scale pan and zoom.

### Range options

| Name | Type | Description
| ---- | -----| -----------
| `x` | [`ScaleRange`](#scale-range) | Range limits for x-axis
| `y` | [`ScaleRange`](#scale-range) | Range limits for x-axis

#### Scale Range

| Name | Type | Description
| ---- | -----| -----------
| `min` | `number` | Minimun allowed value for scale.min
| `max` | `number` | Maximum allowed value for scale.max
| `range` | `number` | Minimum allowed range (max - min). This defines the max zoom level.
