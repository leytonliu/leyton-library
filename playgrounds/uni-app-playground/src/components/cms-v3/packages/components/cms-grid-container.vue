<template>
  <view :class="classes" :data-component="data.componentCode" :style="styles" @tap="handleTapBaseContainer">
    <cms-base-component v-for="(item, index) in data.childrenData" :key="item.componentId" :children-styles="gridChildrenStyles[index]" :data="item" :index="index" />
  </view>
</template>

<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  import { notNullValue } from '@/components/cms/packages/utils/notNotValue';

  /**
   * 网格容器，以网格的形式布局子节点，支持设置行间距以及列间距
   * @author  韦胜健
   * @date    2022/9/19 20:56
   */
  export default {
    name: 'CmsGridContainer',
    mixins: [CmsComponentMixin],
    computed: {
      gridChildrenStyles() {
        const page = this.cmsPageData;
        if (!this.data.childrenData) {
          return [];
        }
        return this.data.childrenData.map((item, index) => {
          const marginBottom = notNullValue(this.data.data.rowsGutter, page.gutter);
          const marginRight = notNullValue(this.data.data.colsGutter, page.gutter);
          const childrenLength = this.data.data.rowsNum * this.data.data.colsNum;
          return this.data.childrenData
            ? {
                marginBottom: `${index + 1 > childrenLength - this.data.data.colsNum ? 0 : marginBottom}px`,
                marginRight: `${!((index + 1) % this.data.data.colsNum) ? 0 : marginRight}px`,
                flex: `0 0 calc((100% - ${marginRight * (this.data.data.colsNum - 1)}px) / ${this.data.data.colsNum})`,
              }
            : undefined;
        });
      },
    },
  };
</script>

<style lang="scss"></style>
