<template>
  <view
    v-if="displayText"
    :class="classes"
    :data-component="data.componentCode"
    :style="styles"
    @tap="handleTapBaseContainer"
  >
    <view :style="textStyles">
      {{ displayText }}
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { CmsBaseComponentProps } from '../../cms';
import { cmsBaseComponentDefaults } from '../utils/constants';
import useCmsComponent from '../hooks/useCmsComponent';
import { convertStyleToString } from '../utils/utils';

defineOptions({
  name: 'CmsText',
  options: {
    virtualHost: true,
    styleIsolation: 'shared',
  },
});

const props = withDefaults(defineProps<CmsBaseComponentProps>(), {
  ...cmsBaseComponentDefaults,
});

const { classes, styles, getBindingValue, handleTapBaseContainer } =
  useCmsComponent(props);

const displayText = computed(() => {
  return getBindingValue(props.data.data.text);
});

const textStyles = computed(() => {
  const mode = props.data.data.overflowMode;

  const styleMap = {
    single: {
      overflow: 'hidden',
      'text-overflow': 'ellipsis',
      display: '-webkit-box',
      '-webkit-box-orient': 'vertical',
      '-webkit-line-clamp': '1',
    },
    multiple: {
      overflow: 'hidden',
      'text-overflow': 'ellipsis',
      display: '-webkit-box',
      '-webkit-box-orient': 'vertical',
      '-webkit-line-clamp': '2',
      height: 'inherit',
    },
  } as const;

  const textStyle = styleMap[mode as 'single' | 'multiple'] || {};

  return convertStyleToString(textStyle);
});
</script>
