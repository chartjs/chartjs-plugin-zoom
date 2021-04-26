# Integration

**chartjs-plugin-zoom** can be integrated with plain JavaScript or with different module loaders. The examples below show how to load the plugin in different systems.

## Script Tag

```html
<script src="path/to/chartjs/dist/chart.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/hammerjs@2.0.8"></script>
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
