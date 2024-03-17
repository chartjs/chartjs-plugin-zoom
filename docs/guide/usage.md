# Usage

Using the zoom and pan plugin is very simple. Once the plugin is [registered](./integration) zoom options provided to the chart will be used. In this example, scroll zoom is enabled.

<div data-sample-holder></div>

<script setup>
import {onMounted} from 'vue';
import {setupSample} from '../scripts/setup-sample.js';
import code from "./usage-example.js?raw";

onMounted(() => setupSample(code));
</script>
