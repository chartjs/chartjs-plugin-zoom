import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ChartEditor from './ChartEditor.vue'

import './styles/palette.css'
import './styles/editor.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Registered globally because the markdown-it rule in
    // ../markdown/chart-editor.ts emits <ChartEditor> into arbitrary pages.
    app.component('ChartEditor', ChartEditor)
  },
} satisfies Theme
