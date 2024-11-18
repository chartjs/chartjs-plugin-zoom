const path = require('path');
const docsVersion = "VERSION";
const base = process.env.NODE_ENV === "development" ? '/chartjs-plugin-zoom/master/' : `/chartjs-plugin-zoom/${docsVersion}/`;

module.exports = {
  title: 'chartjs-plugin-zoom',
  description: 'A zoom and pan plugin for Chart.js >= 3.0.0',
  theme: 'chartjs',
  base,
  dest: path.resolve(__dirname, '../../dist/docs'),
  head: [
    ['link', {rel: 'icon', href: '/favicon.ico'}],
  ],
  plugins: [
    ['flexsearch'],
    ['redirect', {
      redirectors: [
        // Default sample page when accessing /samples.
        {base: '/samples', alternative: ['basic']},
      ],
    }],
    [
      'vuepress-plugin-typedoc',
      {
        entryPoints: ['../../types/index.d.ts'],
        hideInPageTOC: true,
        tsconfig: 'tsconfig.json',
        sidebar: {
          fullNames: true,
          parentCategory: 'API',
        },
      },
    ],
    ['@simonbrunel/vuepress-plugin-versions', {
      filters: {
        suffix: (tag) => tag ? ` (${tag})` : '',
        title: (v, vars) => window.location.href.includes('master') ? 'Development (master)' : v + (vars.tag ? ` (${tag})` : ''),
      },
      menu: {
        text: '{{version|title}}',
        items: [
          {
            text: 'Documentation',
            items: [
              {
                text: 'Development (master)',
                link: '/chartjs-plugin-zoom/master/',
                target: '_self',
              },
              {
                type: 'versions',
                text: '{{version}}{{tag|suffix}}',
                link: '/chartjs-plugin-zoom/{{version}}/',
                exclude: /^[0]\.[0-4]\./,
                group: 'minor',
                target: '_self',
              }
            ]
          },
          {
            text: 'Release notes (5 latest)',
            items: [
              {
                type: 'versions',
                limit: 5,
                target: '_blank',
                group: 'patch',
                link: 'https://github.com/chartjs/chartjs-plugin-zoom/releases/tag/v{{version}}'
              }
            ]
          }
        ]
      },
    }],
  ],
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
    repo: 'chartjs/chartjs-plugin-zoom',
    logo: '/favicon.ico',
    lastUpdated: 'Last Updated',
    searchPlaceholder: 'Search...',
    editLinks: false,
    docsDir: 'docs',
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
    }
  }
};
