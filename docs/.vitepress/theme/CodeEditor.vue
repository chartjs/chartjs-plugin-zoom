<script setup lang="ts">
import { Parser } from 'acorn'
import { onBeforeUnmount, ref, watch } from 'vue'
import { useData } from 'vitepress'
import type { ChartjsThemeConfig } from '../theme-config'
import CodeOutput from './CodeOutput.vue'
import CodeTextarea from './CodeTextarea.vue'
import Tooltip from './Tooltip.vue'

const BLOCK_REGEX = /^\s*<(\/?)block:([\w\s]+)(?::(\d+))?>\s*$/

interface Block {
  code: string
  name?: string
  order: number
}

interface Section {
  name: string
  block?: Block
}

const props = withDefaults(
  defineProps<{
    delay?: number
    error?: Error | null
    messages?: string[]
    output?: boolean | string
    value: string
  }>(),
  { delay: 500, error: null, messages: () => [], output: false }
)

const emit = defineEmits<{
  input: [code: string]
  'update:error': [error: Error]
}>()

const { page, theme } = useData<ChartjsThemeConfig>()

const current = ref(0)
const modified = ref(false)
const sections = ref<Section[]>([])
let blocks: Block[] = []
let timeout: ReturnType<typeof setTimeout> | null = null

const sourceLink = () => {
  const { repo, branch, dir } = theme.value.source
  return `https://github.com/${repo}/blob/${branch}/${dir}/${page.value.relativePath}`
}

/**
 * Splits the sample into the named blocks marked up as `// <block:name:order>`
 * comments, which become the editor's tabs. Acorn is used rather than a line
 * scan so that a marker inside a string literal is not mistaken for one.
 */
function parse(value: string): Block[] {
  const found: { name?: string; order: number; start: number; end: number }[] = []
  let current = { order: 0, start: 0, end: 0 } as (typeof found)[number]

  Parser.parse(value, {
    ecmaVersion: 2022,
    onComment(_block, text, start, end) {
      const match = text.match(BLOCK_REGEX)
      if (!match) {
        return
      }

      const open = !match[1]
      const name = match[2]
      if (!open && current.name !== name) {
        return
      }

      found.push({ ...current, end: start })
      current = {
        name: open ? name : undefined,
        order: Number(match[3]) || 0,
        start: end,
        end,
      }
    },
  })

  found.push({ ...current, end: value.length })

  return found
    .filter(({ start, end }) => start < end)
    .map(({ name, start, end, order }) => ({
      code: value.slice(start, end).trim(),
      order,
      name,
    }))
}

function rebuild() {
  try {
    const parsed = parse(props.value)
    const named = parsed.filter(({ name }) => !!name)
    if (!named.length) {
      named.push({ code: props.value, name: 'JS', order: 0 })
    }

    const built: Section[] = named
      .sort((v0, v1) => v0.order - v1.order)
      .map((block) => ({ name: block.name!, block }))

    if (props.output) {
      built.push({ name: 'Output' })
    }

    blocks = parsed
    sections.value = built
    // Samples that log start on their output tab, where the interesting part is.
    current.value = props.output ? built.length - 1 : 0
  } catch (error) {
    emit('update:error', error as Error)
    blocks = []
  }
}

/**
 * Reassembles the sample from its blocks. The blocks were trimmed when they
 * were parsed, so they have to be rejoined with a newline: vuepress-theme-chartjs
 * joined them with an empty string, which glued `}` to the next `const` and made
 * every edit fail with a SyntaxError on all but the single-block samples.
 */
function update() {
  emit(
    'input',
    blocks.map((d) => d.code).join('\n')
  )
}

/** Debounces re-evaluation so the chart is not rebuilt on every keystroke. */
function invalidate() {
  if (timeout) {
    clearTimeout(timeout)
    timeout = null
  }

  if (!props.delay) {
    update()
    return
  }

  modified.value = true
  timeout = setTimeout(() => {
    modified.value = false
    timeout = null
    update()
  }, props.delay)
}

function onBlockInput(block: Block, code: string) {
  block.code = code
  invalidate()
}

watch(() => props.output, rebuild)
watch(() => props.value, rebuild, { immediate: true })

onBeforeUnmount(() => {
  if (timeout) {
    clearTimeout(timeout)
  }
})
</script>

<template>
  <div class="code-editor">
    <div class="code-editor-header">
      <div class="code-editor-tabs">
        <button
          v-for="(section, index) in sections"
          :key="index"
          :class="{ active: current === index }"
          class="code-editor-tab"
          type="button"
          @click="current = index"
        >
          {{ section.name }}
        </button>
      </div>

      <div class="code-editor-tools">
        <span
          v-if="modified"
          aria-label="Evaluating"
          class="code-editor-tool text-muted spin"
          role="status"
        >
          <svg height="16" viewBox="0 0 16 16" width="16">
            <path
              d="M8 1.5 9.6 6l4.4-1.6L10.7 8l3.3 3.6L9.6 10 8 14.5 6.4 10 2 11.6 5.3 8 2 4.4 6.4 6Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <Tooltip v-else-if="error">
          <span class="code-editor-tool text-error">
            <svg height="18" viewBox="0 0 16 16" width="18">
              <path
                d="M8 1.6 15.4 14H.6Zm0 3.9a.8.8 0 0 0-.8.85l.25 3.4a.55.55 0 0 0 1.1 0l.25-3.4A.8.8 0 0 0 8 5.5Zm0 5.2a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <template #content>
            <pre style="white-space: pre-wrap">{{ error }}</pre>
          </template>
        </Tooltip>
        <a
          :href="sourceLink()"
          class="code-editor-tool"
          rel="noopener noreferrer"
          target="_blank"
          title="View on GitHub"
        >
          <svg height="20" viewBox="0 0 16 16" width="20">
            <path
              d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38l-.01-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.19c0 .21.15.46.55.38A8 8 0 0 0 8 0Z"
              fill="currentColor"
            />
          </svg>
        </a>
      </div>
    </div>

    <div class="code-editor-views">
      <template v-for="(section, index) in sections" :key="index">
        <CodeTextarea
          v-if="section.block"
          v-show="current === index"
          :value="section.block.code"
          @input="onBlockInput(section.block, $event)"
        />
        <CodeOutput
          v-else
          v-show="current === index"
          :placeholder="output"
          :value="messages"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.code-editor {
  background-color: var(--chartjs-code-bg);
  border-radius: var(--chartjs-radius);
}

@media (max-width: 419px) {
  .code-editor {
    border-radius: 0 !important;
    margin: 0 -1.5rem;
  }
}

.code-editor-header {
  background: rgba(255, 255, 255, 0.02);
  padding: 0 16px;
  display: flex;
}

.code-editor-tabs {
  align-items: center;
  display: flex;
  flex: 1;
}

.code-editor-tab {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--chartjs-code-text);
  text-transform: capitalize;
  user-select: none;
  font-weight: bold;
  cursor: pointer;
  padding: 20px 4px 18px;
  margin: 0 8px;
}

.code-editor-tab:focus {
  outline: none;
}

.code-editor-tab.active {
  border-bottom-color: var(--vp-c-brand-1);
}

.code-editor-tools {
  align-items: center;
  display: flex;
  padding: 16px 0;
}

.code-editor-tool {
  color: var(--chartjs-code-text);
  text-decoration: none !important;
  display: inline-flex;
  align-items: center;
  margin: 0 8px;
}

.spin {
  animation: code-editor-spin 2s linear infinite;
}

@keyframes code-editor-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spin {
    animation: none;
  }
}

.code-editor-views {
  height: 360px;
}
</style>
