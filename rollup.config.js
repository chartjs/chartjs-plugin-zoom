const terser = require('rollup-plugin-terser').terser;
const pkg = require('./package.json');

const banner = `/*!
 * @license
 * ${pkg.name}
 * http://chartjs.org/
 * Version: ${pkg.version}
 *
 * Copyright ${new Date().getFullYear()} Chart.js Contributors
 * Released under the MIT license
 * https://github.com/chartjs/${pkg.name}/blob/master/LICENSE.md
 */`;

module.exports = [
	{
		input: 'src/plugin.js',
		output: {
			name: 'ChartZoom',
			file: `dist/${pkg.name}.js`,
			banner: banner,
			format: 'umd',
			indent: false,
			globals: {
        'chart.js': 'Chart',
        'hammerjs': 'Hammer'
			}
		},
		external: [
			'chart.js',
			'hammerjs'
		]
	},
	{
		input: 'src/plugin.js',
		output: {
			name: 'ChartZoom',
			file: `dist/${pkg.name}.min.js`,
			banner: banner,
			format: 'umd',
			indent: false,
			globals: {
        'chart.js': 'Chart',
        'hammerjs': 'Hammer'
			}
		},
		plugins: [
			terser({output: {comments: 'some'}})
		],
		external: [
			'chart.js',
			'hammerjs'
		]
	}
];