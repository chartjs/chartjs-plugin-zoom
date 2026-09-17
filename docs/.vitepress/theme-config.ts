import type { DefaultTheme } from 'vitepress'

export interface ChartjsThemeConfig extends DefaultTheme.Config {
  /** Where the "View on GitHub" link on each sample editor points. */
  source: {
    repo: string
    branch: string
    dir: string
  }
}
