<template>
  <view>
    <cms-text
      v-if="data.componentCode === 'text'"
      :data="data"
      :index="index"
      :key="`text-${data.componentId}`"
      :children-styles="childrenStyles"
    />
    <cms-image
      v-else-if="data.componentCode === 'image'"
      :data="data"
      :index="index"
      :key="`image-${data.componentId}`"
      :children-styles="childrenStyles"
    />
    <cms-button
      v-else-if="data.componentCode === 'button'"
      :data="data"
      :index="index"
      :key="`button-${data.componentId}`"
      :children-styles="childrenStyles"
    />
    <cms-carousel-container
      v-else-if="data.componentCode === 'carousel-container'"
      :data="data"
      :index="index"
      :key="`carousel-container-${data.componentId}`"
      :children-styles="childrenStyles"
    />
    <cms-rows-container
      v-else-if="data.componentCode === 'rows-container'"
      :data="data"
      :index="index"
      :key="`row-container-${data.componentId}`"
      :children-styles="childrenStyles"
    />
    <cms-column-container
      v-else-if="data.componentCode === 'column-container'"
      :data="data"
      :index="index"
      :key="`column-container-${data.componentId}`"
      :children-styles="childrenStyles"
    />
    <cms-fixed-size-container
      v-else-if="data.componentCode === 'fixed-size-container'"
      :data="data"
      :index="index"
      :key="`fixed-size-container-${data.componentId}`"
      :children-styles="childrenStyles"
    />
    <view v-else> {{ data.componentCode }} </view>
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
import cmsFixedSizeContainer from './components/cms-fixed-size-container.vue';

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

const { envConfig, cmsPageConfig } = useCmsComponent(props, {
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
</style>
