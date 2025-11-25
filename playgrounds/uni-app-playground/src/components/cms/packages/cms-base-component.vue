<template>
  <cms-text
    v-if="data.componentCode === 'text' && isVisible"
    :data="data"
    :index="index"
    :key="`text-${data.componentId}`"
    :children-styles="childrenStyles"
  />
  <cms-image
    v-else-if="data.componentCode === 'image' && isVisible"
    :data="data"
    :index="index"
    :key="`image-${data.componentId}`"
    :children-styles="childrenStyles"
  />
  <cms-button
    v-else-if="data.componentCode === 'button' && isVisible"
    :data="data"
    :index="index"
    :key="`button-${data.componentId}`"
    :children-styles="childrenStyles"
  />
  <cms-carousel-container
    v-else-if="data.componentCode === 'carousel-container' && isVisible"
    :data="data"
    :index="index"
    :key="`carousel-container-${data.componentId}`"
    :children-styles="childrenStyles"
  />
  <cms-rows-container
    v-else-if="data.componentCode === 'rows-container' && isVisible"
    :data="data"
    :index="index"
    :key="`row-container-${data.componentId}`"
    :children-styles="childrenStyles"
  />
  <cms-column-container
    v-else-if="data.componentCode === 'column-container' && isVisible"
    :data="data"
    :index="index"
    :key="`column-container-${data.componentId}`"
    :children-styles="childrenStyles"
  />
  <cms-fixed-size-container
    v-else-if="data.componentCode === 'fixed-size-container' && isVisible"
    :data="data"
    :index="index"
    :key="`fixed-size-container-${data.componentId}`"
    :children-styles="childrenStyles"
  />
  <cms-card-stack
    v-else-if="data.componentCode === 'card-stack' && isVisible"
    :data="data"
    :index="index"
    :key="`card-stack-${data.componentId}`"
    :children-styles="childrenStyles"
  />
  <cms-dialog-container
    v-else-if="data.componentCode === 'dialog-container' && isVisible"
    :data="data"
    :index="index"
    :key="`dialog-container-${data.componentId}`"
    :children-styles="childrenStyles"
  />
  <view v-else-if="isVisible" class="cms-unknown-component" v-bind="$attrs">
    未注册组件 {{ data.componentCode }}
  </view>
</template>

<script lang="ts" setup>
import { CmsBaseComponentProps } from '../cms';
import { cmsBaseComponentDefaults } from './utils/constants';
import useCmsComponent from './hooks/useCmsComponent';
import CmsText from './components/cms-text.vue';
import CmsImage from './components/cms-image.vue';
import CmsButton from './components/cms-button.vue';
import CmsRowsContainer from './components/cms-rows-container.vue';
import CmsColumnContainer from './components/cms-column-container.vue';
import CmsCarouselContainer from './components/cms-carousel-container.vue';
import CmsFixedSizeContainer from './components/cms-fixed-size-container.vue';
import CmsCardStack from './components/cms-card-stack.vue';
import cmsDialogContainer from './components/cms-dialog-container.vue';

defineOptions({
  name: 'CmsBaseComponent',
  options: {
    styleIsolation: 'shared', // 解除自定义组件的样式隔离
    virtualHost: true, // 启用虚拟的宿主节点，以避免实体宿主节点影响样式布局
  },
});

const props = withDefaults(defineProps<CmsBaseComponentProps>(), {
  ...cmsBaseComponentDefaults, // 应用公用默认值
});

const { isVisible } = useCmsComponent(props, {
  isBaseComponent: true, // 当前组件为 cms-base-component
});
</script>

<style lang="scss">
.cms-visual-editor-base-container {
  box-sizing: border-box;
  position: relative;
  display: block;
}

[data-component='image'] [data-component='fixed-size-container'] {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

[data-component='square-container'] {
  .square-container-inner > .cms-visual-editor-base-container {
    width: 100%;
    height: 100%;
  }
}
.cms-unknown-component {
  color: #999;
  font-size: 24rpx;
  padding: 10rpx;
  text-align: center;
  border: 1px dashed #ccc;
}
</style>
