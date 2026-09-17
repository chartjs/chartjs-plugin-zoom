<script setup lang="ts">
import { Chart, type ChartConfiguration } from 'chart.js'
import { markRaw, onMounted, ref, shallowRef, useTemplateRef, watch } from 'vue'
import ChartActions from './ChartActions.vue'
import ChartView from './ChartView.vue'
import CodeEditor from './CodeEditor.vue'
import { imports } from './chart-imports'
import type { ChartAction } from './types'

const props = defineProps<{ code: string }>()

const actions = shallowRef<ChartAction[] | null>(null)
const config = shallowRef<ChartConfiguration | null>(null)
const error = ref<Error | null>(null)
const messages = ref<string[]>([])
const output = ref<boolean | string>(false)
const view = useTemplateRef('view')

/**
 * Runs the sample and picks up whatever it assigned to module.exports. The
 * sample sees Chart, the shared helpers and a console whose log() feeds the
 * Output tab; everything else it references has to come from the code itself.
 */
function evaluate(code: string) {
  error.value = null

  if (!code) {
    config.value = null
    return
  }

  const context = {
    ...imports,
    console: {
      ...console,
      log(...args: unknown[]) {
        messages.value = [...messages.value, args.join(' ')].slice(-50)
      },
    },
    Chart,
  }

  const lines = Object.keys(context).map(
    (key) => `const ${key} = arguments[0].${key}`
  )

  const script = `
    'use strict';
    const module = {exports: {}};
    ${lines.join(';\n')};
    (function(){ ${code} })();
    return module.exports;
  `

  try {
    // eslint-disable-next-line no-new-func
    const exports = new Function(script)(context)
    output.value = exports.output || false

    if (!actions.value) {
      actions.value = exports.actions || null
    }

    // markRaw keeps Vue from proxying the data and options Chart.js is about to
    // take ownership of. vuepress-theme-chartjs froze the object for the same
    // reason; freezing would now break Chart.js, which mutates what it is given.
    config.value = exports.config ? markRaw(exports.config) : null
  } catch (e) {
    error.value = e as Error
  }
}

watch(() => props.code, evaluate)
onMounted(() => evaluate(props.code))
</script>

<template>
  <div class="chart-editor">
    <ChartView ref="view" :config="config" />
    <ChartActions
      :actions="actions"
      @action="(action) => action.handler(view?.chart())"
    />
    <CodeEditor
      v-model:error="error"
      :messages="messages"
      :output="output"
      :value="code"
      @input="evaluate"
    />
  </div>
</template>
