# Over Scale Mode

Pan and Zoom are allowed only when mouse is over the axis.

<div data-sample-holder></div>

<script setup>
import {onMounted} from 'vue';
import {setupSample} from '../../scripts/setup-sample.js';
import code from "./over-scale-mode.js?raw";

onMounted(() => setupSample(code));
</script>
