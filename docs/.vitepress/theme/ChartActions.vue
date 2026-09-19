<script setup lang="ts">
import type { ChartAction } from './types'

withDefaults(defineProps<{ actions?: ChartAction[] | null }>(), {
  actions: () => [],
})

const emit = defineEmits<{ action: [action: ChartAction] }>()
</script>

<template>
  <div class="chart-actions">
    <button
      v-for="(action, i) in actions ?? []"
      :key="i"
      class="chart-action"
      type="button"
      @click="emit('action', action)"
    >
      {{ action.name }}
    </button>
  </div>
</template>

<style scoped>
.chart-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  margin: 16px 0;
}

.chart-action {
  transition: background 0.25s, border-color 0.25s;
  /* The VuePress theme hard-coded a tint of the code background here; the
     token keeps the same weight in light mode and stays visible in dark. */
  background: var(--vp-c-default-soft);
  border: 1px solid transparent;
  border-radius: var(--chartjs-radius);
  color: var(--vp-c-brand-1);
  text-decoration: none !important;
  display: inline-block;
  font-size: 0.8rem;
  padding: 8px 16px;
  margin: 0 8px 8px 0;
  cursor: pointer;
  user-select: none;
}

.chart-action:hover {
  background: var(--chartjs-accent-soft);
  border-color: var(--chartjs-accent-border);
  color: var(--vp-c-brand-1);
}

.chart-action:active {
  background: var(--chartjs-accent-strong);
  border-color: var(--chartjs-accent-border-strong);
  color: var(--vp-c-brand-1);
}
</style>
