<template>
  <view @click="haneleClick">
    cmsBaseComponent
    <cms-button
      v-if="data.componentCode === 'button'"
      :data="data"
      :index="index"
      :key="data.componentId"
      :children-styles="childrenStyles"
    />
  </view>
</template>

<script lang="ts" setup>
import { CmsBaseComponentProps } from '../cms';
import { cmsBaseComponentDefaults } from './utils/constants';
import useCmsComponent from './hooks/useCmsComponent';
import CmsButton from './components/cms-button.vue';

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

const haneleClick = () => {
  console.log('props.data', props.data);
  console.log('envConfig', envConfig?.value);
  console.log('cmsPageConfig', cmsPageConfig?.value);
};
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
