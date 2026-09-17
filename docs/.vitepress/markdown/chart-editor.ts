import type { MarkdownRenderer } from 'vitepress'

const CHART_EDITOR = / chart-editor( |$)/

/**
 * Renders ```js chart-editor fences as the <ChartEditor> component instead of a
 * static code block. Ported from vuepress-theme-chartjs, which did the same
 * through VuePress' chainMarkdown; VitePress uses markdown-it as well, so the
 * fence override itself is unchanged.
 *
 * The code is passed as a JSON string literal inside a single quoted attribute.
 * JSON.stringify escapes backslashes, quotes and newlines, leaving only the
 * single quote to encode so it cannot terminate the attribute. Vue's template
 * compiler decodes the entity before evaluating the expression, so the
 * component receives the fence content verbatim -- backticks and ${} included.
 */
export function chartEditor(md: MarkdownRenderer): void {
  const fence = md.renderer.rules.fence!

  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args
    const token = tokens[idx]

    if (!CHART_EDITOR.test(token.info.trim())) {
      return fence(...args)
    }

    const code = JSON.stringify(token.content).replace(/'/g, '&#39;')
    return `<ChartEditor :code='${code}' />`
  }
}
