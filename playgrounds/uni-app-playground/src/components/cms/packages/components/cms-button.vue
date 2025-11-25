<template>
  <view :class="classes" :data-component="data.componentCode" :style="styles">
    <button :class="buttonClasses" :style="buttonStyles">
      {{ buttonText }}
    </button>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { CmsBaseComponentProps } from '../../cms';
import useCmsComponent from '../hooks/useCmsComponent';
import { cmsBaseComponentDefaults } from '../utils/constants';
import { convertStyleToString } from '../utils/utils';

defineOptions({
  name: 'CmsButton',
  options: {
    virtualHost: true,
    styleIsolation: 'shared',
  },
});

const props = withDefaults(defineProps<CmsBaseComponentProps>(), {
  ...cmsBaseComponentDefaults,
});

// 注入cms组件上下文
const { classes, styles, getBindingValue } = useCmsComponent(props);

const buttonText = computed(() => getBindingValue(props.data.data.text));

const buttonClasses = computed(() => {
  return [
    'cms-button',
    `cms-button-size-${props.data.data.size}`,
    `cms-button-mode-${props.data.data.mode}`,
  ];
});

const buttonStyles = computed(() =>
  convertStyleToString({ width: props.data.data.width })
);
</script>

<style lang="scss">
.cms-button {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background-color: transparent;
  border-radius: 0;

  /*---------------------------------------reset-------------------------------------------*/

  &::after {
    border: none;
  }

  &.empty.plain {
    border: none transparent;
  }

  &.cms-button-mode-light {
    border: solid 1px black;
    background-color: white;
    color: black;

    //&:hover,
    &:active {
      background-color: whitesmoke;
    }
  }

  &.cms-button-mode-dark {
    border: solid 1px black;
    background-color: black;
    color: white;

    //&:hover,
    &:active {
      background-color: dimgray;
    }
  }

  &.cms-button-size-large {
    font-size: 18px;
    height: 48px;
    padding: 0 16px;
  }

  &.cms-button-size-normal {
    font-size: 16px;
    height: 36px;
    padding: 0 12px;
  }

  &.cms-button-size-small {
    font-size: 14px;
    height: 24px;
    padding: 0 8px;
  }
}
</style>
