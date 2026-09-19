<script setup lang="ts">
import { Chart, type ChartConfiguration } from 'chart.js'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    // The config is handed over already markRaw()'d: Chart.js keeps its own
    // references to data and options, and a reactive proxy around them makes
    // every update fight with the renderer.
    config?: ChartConfiguration | null
  }>(),
  { config: null }
)

const canvas = ref<HTMLCanvasElement | null>(null)
let instance: Chart | null = null

function update() {
  const config = props.config
  if (!canvas.value || !config) {
    return
  }

  if (!instance) {
    instance = new Chart(canvas.value, { ...config })
  } else {
    instance.stop()
    instance.data = config.data || { datasets: [] }
    instance.options = config.options || {}
    instance.update()
  }
}

onMounted(update)
watch(() => props.config, update)

onBeforeUnmount(() => {
  instance?.destroy()
  instance = null
})

defineExpose({ chart: () => instance })
</script>

<template>
  <div class="chart-view">
    <canvas ref="canvas" />
  </div>
</template>

<style scoped>
.chart-view {
  margin: 16px 0;
}
</style>
