# Pan Region

In this example pan is only accepted at the middle region (50%) of the chart. This region is highlighted by a red border.

<div data-sample-holder></div>

<script setup>
import {onMounted} from 'vue';
import {setupSample} from '../scripts/setup-sample.js';
import code from "./pan-region.js?raw";

onMounted(() => setupSample(code));
</script>
