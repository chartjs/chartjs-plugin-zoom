# Integration

**chartjs-plugin-zoom** can be integrated with plain JavaScript or with different module loaders. The examples below show how to load the plugin in different systems.

## Script Tag

```html
<script src="path/to/chartjs/dist/chart.min.js"></script>
<script src="path/to/chartjs-plugin-zoom/dist/chartjs-plugin-zoom.min.js"></script>
<script>
    var myChart = new Chart(ctx, {...});
</script>
```

## Bundlers (Webpack, Rollup, etc.)

```javascript
import { Chart } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

Chart.register(zoomPlugin);
```

## CommonJS

The CommonJS build has the same exports as the ES module, so the plugin is the `default` property. It is not registered automatically.

```javascript
const { Chart } = require('chart.js');
const { default: zoomPlugin } = require('chartjs-plugin-zoom');

Chart.register(zoomPlugin);
```
