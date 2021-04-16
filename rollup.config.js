const commonjs = require('rollup-plugin-commonjs');
const json = require('@rollup/plugin-json');
const nodeResolve = require('rollup-plugin-node-resolve');
const terser = require('rollup-plugin-terser').terser;

const pkg = require('./package.json');
const dependencies = Object.keys(pkg.dependencies);
const peerDependencies = Object.keys(pkg.peerDependencies);
const allDependencies = dependencies.concat(peerDependencies);

const banner = `/*!
* ${pkg.name} v${pkg.version}
* ${pkg.homepage}
 * (c) 2016-${(new Date(process.env.SOURCE_DATE_EPOCH ? (process.env.SOURCE_DATE_EPOCH * 1000) : new Date().getTime())).getFullYear()} chartjs-plugin-zoom Contributors
 * Released under the MIT License
 */`;

const name = 'ChartZoom';
const globals = {
  'chart.js': 'Chart',
  'chart.js/helpers': 'Chart.helpers',
  hammerjs: 'Hammer'
};
allDependencies.push('chart.js/helpers');

module.exports = [
  {
    input: 'src/index.js',
    output: {
      name,
      file: `dist/${pkg.name}.js`,
      banner,
      format: 'umd',
      indent: false,
      globals
    },
    plugins: [
      commonjs({
        include: 'node_modules/**',
      }),
      json(),
      nodeResolve(),
    ],
    external: allDependencies
  },
  {
    input: 'src/index.js',
    output: {
      name,
      file: `dist/${pkg.name}.min.js`,
      banner,
      format: 'umd',
      indent: false,
      globals
    },
    plugins: [
      commonjs({
        include: 'node_modules/**',
      }),
      json(),
      nodeResolve(),
      terser({output: {comments: 'some'}})
    ],
    external: allDependencies
  },
  {
    input: 'src/index.esm.js',
    plugins: [
      json(),
      nodeResolve()
    ],
    output: {
      name,
      file: `dist/${pkg.name}.esm.js`,
      banner,
      format: 'esm',
      indent: false
    },
    external: allDependencies
  },
];
