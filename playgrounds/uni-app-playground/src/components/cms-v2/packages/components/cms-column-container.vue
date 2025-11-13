<template>
  <view :class="classes" :data-component="data.componentCode" :style="styles" @tap="handleTapBaseContainer">
    <cms-base-component v-for="(item, index) in data.childrenData.filter((i) => i)" :key="item.componentId" :children-styles="columnChildrenStyles[index]" :data="item" :index="index" />
  </view>
</template>

<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  import { notNullValue } from '@/components/cms/packages/utils/notNotValue';

  /**
   * 列组件
   * @author  韦胜健
   * @date    2022/9/19 20:55
   */
  export default {
    name: 'CmsColumnContainer',
    mixins: [CmsComponentMixin],
    computed: {
      /**
       * 子节点样式，横向间隔
       * @author  韦胜健
       * @date    2022/9/19 20:54
       */
      columnChildrenStyles() {
        const page = this.cmsPageData;
        if (!this.data.childrenData) {
          return [];
        }
        return this.data.childrenData.map((item, index) => {
          return index !== this.data.childrenData.length - 1 ? { marginRight: `${notNullValue(this.data.data.gutter, page.gutter)}px` } : undefined;
        });
      },
    },
  };
</script>

<style lang="scss">
  .cms-column-container {
    //width: 100%;
    //background-color: black;
    & > .cms-visual-editor-base-container {
      flex: 1;
    }
  }
</style>
