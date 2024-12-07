# API

<div data-sample-holder></div>

<script setup>
import {onMounted} from 'vue';
import {setupSample} from '../scripts/setup-sample.js';
import code from "./api.js?raw";

onMounted(() => setupSample(code, {height: '500px'}));
</script>
