
  chainWebpack: (config) => {
    config.module
      .rule('chart.js')
      .include.add(path.resolve('node_modules/chart.js')).end()
      .use('babel-loader')
      .loader('babel-loader')
      .options({
        presets: ['@babel/preset-env']
      })
      .end();
    config.merge({
      resolve: {
        alias: {
          // Hammerjs requires window, using ng-hammerjs instead
          'hammerjs': 'ng-hammerjs',
        }
      }
    });
  },
  themeConfig: {
    chart: {
      imports: [
        ['scripts/register.js'],
        ['scripts/defaults.js'],
        ['scripts/utils.js', 'Utils'],
      ]
    },
  }
};
