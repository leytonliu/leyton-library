<template>
  <section :class="classes">
    <slot></slot>
  </section>
</template>

<script setup lang="ts">
import { computed, useSlots, VNode } from 'vue';

const slots = useSlots();

const classes = computed(() => {
  let hasSider = false;
  const defaultSlots = slots.default ? slots.default() : [];
  
  defaultSlots.forEach((vnode: VNode) => {
    // The component name is on the vnode type for component nodes
    if (typeof vnode.type === 'object' && (vnode.type as any).name === 'LeytonSider') {
      hasSider = true;
    }
  });

  return [
    'leyton-layout',
    { 'leyton-layout-has-sider': hasSider },
  ];
});
</script>

<style scoped>
.leyton-layout {
  display: flex;
  flex-direction: column;
  flex: auto;
  background: #f0f2f5;
  min-height: 100vh;
}

.leyton-layout-has-sider {
  flex-direction: row;
}
</style>
