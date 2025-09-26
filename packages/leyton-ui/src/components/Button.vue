<template>
  <button :class="classes" :disabled="disabled || loading">
    <span v-if="loading" class="leyton-loading-indicator"></span>
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'LeytonButton',
  props: {
    type: {
      type: String,
      default: 'default', // primary, secondary, warning, danger, text
    },
    size: {
      type: String,
      default: 'medium', // small, medium, large
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const classes = computed(() => [
      'leyton-btn',
      `leyton-btn--${props.type}`,
      `leyton-btn--${props.size}`,
      {
        'is-disabled': props.disabled,
        'is-loading': props.loading,
      },
    ]);

    return {
      classes,
    };
  },
});
</script>

<style>
:root {
  --leyton-color-primary: #00b462;
  --leyton-color-primary-hover: #33c37e;
  --leyton-color-primary-active: #009a54;
  --leyton-color-warning: #ff9900;
  --leyton-color-danger: #ff4d4f;
  --leyton-border-radius: 4px;
  --leyton-font-size-small: 12px;
  --leyton-font-size-medium: 14px;
  --leyton-font-size-large: 16px;
}

.leyton-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--leyton-border-radius);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  font-family: "PingFang SC", "Helvetica Neue", sans-serif;
  white-space: nowrap;
  user-select: none;
  touch-action: manipulation;
}

/* Sizes */
.leyton-btn--small {
  height: 28px;
  padding: 0 12px;
  font-size: var(--leyton-font-size-small);
  min-width: 52px;
}

.leyton-btn--medium {
  height: 32px;
  padding: 0 16px;
  font-size: var(--leyton-font-size-medium);
  min-width: 60px;
}

.leyton-btn--large {
  height: 40px;
  padding: 0 24px;
  font-size: var(--leyton-font-size-large);
  min-width: 88px;
}

/* Types */
.leyton-btn--default {
  background-color: #fff;
  border-color: #d9d9d9;
  color: #333;
}
.leyton-btn--default:hover {
  border-color: var(--leyton-color-primary-hover);
  color: var(--leyton-color-primary-hover);
}
.leyton-btn--default:active {
  border-color: var(--leyton-color-primary-active);
  color: var(--leyton-color-primary-active);
}


.leyton-btn--primary {
  background-color: var(--leyton-color-primary);
  color: #fff;
}
.leyton-btn--primary:hover {
  background-color: var(--leyton-color-primary-hover);
}
.leyton-btn--primary:active {
  background-color: var(--leyton-color-primary-active);
}

.leyton-btn--secondary {
    background-color: #fff;
    border-color: #d9d9d9;
    color: #333;
}

.leyton-btn--warning {
  background-color: #fff;
  border-color: var(--leyton-color-warning);
  color: var(--leyton-color-warning);
}
.leyton-btn--warning:hover {
  background-color: var(--leyton-color-warning);
  color: #fff;
}


.leyton-btn--danger {
  background-color: #fff;
  border-color: var(--leyton-color-danger);
  color: var(--leyton-color-danger);
}
.leyton-btn--danger:hover {
  background-color: var(--leyton-color-danger);
  color: #fff;
}

.leyton-btn--text {
  border-color: transparent;
  background-color: transparent;
  color: var(--leyton-color-primary);
}
.leyton-btn--text:hover {
  color: var(--leyton-color-primary-hover);
}

/* States */
.leyton-btn.is-disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.leyton-loading-indicator {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #fff;
  border-top-color: transparent;
  animation: leyton-spin 0.6s linear infinite;
  margin-right: 6px;
}

.leyton-btn--default .leyton-loading-indicator,
.leyton-btn--secondary .leyton-loading-indicator,
.leyton-btn--warning .leyton-loading-indicator,
.leyton-btn--danger .leyton-loading-indicator {
    border-color: #ccc;
    border-top-color: transparent;
}


@keyframes leyton-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>