<template>
  <div class="demo-card">
    <div class="demo-card__example">
      <slot name="demo"></slot>
    </div>
    <div class="demo-card__meta">
      <div class="demo-card__title">{{ title }}</div>
      <div class="demo-card__description" v-html="description"></div>
      <div class="demo-card__actions">
        <button @click="copyCode" title="Copy Code">
          <CopyIcon />
        </button>
        <button @click="toggleCode" title="Show Code">
          <CodeIcon />
        </button>
      </div>
    </div>
    <div v-if="codeVisible" class="demo-card__code">
      <slot name="code"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, useSlots } from 'vue';
import CodeIcon from './icons/CodeIcon.vue';
import CopyIcon from './icons/CopyIcon.vue';

defineProps({
  title: String,
  description: String,
});

const slots = useSlots();
const codeVisible = ref(false);

const toggleCode = () => {
  codeVisible.value = !codeVisible.value;
};

const copyCode = () => {
  const codeSlot = slots.code ? slots.code() : [];
  const codeNode = codeSlot[0];
  if (codeNode && codeNode.props && codeNode.props.code) {
    navigator.clipboard.writeText(codeNode.props.code).then(() => {
      alert('代码已复制!');
    }).catch(err => {
      console.error('Failed to copy code: ', err);
    });
  }
};

</script>

<style scoped>
.demo-card {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  margin-bottom: 24px;
  transition: all 0.3s;
}

.demo-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.09);
}

.demo-card__example {
  padding: 42px 24px;
}

.demo-card__meta {
  padding: 18px 24px;
  border-top: 1px solid #f0f0f0;
  position: relative;
}

.demo-card__title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
}

.demo-card__description {
  font-size: 14px;
  color: #555;
}

.demo-card__actions {
  position: absolute;
  top: 18px;
  right: 24px;
  display: flex;
  gap: 10px;
}

.demo-card__actions button {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.demo-card__actions button:hover {
  color: var(--leyton-color-primary, #00b462);
}

.demo-card__actions svg {
  width: 18px;
  height: 18px;
}

.demo-card__code {
  border-top: 1px solid #f0f0f0;
  padding: 18px 24px;
  background-color: #f7f7f7;
  overflow-x: auto;
}
</style>