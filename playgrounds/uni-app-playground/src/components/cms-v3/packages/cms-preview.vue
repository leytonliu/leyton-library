<template>
  <view :style="styles" class="cms-preview">
    <cms-base-component
      v-for="(item, index) in data.childrenData"
      :key="item.componentId"
      :children-styles="pageChildrenStyles[index]"
      :data="item"
      :index="index"
      :is-first-floor-node="true"
    />
  </view>
</template>

<script setup>
import { computed, provide, getCurrentInstance } from 'vue';
import { createCmsBindValue } from '@/components/cms-v3/packages/binding/createCmsBindValue';
import { createCmsActionRender } from '@/components/cms-v3/packages/action/createCmsActionRender';
import { customActionRender } from '@/components/cms-v3/packages/action/customActionRender';
import { convertStyleToString } from '@/components/cms-v3/packages/utils/utils';
import { createCmsStateProvider } from '@/components/cms-v3/packages/stateProvider/createCmsStateProvider';
import { customStateProvider } from '@/components/cms-v3/packages/stateProvider/customStateProvider';

/**
 * 预览组件，负责接受page数据渲染cms组件
 * Vue3 版本
 * @author  韦胜健
 * @date    2022/9/20 9:39
 */

const props = defineProps({
  data: { type: Object },
  env: { type: Object },
  freshKey: { type: String },
});

// 创建绑定值管理对象
const bindingValue = createCmsBindValue(props.data);
const actionRender = createCmsActionRender(bindingValue);
customActionRender({ actionRender });
const stateProvider = createCmsStateProvider();
customStateProvider(stateProvider);

// 提供依赖注入
provide('cmsPageData', props.data);
provide('bindingValue', bindingValue);
provide('actionRender', actionRender);
provide('stateProvider', stateProvider);
provide('env', props.env);
provide('statusBarHeight', uni.getSystemInfoSync().statusBarHeight);
provide('freshKey', () => props.freshKey);
provide('envData', () => props.env);

/**
 * 页面样式
 * @author  韦胜健
 * @date    2022/9/20 9:40
 */
const styles = computed(() => {
  return convertStyleToString(props.data.style);
});

/**
 * 页面第一层子节点的样式
 * @author  韦胜健
 * @date    2022/9/20 9:40
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
    background-color: transparent;
  }

  &::-webkit-scrollbar-corner {
    background-color: transparent;
  }
}

// // #ifdef H5
// /deep/ .horizontal-scroll {
//   overflow-x: scroll;
// }
// // #endif
</style>
