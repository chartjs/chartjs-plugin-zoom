
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
    nav: [
      {text: 'Home', link: '/'},
      {text: 'Guide', link: '/guide/'},
      {text: 'API', link: '/api/'},
      {text: 'Samples', link: `/samples/`},
      {
        text: 'Ecosystem',
        ariaLabel: 'Community Menu',
        items: [
          { text: 'Awesome', link: 'https://github.com/chartjs/awesome' },
        ]
      }
    ],
    sidebar: {
      '/guide/': [
        '',
        'integration',
        'usage',
        'options',
        'animations',
        'developers',
      ],
      '/samples/': [
        'basic',
        {
          title: 'Wheel Zoom',
          children: [
            'wheel/category',
            'wheel/category-min-range',
            'wheel/log',
            'wheel/time',
            'wheel/over-scale-mode',
            'wheel/click-zoom',
          ]
        },
        {
          title: 'Drag to Zoom',
          children: [
            'drag/category',
            'drag/linear-ratio',
            'drag/linear',
            'drag/log',
            'drag/reject-outside',
            'drag/time',
            'drag/timeseries',
          ]
        },
        {
          title: 'Pan',
          children: [
            'pan/region',
            'pan/toggle',
          ]
        },
        'fetch-data',
        'api',
      ],
    } as any
  } as DefaultThemeConfig
});
