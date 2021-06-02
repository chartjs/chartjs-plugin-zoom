const path = require('path');
const base = process.env.MY_PLATFORM === "cloudflare" ? '/' : `/chartjs-plugin-zoom/`;

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
        tsconfig: '../../tsconfig.json',
        sidebar: {
          fullNames: true,
          parentCategory: 'API',
        },
      },
    ],
  ],
  chainWebpack: (config) => {
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
            'drag/linear',
            'drag/log',
            'drag/time',
            'drag/timeseries',
          ]
        },
        'api',
        'pan-region',
      ],
    }
  }
};
