<template>
  <div v-if="visible" class="leyton-dialog-overlay">
    <div class="leyton-dialog">
      <div class="leyton-dialog-header">
        <span class="leyton-dialog-title">{{ title }}</span>
        <button @click="handleClose" class="leyton-dialog-close-btn">×</button>
      </div>
      <div class="leyton-dialog-body">
        <slot></slot>
      </div>
      <div class="leyton-dialog-footer">
        <slot name="footer">
          <button @click="handleCancel" class="leyton-btn leyton-btn-default">取消</button>
          <button @click="handleConfirm" class="leyton-btn leyton-btn-primary">确认</button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '提示',
  },
});

const emit = defineEmits(['update:visible', 'confirm', 'cancel']);

const handleClose = () => {
  emit('update:visible', false);
};

const handleCancel = () => {
  emit('cancel');
  handleClose();
};

const handleConfirm = () => {
  emit('confirm');
  handleClose();
};
</script>

<style scoped>
:root {
  --leyton-color-primary: #00b462;
}

.leyton-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.leyton-dialog {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 520px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
}

.leyton-dialog-header {
  padding: 16px 24px;
  background-color: #f7f7f7;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.leyton-dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.leyton-dialog-close-btn {
  border: none;
  background: none;
  font-size: 22px;
  cursor: pointer;
  color: #999;
  line-height: 1;
}

.leyton-dialog-body {
  padding: 24px;
  color: #333;
  font-size: 14px;
}

.leyton-dialog-footer {
  padding: 16px 24px;
  text-align: right;
  background-color: #f7f7f7;
  border-top: 1px solid #e0e0e0;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

/* Scoped button styles to avoid conflicts and match design */
.leyton-dialog-footer .leyton-btn {
  padding: 6px 16px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #d9d9d9;
  margin-left: 12px;
  background-color: #fff;
  color: #333;
}

.leyton-dialog-footer .leyton-btn-primary {
  background-color: var(--leyton-color-primary);
  color: white;
  border-color: var(--leyton-color-primary);
}
</style>
