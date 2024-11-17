const istanbul = require('rollup-plugin-istanbul');
const json = require('@rollup/plugin-json');
const resolve = require('@rollup/plugin-node-resolve');
const builds = require('./rollup.config');
const yargs = require('yargs');
const env = process.env.NODE_ENV;

module.exports = function(karma) {
  const args = yargs
    .option('verbose', {default: false})
    .argv;

  // Use the same rollup config as our dist files: when debugging (--watch),
  // we will prefer the unminified build which is easier to browse and works
  // better with source mapping. In other cases, pick the minified build to
  // make sure that the minification process (terser) doesn't break anything.
  const regex = karma.autoWatch ? /\.js$/ : /\.min\.js$/;
  const build = builds.filter(v => v.output.file.match(regex))[0];

  if (env === 'test') {
    build.plugins = [
      json(),
      resolve(),
      istanbul({exclude: ['node_modules/**/*.js', 'package.json']})
    ];
  }

  karma.set({
    frameworks: ['jasmine'],
    reporters: ['spec', 'kjhtml'],
    browsers: (args.browsers || 'chrome,firefox').split(','),
    logLevel: karma.LOG_INFO,

    client: {
      jasmine: {
        stopOnSpecFailure: !!karma.autoWatch,
        timeoutInterval: 10000,
      }
    },

    // Explicitly disable hardware acceleration to make image
    // diff more stable when ran on Travis and dev machine.
    // https://github.com/chartjs/Chart.js/pull/5629
    // Since FF 110 https://github.com/chartjs/Chart.js/issues/11164
    customLaunchers: {
      chrome: {
        base: 'Chrome',
        flags: [
          '--disable-accelerated-2d-canvas'
        ]
      },
      firefox: {
        base: 'Firefox',
        prefs: {
          'layers.acceleration.disabled': true,
          'gfx.canvas.accelerated': false
        }
      }
    },

    files: [
      {pattern: 'test/fixtures/**/*.js', included: false},
      {pattern: 'test/fixtures/**/*.json', included: false},
      {pattern: 'test/fixtures/**/*.png', included: false},
      {pattern: 'node_modules/chart.js/dist/chart.umd.js'},
      {pattern: 'node_modules/hammer-simulator/index.js'},
      {pattern: 'node_modules/hammerjs/hammer.js'},
      {pattern: 'node_modules/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.js'},
      {pattern: 'test/index.js'},
      {pattern: 'src/index.js'},
      {pattern: 'test/specs/**/*.js'}
    ],

    preprocessors: {
      'test/index.js': ['rollup'],
      'src/index.js': ['sources']
    },

    rollupPreprocessor: {
      plugins: [
        json(),
        resolve(),
      ],
      external: [
        'chart.js'
      ],
      output: {
        name: 'test',
        format: 'umd',
        globals: {
          'chart.js': 'Chart'
        }
      }
    },

    customPreprocessors: {
      fixtures: {
        base: 'rollup',
        options: {
          output: {
            format: 'iife',
            name: 'fixture'
          }
        }
      },
      sources: {
        base: 'rollup',
        options: build
      }
    },

    // These settings deal with browser disconnects. We had seen test flakiness from Firefox
    // [Firefox 56.0.0 (Linux 0.0.0)]: Disconnected (1 times), because no message in 10000 ms.
    // https://github.com/jasmine/jasmine/issues/1327#issuecomment-332939551
    browserDisconnectTolerance: 3
  });


  if (env === 'test') {
    karma.reporters.push('coverage');
    karma.coverageReporter = {
      dir: 'coverage/',
      reporters: [
        {type: 'html', subdir: 'html'},
        {type: 'lcovonly', subdir: (browser) => browser.toLowerCase().split(/[ /-]/)[0]}
      ]
    };
  }
};
