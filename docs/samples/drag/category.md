# Category Scale

Zooming is performed by clicking and selecting an area over the chart with the mouse. Pan is activated by keeping `ctrl` pressed.

<div data-sample-holder></div>

<script setup>
import {onMounted} from 'vue';
import {setupSample} from '../../scripts/setup-sample.js';
import code from "./category.js?raw";

onMounted(() => setupSample(code));
</script>
