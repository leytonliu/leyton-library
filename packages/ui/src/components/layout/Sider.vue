<template>
  <aside class="leyton-layout-sider" :style="style">
    <slot></slot>
  </aside>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue';

const props = defineProps({
  width: {
    type: [Number, String],
    default: 200,
  },
});

const style = computed(() => ({
  flex: `0 0 ${props.width}px`,
  maxWidth: `${props.width}px`,
  minWidth: `${props.width}px`,
  width: `${props.width}px`,
}));

// Define the component name so it can be identified by the parent Layout
</script>

<script lang="ts">
export default {
  name: 'LeytonSider',
};
</script>

<style scoped>
.leyton-layout-sider {
  background: #fff;
  transition: all 0.2s;
  box-shadow: 2px 0 8px 0 rgba(29,35,41,.05);
}
</style>
