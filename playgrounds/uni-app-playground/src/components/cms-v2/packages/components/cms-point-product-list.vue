<template>
  <scroll-view v-if="data.data.horizontal" :class="classes" :data-component="data.componentCode" :style="style" :enable-flex="true" :scroll-x="true">
    <template v-if="productChildrenData.length">
      <cms-base-component v-for="(item, index) in productChildrenData" :key="item.componentId" :children-styles="productListChildrenStyles[index]" :data="item" :index="index" />
    </template>
  </scroll-view>
  <view v-else :class="classes" :data-component="data.componentCode" :style="style">
    <view v-if="loading" class="loading">
      <o2-image :width="48" is-absolute :src="minioUrl + imagePath + '/easy-loadimage/loading.gif'" />
      <text class="tip text-body2 color-grey2">{{ intl('b2c.component.cmsTabs.loading').d(`加载中`) }}</text>
    </view>
    <template v-else-if="productChildrenData.length">
      <cms-base-component v-for="(item, index) in productChildrenData" :key="item.componentId" :children-styles="productListChildrenStyles[index]" :data="item" :index="index" />
    </template>
    <view v-else-if="!loading" class="empty-tips">暂无数据~</view>
  </view>
</template>

<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  import { removeUnit } from '@/components/cms/packages/utils/removeUnit';
  import { deepcopy } from '@/components/cms/packages/utils/deepcopy';
  import { iterateComponentData } from '@/components/cms/packages/utils/iterateComponentData';
  import env from '@/env/index';

  /**
   * 商品列表组件，根据绑定的数据以及配置的模板自动生成商品列表
   * @author  韦胜健
   * @date    2022/9/19 21:00
   */
  export default {
    name: 'CmsPointProductList',
    mixins: [CmsComponentMixin],
    data() {
      return {
        productList: [],
        loading: true,
        minioUrl: env.OSS_URL,
        imagePath: env.DEFAULT_IMAGE_PATH + env.theme, // oss资源路径
      };
    },
    async mounted() {
      this.loading = true;
      const itemCodeList = this.data.data.list.map((item) => item.itemCode).filter((i) => i);
      const { content } = await this.env.getPointProductList({ params: { itemCodeList, size: itemCodeList.length + 1 } });
      this.productList = content;
      this.loading = false;
    },
    computed: {
      /**
       * 伪造子节点数据
       * @author  韦胜健
       * @date    2022/9/19 20:59
       */
      productChildrenData() {
        if (!this.data.childrenData || !this.data.childrenData[0]) {
          console.error('product-list：当前未配置商品列表组件模板');
          return [];
        }
        /*模板数据*/
        const templateData = this.data.childrenData?.[0];

        let labelProducts = this.productList;

        /*生成伪造的数据*/
        const list = (labelProducts || []).map((item) =>
          deepcopy({
            ...templateData,
            action: { code: this.data.action.code || 'bind-point-product' },
            data: {
              ...templateData.data,
              product: item,
            },
          }),
        );

        //将商品数据给到每一个childrenData
        iterateComponentData((data) => {
          data.childrenData?.forEach((childData) => {
            if (!childData) {
              return;
            }
            childData.data.product = data.data.product;
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
        if (this.data.data.horizontal && this.productChildrenData && this.productChildrenData[0]) {
          // 横向滚动使用scroll-view，必须设置height属性，这里取第一个子节点的高度（模版的高度）
          const horizontalStyle = `height:${this.productChildrenData[0].style.height}`;
          return `${this.styles};${horizontalStyle}`;
        }
        return `${this.styles}`;
      },
    },
    beforeDestroy() {
      this.productList = [];
    },
  };
</script>

<style lang="scss">
  .cms-point-product-list {
    .empty-tips {
      font-size: 24rpx;
      text-align: center;
      color: var(--BLACK1);
      width: 100%;
    }
    .cms-image.cms-visual-editor-base-container {
      overflow: hidden;
    }

    & > view {
      display: inline-block !important;
      vertical-align: top;
    }

    .loading {
      width: 100%;
      display: flex !important;
      align-items: center;
      justify-content: center;
      margin-bottom: 100vh;
    }

    .load-more {
      width: 100%;
      display: flex !important;
      align-items: center;
      justify-content: center;
      padding-bottom: 48rpx;
    }
  }
</style>
