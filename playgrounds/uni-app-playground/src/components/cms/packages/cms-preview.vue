<template>
  <view :style="styles" class="cms-preview">
    <cms-base-component
      v-for="(item, index) in data.childrenData"
      :key="item.componentId"
      :index="index"
      :data="item"
      :children-styles="pageChildrenStyles[index]"
      is-first-floor-node
    />
  </view>
</template>

<script lang="ts" setup>
import { computed, provide, Ref, toRef } from 'vue';
import {
  CmsPageConfig,
  CmsEnvConfig,
  CmsBindingValueManager,
  CmsActionRenderManager,
} from '../cms';
import { convertStyleToString } from './utils/utils';
import cmsBaseComponent from './cms-base-component.vue';
import { defaultCmsEnvConfig, defaultCmsPageConfig } from './utils/constants';
import { createCmsBindingValue } from './binding/createCmsBindValue';
import { createCmsActionRender } from './action/createCmsActionRender';
import { customActionRender } from './action/customActionRender';

const props = withDefaults(
  defineProps<{
    data: CmsPageConfig;
    envConfig: CmsEnvConfig;
  }>(),
  {
    data: () => defaultCmsPageConfig,
    envConfig: () => defaultCmsEnvConfig,
  }
);

defineOptions({
  name: 'CmsPreview',
});

/**
 * 创建数据绑定管理器
 */
const bindingValue = createCmsBindingValue(props.data);
provide<CmsBindingValueManager>('bindingValue', bindingValue);

/**
 * 创建动作管理器
 */
const actionRender = createCmsActionRender(bindingValue);
customActionRender({ actionRender }); // 注册自定义动作
provide<CmsActionRenderManager>('actionRender', actionRender);

/**
 * 值绑定管理对象
 */
provide<CmsBindingValueManager>('bindingValue', bindingValue);

/**
 * 环境变量
 */
provide<Ref<CmsEnvConfig>>('envConfig', toRef(props, 'envConfig'));

/**
 * 页面配置
 */
provide<Ref<CmsPageConfig>>('cmsPageConfig', toRef(props, 'data'));

/**
 * 当前组件样式
 */
const styles = computed(() => {
  return convertStyleToString(props.data.style);
});

/**
 * 子组件样式
 */
const pageChildrenStyles = computed(() => {
  return props.data.childrenData.map((_, index) => {
    if (index !== props.data.childrenData.length - 1) {
      return { marginBottom: `${props.data.gutter}px` };
    } else {
      return {};
    }
  });
});
</script>

<style lang="scss">
[data-scrollbar-x='1'] {
  overflow-x: scroll;

  &::-webkit-scrollbar {
    width: 6px;
    height: 0;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 0;
    background-color: #d8d8d8;
  }

  &::-webkit-scrollbar-track {
    //border-radius: 1em;
    background-color: transparent;
  }

  &::-webkit-scrollbar-corner {
    background-color: transparent;
  }
}
</style>
