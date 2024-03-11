import { defineConfig } from 'vitepress';
import vue from '@vitejs/plugin-vue';
import process from 'node:process';

const docsVersion = "VERSION";
const base = process.env.NODE_ENV === "development" ? '/chartjs-plugin-zoom/master/' : `/chartjs-plugin-zoom/${docsVersion}/`;

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "chartjs-plugin-zoom",
  description: "A zoom and pan plugin for Chart.js >= 3.0.0",
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],
  base,
  outDir: '../../dist/docs',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/hero.svg',
    footer: {
      message: 'Released under the MIT License',
      copyright: 'Copyright © 2016-2024 chartjs-plugin-zoom contributors',
    },
    nav: [
      { 
        text: docsVersion,
        items: [
          { text: 'Development (master)', link: '/chartjs-plugin-zoom/master/' },
          { text: '2.x.x', link: '/chartjs-plugin-zoom/2.0.1/' },
          { text: '1.x.x', link: '/chartjs-plugin-zoom/1.3.0/' },
        ],
      },
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/integration' },
      { text: 'Reference', link: '/api/README' },
      { text: 'Samples', link: `/samples/` },
      {
        text: 'Ecosystem',
        ariaLabel: 'Community Menu',
        items: [
          { text: 'Awesome', link: 'https://github.com/chartjs/awesome' },
        ]
      },
      { text: 'GitHub', link: 'https://github.com/chartjs/chartjs-plugin-zoom' },
    ],

    sidebar: [
      {
        text: 'Guide',
        collapsed: false,
        link: '/guide/integration',
        items: [
          { text: 'Integration', link: '/guide/integration' },
          { text: 'Usage', link: '/guide/usage' },
          { text: 'Options', link: '/guide/options' },
          { text: 'Animations', link: '/guide/animations' },
          { text: 'Developers', link: '/guide/developers' },
        ],
      },
      {
        text: 'Samples',
        collapsed: false,
        link: '/samples/basic',
        items: [
          { text: 'Basic', link: '/samples/basic' },
          { 
            text: 'Wheel Zoom',
            collapsed: true,
            items: [
              { text: 'Category Scale', link: '/samples/wheel/category' },
              { text: 'Logarithmic Scale', link: '/samples/wheel/log' },
              { text: 'Time Scale', link: '/samples/wheel/time' },
              { text: 'Over Scale Mode', link: '/samples/wheel/over-scale-mode' },
              { text: 'Click to Zoom', link: '/samples/wheel/click-zoom' },
            ],
          },
          { 
            text: 'Drag to Zoom',
            collapsed: true,
            items: [
              { text: 'Category Scale', link: '/samples/drag/category' },
              { text: 'Linear Scale', link: '/samples/drag/linear' },
              { text: 'Logarithmic Scale', link: '/samples/drag/log' },
              { text: 'Time Scale', link: '/samples/drag/time' },
              { text: 'Timeseries Scale', link: '/samples/drag/timeseries' },
            ],
          },
          { text: 'API', link: '/samples/api' },
          { text: 'Fetch Data', link: '/samples/fetch-data' },
          { text: 'Pan Region', link: '/samples/pan-region' },
        ]
      },
      {
        text: 'API Reference',
        link: '/api/README',
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/chartjs/chartjs-plugin-zoom' },
    ]
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: tag => tag.startsWith('playground-')
      }
    }
  },
  vite: {
    optimizeDeps: {
      exclude: ['playground-elements']
    }
  }
})
