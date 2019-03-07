const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const terser = require('rollup-plugin-terser').terser;
const pkg = require('./package.json');
const dependencies = Object.keys(pkg.dependencies)
const peerDependencies = Object.keys(pkg.peerDependencies)
const allDependencies = dependencies.concat(peerDependencies)

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
				hammerjs: 'Hammer'
			}
		},
		plugins: [
			commonjs({
				include: 'node_modules/**',
			}),
			nodeResolve(),
		],
		external: allDependencies
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
				hammerjs: 'Hammer'
			}
		},
		plugins: [
			commonjs({
				include: 'node_modules/**',
			}),
			nodeResolve(),
			terser({output: {comments: 'some'}})
		],
		external: allDependencies
	}
];
