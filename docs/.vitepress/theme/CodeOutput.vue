<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    placeholder?: boolean | string
    value?: string[]
  }>(),
  { placeholder: true, value: () => [] }
)

// Newest first, so the latest console.log is the one that stands out.
const items = computed(() => [...props.value].reverse())
</script>

<template>
  <div class="code-output scrollable">
    <div class="code-output-content">
      <span v-for="(item, index) in items" :key="index">{{ item }}</span>
      <span v-if="!items.length && placeholder" class="text-muted">
        {{ placeholder === true ? '...' : placeholder }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.code-output {
  color: var(--chartjs-code-text);
  font-family: var(--vp-font-family-mono);
  font-size: 0.85em;
  line-height: 1.5;
  height: inherit;
  overflow: auto;
}

.code-output-content {
  padding: 16px 24px;
}

.code-output-content > span {
  white-space: pre-wrap;
  position: relative;
  display: block;
  margin-left: 5px;
  opacity: 0.25;
}

.code-output-content > span:first-child::before {
  content: '>';
  font-weight: bold;
  position: absolute;
  opacity: 0.5;
  left: -15px;
}

/* Older entries fade out towards the bottom of the list. */
.code-output-content > span:nth-child(1) { opacity: 1; }
.code-output-content > span:nth-child(2) { opacity: 0.95; }
.code-output-content > span:nth-child(3) { opacity: 0.9; }
.code-output-content > span:nth-child(4) { opacity: 0.85; }
.code-output-content > span:nth-child(5) { opacity: 0.8; }
.code-output-content > span:nth-child(6) { opacity: 0.75; }
.code-output-content > span:nth-child(7) { opacity: 0.7; }
.code-output-content > span:nth-child(8) { opacity: 0.65; }
.code-output-content > span:nth-child(9) { opacity: 0.6; }
.code-output-content > span:nth-child(10) { opacity: 0.55; }
.code-output-content > span:nth-child(11) { opacity: 0.5; }
.code-output-content > span:nth-child(12) { opacity: 0.45; }
.code-output-content > span:nth-child(13) { opacity: 0.4; }
.code-output-content > span:nth-child(14) { opacity: 0.35; }
.code-output-content > span:nth-child(15) { opacity: 0.3; }
</style>
