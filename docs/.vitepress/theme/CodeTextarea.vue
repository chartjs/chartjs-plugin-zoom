<script setup lang="ts">
import { computed } from 'vue'
// The bundled prism.js entry is used rather than prism-core plus the language
// components: those components reach for a global `Prism`, which only exists
// under a bundler that shims it, and this file is also evaluated during SSR.
import Prism from 'prismjs'

const props = defineProps<{ value: string }>()
const emit = defineEmits<{ input: [value: string] }>()

// A trailing newline leaves no line box of its own in the highlighted layer,
// so the two layers would drift apart by one line while typing at the end.
const highlighted = computed(
  () =>
    Prism.highlight(props.value, Prism.languages.javascript, 'javascript') + '\n'
)

function onInput(event: Event) {
  emit('input', (event.target as HTMLTextAreaElement).value)
}

/**
 * Keeps Tab inside the editor instead of moving focus out of it. setRangeText
 * is used rather than rewriting the whole value so the browser's own undo stack
 * stays intact -- vue-prism-editor reached for document.execCommand here, which
 * is deprecated.
 */
function onTab(event: KeyboardEvent) {
  const textarea = event.target as HTMLTextAreaElement
  event.preventDefault()
  const start = textarea.selectionStart
  textarea.setRangeText('  ', start, textarea.selectionEnd, 'end')
  emit('input', textarea.value)
}
</script>

<template>
  <div class="code-textarea scrollable">
    <div class="code-textarea-content">
      <pre aria-hidden="true" class="code-layer"><code v-html="highlighted" /></pre>
      <textarea
        :value="value"
        autocapitalize="off"
        autocomplete="off"
        autocorrect="off"
        class="code-layer code-input"
        data-gramm="false"
        spellcheck="false"
        @input="onInput"
        @keydown.tab="onTab"
      />
    </div>
  </div>
</template>

<style scoped>
.code-textarea {
  color: var(--chartjs-code-text);
  font-family: var(--vp-font-family-mono);
  font-size: 0.85em;
  line-height: 1.5;
  height: inherit;
  overflow: auto;
}

.code-textarea-content {
  padding: 16px 24px;
  position: relative;
  min-height: 100%;
  min-width: max-content;
}

.code-layer {
  font: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  tab-size: 2;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  white-space: pre;
  overflow: visible;
  overflow-wrap: normal;
  word-break: normal;
}

.code-input {
  position: absolute;
  inset: 16px 24px;
  width: 100%;
  height: 100%;
  resize: none;
  color: transparent;
  caret-color: var(--chartjs-code-text);
  outline: none !important;
}

.code-input::selection {
  background: rgba(128, 160, 224, 0.35);
}
</style>
