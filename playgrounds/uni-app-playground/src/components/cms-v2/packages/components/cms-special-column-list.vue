<template>
  <view :class="classes" :data-component="data.componentCode" :style="style">
    <cms-base-component v-for="(item, index) in productChildrenData" :key="item.componentId" :children-styles="productListChildrenStyles[index]" :data="item" :index="index" />
  </view>
</template>

<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  import { removeUnit } from '@/components/cms/packages/utils/removeUnit';
  import { deepcopy } from '@/components/cms/packages/utils/deepcopy';
  import { iterateComponentData } from '@/components/cms/packages/utils/iterateComponentData';

  /**
   * 商品列表组件，根据绑定的数据以及配置的模板自动生成商品列表
   * @author  韦胜健
   * @date    2022/9/19 21:00
   */
  export default {
    name: 'CmsSpecialColumnList',
    mixins: [CmsComponentMixin],
    data() {
      return {
        specialColumnList: [],
      };
    },
    async mounted() {
      const codes = this.data.data.list.map((item) => item.code).filter((i) => i);
      this.specialColumnList = await this.env.getSpecialColumnList({ codes });
    },
    computed: {
      /**
       * 伪造子节点数据
       * @author  韦胜健
       * @date    2022/9/19 20:59
       */
      productChildrenData() {
        if (!this.data.childrenData || !this.data.childrenData[0]) {
          console.error('special-column-list：当前未配置专栏列表组件模板');
          return [];
        }
        /*模板数据*/
        const templateData = this.data.childrenData?.[0];

        /*生成伪造的数据*/
        const list = (this.specialColumnList || []).map((item) =>
          deepcopy({
            ...templateData,
            action: { code: 'bind-specialColumn' },
            data: {
              ...templateData.data,
              specialColumn: {
                ...item,
              },
            },
          }),
        );

        //将商品数据给到每一个childrenData
        iterateComponentData((data) => {
          data.childrenData?.forEach((childData) => {
            if (!childData) {
              return;
            }
            childData.data.specialColumn = data.data.specialColumn;
          });
        }, list);

        /*处理伪造的数据*/
        this.bindingValue.fakeDataManager.resetFakeData(this.data);
        this.bindingValue.fakeDataManager.processFakeData(this.data, list);
        return list;
      },
      /**
       * 子节点样式
       * @author  韦胜健
       * @date    2022/9/19 20:59
       */
      productListChildrenStyles() {
        let width = '';
        if (!this.data.data.horizontal) {
          width = `calc((100% - ${removeUnit(this.data.data.gutter) * (this.data.data.column - 1)}px)/${this.data.data.column})`;
        }
        return this.productChildrenData.map((_, index) => {
          let marginRight;
          if (this.data.data.horizontal) {
            marginRight = !!index && index + 1 === this.data.data.column ? null : this.data.data.gutter;
          } else {
            marginRight = index != null && (index + 1) % this.data.data.column === 0 ? null : this.data.data.gutter;
          }
          return {
            width,
            marginBottom: !this.data.data.horizontal && this.data.data.gutter,
            marginRight,
          };
        });
      },
      style() {
        const horizontalStyle = this.data.data.horizontal ? 'display:flex;overflow-x:scroll' : '';
        return `${this.styles};${horizontalStyle}`;
      },
    },
  };
</script>

<style lang="scss">
  .cms-special-column-list {
    & > view {
      display: inline-block !important;
      vertical-align: top;
    }
  }
</style>
