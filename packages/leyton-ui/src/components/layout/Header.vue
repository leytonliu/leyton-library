<template>
  <header class="leyton-layout-header">
    <slot></slot>
  </header>
</template>

<script setup lang="ts">
// No script logic needed for this simple component
</script>

<style scoped>
.leyton-layout-header {
  flex-shrink: 0;
  background: #fff;
  padding: 0 50px;
  height: 64px;
  line-height: 64px;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
}
</style>
