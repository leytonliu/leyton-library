<template>
  <view :style="styles" class="cms-preview">
    <cms-base-component v-for="(item, index) in data.childrenData" :key="item.componentId" :children-styles="pageChildrenStyles[index]" :data="item" :index="index" :is-first-floor-node="true" />
  </view>
</template>

<script>
  import { createCmsBindValue } from '@/components/cms/packages/binding/createCmsBindValue';
  import { createCmsActionRender } from '@/components/cms/packages/action/createCmsActionRender';
  import { customActionRender } from '@/components/cms/packages/action/customActionRender';
  import { convertStyleToString } from '@/utils/utils';
  import { createCmsStateProvider } from '@/components/cms/packages/stateProvider/createCmsStateProvider';
  import { customStateProvider } from '@/components/cms/packages/stateProvider/customStateProvider';

  /**
   * 预览组件，负责接受page数据渲染cms组件
   * @author  韦胜健
   * @date    2022/9/20 9:39
   */
  export default {
    name: 'CmsPreview',
    options: {
      styleIsolation: 'shared', // 解除自定义组件的样式隔离
      virtualHost: true, // 启用虚拟的宿主节点，以避免实体宿主节点影响样式布局
    },
    provide() {
      return {
        cmsPageData: this.data, // page页面数据
        bindingValue: this.bindingValue, // 绑定值
        actionRender: this.actionRender, // 动作配置
        stateProvider: this.stateProvider,
        env: this.env, // 环境配置
        statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
        freshKey: () => this.freshKey,
        envData: () => this.env,
      };
    },
    props: {
      data: { type: Object },
      env: { type: Object },
      freshKey: { type: String },
    },
    data() {
      const bindingValue = createCmsBindValue(this.data);
      const actionRender = createCmsActionRender(bindingValue);
      customActionRender({ actionRender });
      const stateProvider = createCmsStateProvider();
      customStateProvider(stateProvider);
      return {
        bindingValue,
        actionRender,
        stateProvider,
      };
    },
    computed: {
      /**
       * 页面样式
       * @author  韦胜健
       * @date    2022/9/20 9:40
       */
      styles() {
        return convertStyleToString(this.data.style);
      },
      /**
       * 页面第一层子节点的样式
       * @author  韦胜健
       * @date    2022/9/20 9:40
       */
      pageChildrenStyles() {
        return this.data.childrenData.map((_, index) => {
          if (index !== this.data.childrenData.length - 1) {
            return { marginBottom: `${this.data.gutter}px` };
          } else {
            return {};
          }
        });
      },
    },
  };
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

  // #ifdef H5
  /deep/ .horizontal-scroll {
    overflow-x: scroll;
  }

  // #endif
</style>
