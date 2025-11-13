<template>
  <view :class="classes" :data-component="data.componentCode" :style="styles" @tap="handleTapBaseContainer">
    <cms-base-component v-for="(item, index) in data.childrenData.filter((i) => i)" :key="item.componentId" :children-styles="rowChildrenStyles[index]" :data="item" :index="index" />
  </view>
</template>

<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  import { notNullValue } from '@/components/cms/packages/utils/notNotValue';

  /**
   * 多行容器
   * @author  韦胜健
   * @date    2022/9/19 21:04
   */
  export default {
    name: 'CmsRowsContainer',
    mixins: [CmsComponentMixin],
    computed: {
      rowChildrenStyles() {
        const page = this.cmsPageData;
        if (!this.data.childrenData) {
          return [];
        }
        return this.data.childrenData.map((item, index) => {
          return index !== this.data.childrenData.length - 1 ? { marginBottom: `${notNullValue(this.data.data.gutter, page.gutter)}px` } : undefined;
        });
      },
    },
  };
</script>

<style lang="scss">
  .cms-rows-container {
    width: 100%;
  }
</style>
