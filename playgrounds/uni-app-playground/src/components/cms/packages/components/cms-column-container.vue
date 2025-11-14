<template>
  <view
    :class="classes"
    :data-component="data.componentCode"
    :style="[styles, layoutStyle]"
    @tap="handleTapBaseContainer"
  >
    <cms-base-component
      v-for="(item, index) in data.childrenData.filter((i) => i)"
      :key="item.componentId"
      :children-styles="childrenStyles"
      :data="item"
      :index="index"
    />
  </view>
</template>

<script lang="ts" setup>
import { CmsBaseComponentProps } from '../../cms';
import { cmsBaseComponentDefaults } from '../utils/constants';
import cmsBaseComponent from '../cms-base-component.vue';
import useCmsComponent from '../hooks/useCmsComponent';
import { computed } from 'vue';
import { getFirstDefinedValue } from '../utils/utils';

defineOptions({
  name: 'CmsColumnContainer',
});

const props = withDefaults(defineProps<CmsBaseComponentProps>(), {
  ...cmsBaseComponentDefaults,
});

const { classes, styles, handleTapBaseContainer, cmsPageConfig } =
  useCmsComponent(props);

const layoutStyle = computed(() => {
  // 1. 获取间距值 (逻辑不变)
  const gutterValue = getFirstDefinedValue(
    props.data.data.gutter,
    cmsPageConfig?.value.gutter
  );

  return {
    display: 'flex',
    flexWrap: 'nowrap', // 您的“不换行”设计
    flexDirection: 'row', // 使用 camelCase
    columnGap: `${gutterValue}px`, // 使用 camelCase
  } as const;
});
</script>

<style lang="scss">
.cms-column-container {
  & > .cms-visual-editor-base-container {
    flex: 1;
  }
}
</style>
