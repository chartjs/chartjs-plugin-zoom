# Chart.Zoom.js

A zoom and pan plugin for Chart.js >= 2.1.0

Panning can be done via the mouse or with a finger.
Zooming is done via the mouse wheel or via a pinch gesture. [Hammer JS](http://hammerjs.github.io/) is used for gesture recognition.

[Live Codepen Demo](http://codepen.io/pen/PGabEK)

## Configuration

To configure the zoom and pan plugin, you can simply add new config options to your chart config.

```javascript
{
	// Container for pan options
	pan: {
		// Boolean to enable panning
		enabled: true,

		// Panning directions. Remove the appropriate direction to disable 
		// Eg. 'y' would only allow panning in the y direction
		mode: 'xy'
	},
	
	// Container for zoom options
	zoom: {
		// Boolean to enable zooming
		enabled: true,

		// Zooming directions. Remove the appropriate direction to disable 
		// Eg. 'y' would only allow zooming in the y direction
		mode: 'xy',
	}
}
```

## To-do Items
The following features still need to be done:
* Pan limits. We should be able to set limits for all axes or for a single axis, identified by ID, that are the maximum and minimum values, in data values, that can be panned to.
* Zoom limits. Similar to pan limits but for zooming
* Panning of category scales (the ones that use strings as labels)
* Zooming of category scales (the ones that use strings as labels)

## Installation

To download a zip, go to the Chart.Zoom.js on Github

To install via npm / bower:

```bash
npm install Chart.Zoom.js --save
```

## Documentation

You can find documentation for Chart.js at [www.chartjs.org/docs](http://www.chartjs.org/docs).

Examples for this plugin are available in the [samples folder](samples).

## Contributing

Before submitting an issue or a pull request to the project, please take a moment to look over the [contributing guidelines](https://github.com/chartjs/Chart.Zoom.js/blob/master/CONTRIBUTING.md) first.

## License

Chart.Zoom.js is available under the [MIT license](http://opensource.org/licenses/MIT).
