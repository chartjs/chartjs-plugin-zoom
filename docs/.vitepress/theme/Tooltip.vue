<template>
  <div class="chart-tooltip">
    <div class="activator">
      <slot />
    </div>
    <div class="content scrollable">
      <slot name="content" />
    </div>
  </div>
</template>

<style scoped>
.chart-tooltip {
  position: relative;
}

.content {
  background: #eee;
  color: #444;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.15);
  border-radius: var(--chartjs-radius);
  display: none;
  font-size: 0.8rem;
  position: absolute;
  min-width: 256px;
  max-width: 512px;
  max-height: 256px;
  overflow: auto;
  z-index: 999;
  right: 0;
}

.chart-tooltip:hover .content {
  display: block;
}

.content :deep(pre) {
  background: none;
  overflow: visible;
  padding: 0 16px;
}
</style>
