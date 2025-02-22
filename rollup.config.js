import commonjs from '@rollup/plugin-commonjs'
import cleanup from 'rollup-plugin-cleanup'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import swc from '@rollup/plugin-swc'
import terser from '@rollup/plugin-terser'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('./package.json'))
const dependencies = Object.keys(pkg.dependencies)
const peerDependencies = Object.keys(pkg.peerDependencies)
const allDependencies = dependencies.concat(peerDependencies)

const banner = `/*!
* ${pkg.name} v${pkg.version}
* ${pkg.homepage}${pkg.version}/
 * (c) 2016-${new Date(process.env.SOURCE_DATE_EPOCH ? process.env.SOURCE_DATE_EPOCH * 1000 : new Date().getTime()).getFullYear()} chartjs-plugin-zoom Contributors
 * Released under the MIT License
 */`

const name = 'ChartZoom'
const globals = {
  'chart.js': 'Chart',
  'chart.js/helpers': 'Chart.helpers',
  hammerjs: 'Hammer',
}
allDependencies.push('chart.js/helpers')

const plugins = (minify) => [
  commonjs({
    include: 'node_modules/**',
  }),
  json(),
  resolve({ extensions: ['.js', '.ts'] }),
  swc({
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: false,
      },
      target: 'es2022',
    },
    module: {
      type: 'es6',
    },
    sourceMaps: true,
  }),
  minify ? terser({ output: { comments: 'some' } }) : cleanup({ comments: ['some'], extensions: ['js', 'ts'] }),
]

export default [
  {
    input: 'src/index.umd.ts',
    output: {
      name,
      file: `dist/${pkg.name}.js`,
      banner,
      format: 'umd',
      indent: false,
      globals,
      sourcemap: true,
    },
    plugins: plugins(),
    external: allDependencies,
  },
  {
    input: 'src/index.umd.ts',
    output: {
      name,
      file: `dist/${pkg.name}.min.js`,
      banner,
      format: 'umd',
      indent: false,
      globals,
      sourcemap: true,
    },
    plugins: plugins(true),
    external: allDependencies,
  },
  {
    input: 'src/index.ts',
    plugins: plugins(),
    output: {
      name,
      file: `dist/${pkg.name}.esm.js`,
      banner,
      format: 'esm',
      indent: false,
      sourcemap: true,
    },
    external: allDependencies,
  },
  {
    input: 'docs/scripts/register.js',
    plugins: [
      commonjs({
        include: 'node_modules/**',
      }),
      json(),
      resolve(),
      terser({output: {comments: 'some'}})
    ],
    output: {
      name,
      file: `docs/public/register.bundle.esm.js`,
      banner,
      format: 'esm',
      indent: false
    },
  },
  {
    input: 'docs/scripts/utils.js',
    plugins: [
      commonjs({
        include: 'node_modules/**',
      }),
      json(),
      resolve(),
      terser({output: {comments: 'some'}})
    ],
    output: {
      name,
      file: `docs/public/utils.bundle.esm.js`,
      banner,
      format: 'esm',
      indent: false
    },
  },
];
