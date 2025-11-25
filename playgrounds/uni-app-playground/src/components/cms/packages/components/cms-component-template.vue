<template>
  <view :class="classes" :data-component="data.componentCode" :style="styles">
    CmsComponentTemplate
  </view>
</template>

<script lang="ts" setup>
import { CmsBaseComponentProps } from '../../cms';
import { cmsBaseComponentDefaults } from '../utils/constants';
import useCmsComponent from '../hooks/useCmsComponent';

defineOptions({
  name: 'CmsComponentTemplate',
  options: {
    virtualHost: true,
    styleIsolation: 'shared',
  },
});

const props = withDefaults(defineProps<CmsBaseComponentProps>(), {
  ...cmsBaseComponentDefaults,
});

const { classes, styles } = useCmsComponent(props);
</script>
