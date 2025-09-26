<template>
  <div class="button-showcase">
    <h1>Button Component Showcase</h1>

    <h2>Button Types</h2>
    <Button type="default">Default</Button>
    <Button type="primary">Primary</Button>
    <Button type="secondary">Secondary</Button>
    <Button type="warning">Warning</Button>
    <Button type="danger">Danger</Button>
    <Button type="text">Text</Button>

    <h2>Button Sizes</h2>
    <Button type="primary" size="small">Small</Button>
    <Button type="primary" size="medium">Medium</Button>
    <Button type="primary" size="large">Large</Button>

    <h2>Disabled State</h2>
    <Button type="primary" disabled>Disabled</Button>

    <h2>Loading State</h2>
    <Button type="primary" loading>Loading</Button>
    <Button type="default" loading>Loading</Button>

  </div>
</template>

<script setup lang="ts">
import { Button } from '@leyton/ui';
</script>

<style>
.button-showcase {
  padding: 20px;
}

h1, h2 {
  margin-bottom: 16px;
}

.leyton-btn {
  margin-right: 12px;
  margin-bottom: 12px;
}
</style>