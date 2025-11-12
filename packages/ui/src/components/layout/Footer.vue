<template>
  <footer class="leyton-layout-footer">
    <slot></slot>
  </footer>
</template>

<script setup lang="ts">
// No script logic needed
</script>

<style scoped>
.leyton-layout-footer {
  flex-shrink: 0;
  background: #f0f2f5;
  padding: 24px 50px;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  text-align: center;
}
</style>
