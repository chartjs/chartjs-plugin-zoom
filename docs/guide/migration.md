# Migrating to 3.0

Version 3 removes the Hammer.js dependency and changes how the package is built and published. The options are unchanged: a 2.x configuration works as it is.

## Hammer.js is no longer used

Pan and pinch gestures are recognized from the browser's native [Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events). The plugin has no runtime dependencies.

- Remove `hammerjs` from your dependencies if you installed it only for this plugin.
- Remove the Hammer.js `<script>` tag when loading the plugin from a CDN:

  ```html
  <script src="https://cdn.jsdelivr.net/npm/hammerjs@2.0.8"></script> <!-- no longer needed -->
  ```

- Workarounds for importing Hammer.js in bundlers or during server-side rendering can be removed.

### Pan callbacks receive a gesture event

`onPanStart` and `onPanRejected` used to receive a Hammer.js event as `event`. They now receive a plain object with the fields the plugin itself uses:

| Name | Type | Description
| ---- | ---- | -----------
| `center` | `{x, y}` | Midpoint of the active pointers, in client coordinates
| `deltaX`, `deltaY` | `number` | Pan offset in pixels since the gesture started
| `distance` | `number` | Straight-line distance travelled since the gesture started, in pixels
| `scale` | `number` | Pinch scale relative to the start of the gesture (`1` is unchanged)
| `pointers` | `{clientX, clientY}[]` | The active pointers
| `target` | `HTMLElement` | The canvas
| `srcEvent` | `PointerEvent` | The native event behind the gesture event
| `pointerType` | `string` | `mouse`, `touch` or `pen`

Other Hammer.js fields, such as `velocity`, `direction` or `isFinal`, are gone. `srcEvent` is now a `PointerEvent` rather than a `MouseEvent` or `TouchEvent`.

`onZoomStart` and `onZoomRejected` receive the native event, as before for wheel and drag zoom. For a pinch they used to receive the Hammer.js event and now receive the native `PointerEvent` too.

## Wheel zoom follows the scrolled distance

The wheel handler used to zoom by `speed` for every wheel event, whatever its size. It now zooms in proportion to the distance scrolled (the event's `deltaY`), reaching `speed` at 24 pixels and never exceeding it for one event. A notch of a mouse wheel is a longer distance than that and zooms by `speed` as before; a trackpad, which sends many small events, zooms more slowly and more smoothly. If you lowered `speed` to tame a trackpad, you may want to raise it again.

## Package layout

- The package is an ES module package (`"type": "module"`) with an `exports` map. Only the package root can be imported; deep imports such as `chartjs-plugin-zoom/dist/...` or `chartjs-plugin-zoom/types/...` no longer resolve. Script tags and CDN URLs pointing at `dist/chartjs-plugin-zoom.min.js` are unaffected.
- `require('chartjs-plugin-zoom')` returns the same exports as the ES module instead of the plugin itself, and no longer registers the plugin:

  ```javascript
  const { Chart } = require('chart.js');
  const { default: zoomPlugin } = require('chartjs-plugin-zoom');

  Chart.register(zoomPlugin);
  ```

- The published files are compiled to ES2022. Transpile them in your own build if you support older browsers.

## TypeScript

The plugin is now written in TypeScript and its declarations are generated from the sources.

- The type of `event` in `onPanStart` and `onPanRejected` is the gesture event described above rather than `HammerInput`, and `@types/hammerjs` is not installed with the plugin any more.
- The `point` in `onZoomStart` and `onPanStart` is `{x: number, y: number}`. It is no longer typed as the Chart.js `Point`, whose coordinates can be `null` since Chart.js 4.5.
- The option types, such as `ZoomPluginOptions`, are exported from the package root. Import them from `'chartjs-plugin-zoom'` instead of `'chartjs-plugin-zoom/types/options'`.
