<template>
  <view
    :class="classes"
    :data-component="data.componentCode"
    :style="styles"
    @tap="handleTapBaseContainer"
  >
    <view class="cms-visual-editor-fixed-size-container">
      <cms-base-component
        v-for="(item, index) in data.childrenData"
        :key="item.componentId"
        :data="item"
        :index="index"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { CmsBaseComponentProps } from '../../cms';
import { cmsBaseComponentDefaults } from '../utils/constants';
import useCmsComponent from '../hooks/useCmsComponent';
import cmsBaseComponent from '../cms-base-component.vue';

defineOptions({
  name: 'CmsComponentTemplate',
});

const props = withDefaults(defineProps<CmsBaseComponentProps>(), {
  ...cmsBaseComponentDefaults,
});

const { classes, styles, handleTapBaseContainer } = useCmsComponent(props);
</script>

<style lang="scss">
.cms-visual-editor-fixed-size-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  & > .cms-visual-editor-base-container {
    height: 100%;
    width: 100%;

    &.cms-rows-container {
      display: flex !important;
      flex-direction: column;

      ::v-deep & > .cms-visual-editor-base-container {
        flex: 1;
        overflow: hidden;
      }
    }
  }
}
</style>
