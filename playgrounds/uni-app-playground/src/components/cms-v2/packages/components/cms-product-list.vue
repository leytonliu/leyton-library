<template>
  <scroll-view v-if="data.data.horizontal" :class="classes" :data-component="data.componentCode" :style="style" :enable-flex="true" :scroll-x="true">
    <template v-if="productChildrenData.length">
      <cms-base-component v-for="(item, index) in productChildrenData" :key="item.componentId" :children-styles="productListChildrenStyles[index]" :data="item" :index="index" :provides="provideMarkerSetting(index)" />
    </template>
  </scroll-view>
  <view v-else :class="classes" :data-component="data.componentCode" :style="style">
    <div v-if="data.data.enableFilter" class="p-list-header">
      <scroll-view :enable-flex="true" :scroll-x="true" class="label-box">
        <view :class="['label-item', isLabelActive(index) && 'active']" v-for="(label, index) in labelList" :key="index" @click="handleLabelClick(index)">{{ label }}</view>
      </scroll-view>
      <view class="total-box" v-if="!loading">
        <view v-if="currentRegion === '全部地区' && activeLabel.includes(0) && activeLabel.length === 1">共{{ totalCnt }}篇内容</view>
        <view v-else>共{{ productChildrenData.length }}篇内容</view>
        <view @click="toAddressList" v-if="countryList.length">
          <text>{{ currentRegion }}</text>
          <o2-icon icon="icon-jiantouyou" size="30rpx" />
        </view>
      </view>
    </div>
    <view v-if="loading" class="loading">
      <o2-image :width="48" is-absolute :src="minioUrl + imagePath + '/easy-loadimage/loading.gif'" />
      <text class="tip text-body2 color-grey2">{{ intl('b2c.component.cmsTabs.loading').d(`加载中`) }}</text>
    </view>
    <template v-else-if="productChildrenData.length">
      <cms-base-component v-for="(item, index) in productChildrenData" :key="item.componentId" :children-styles="productListChildrenStyles[index]" :data="item" :index="index" :provides="provideMarkerSetting(index)" />
    </template>
    <view v-else-if="data.data.enableFilter && !loading" class="empty-tips">暂无数据~</view>
    <view class="load-more" v-if="loadMore">
      <o2-image :width="48" is-absolute :src="minioUrl + imagePath + '/easy-loadimage/loading.gif'" />
      <text class="tip text-body2 color-grey2">{{ intl('b2c.component.cmsTabs.loading').d(`加载中`) }}</text>
    </view>
  </view>
</template>

<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  import { removeUnit } from '@/components/cms/packages/utils/removeUnit';
  import { deepcopy } from '@/components/cms/packages/utils/deepcopy';
  import { iterateComponentData } from '@/components/cms/packages/utils/iterateComponentData';
  import { mapState } from 'vuex';
  import env from '@/env/index';

  /**
   * 商品列表组件，根据绑定的数据以及配置的模板自动生成商品列表
   * @author  韦胜健
   * @date    2022/9/19 21:00
   */
  export default {
    name: 'CmsProductList',
    mixins: [CmsComponentMixin],
    data() {
      return {
        activeLabel: [0],
        productList: [],
        totalCnt: 0,
        loadMore: false,
        currentRegion: '全部地区',
        loading: true,
        minioUrl: env.OSS_URL,
        imagePath: env.DEFAULT_IMAGE_PATH + env.theme, // oss资源路径
      };
    },
    async mounted() {
      this.loading = true;
      const codes = this.data.data.list.map((item) => item.platformProductCode).filter((i) => i);
      const productList = await this.env.getProductList({ params: { codes, labelTypeList: this.data.data.labelTypes } });
      const productSort = this.data.data?.productSort?.filter((i) => i) || [];

      productList.forEach((i) => {
        productSort.forEach((j, index) => {
          if (i.platformProductCode === j) {
            i.sort = index + 1;
          }
        });
      });
      const list = productList
        .filter((i) => i.sort)
        .sort((a, b) => a.sort - b.sort)
        .concat(productList.filter((i) => !i.sort));
      this.totalCnt = list.length;
      this.loading = false;

      const vm = this;

      if (this.$Route.name === 'cmsCourseCLP') {
        if (list.length > 50) {
          vm.loadMore = true;
          this.productList = list.slice(0, 50);
          uni.$on('cmsProductScrollToLower', () => {
            if (vm.productList.length < list.length) {
              vm.productList = list;
              this.$nextTick(() => {
                vm.loadMore = false;
              });
            } else {
              uni.$off('cmsProductScrollToLower');
            }
          });
        } else {
          this.productList = list;
        }
      } else {
        this.productList = list;
      }
    },
    provide() {
      return {
        prodListMarkerSetting: this.markerSetting,
      };
    },
    watch: {
      regionFind: {
        immediate: true,
        handler: function (value, oldVal) {
          if (this.data.data.enableFilter) {
            if (oldVal) {
              // 从地址选择列表返回课程列表以后，加个loading,让渲染看起来没有那么突兀
              this.loading = true;
              setTimeout(() => {
                this.loading = false;
              }, 300);
            }
            this.currentRegion = value === 'ALL' ? '全部地区' : value;
          }
        },
      },
    },
    computed: {
      ...mapState({
        regionFind: (state) => state.course.regionFind,
      }),
      labelList() {
        let arr = ['全部'],
          nameArr = [];
        this.productList.forEach((item) => {
          if (item.labelListByPriority && item.labelListByPriority['CUSTOM']) {
            nameArr = nameArr.concat(item.labelListByPriority['CUSTOM']);
          }
        });
        const hasPriority = nameArr.filter((i) => i.priority).sort((a, b) => a.priority - b.priority);
        nameArr = hasPriority.concat(nameArr.filter((i) => !i.priority));
        arr = arr.concat(nameArr.map((i) => i.labelName));
        return [...new Set(arr)];
      },
      countryList() {
        let arr = [];
        this.productList.forEach((item) => {
          if (item.courseAddressList) {
            let list = [];
            item.courseAddressList.forEach((name) => {
              if (name.charAt(name.length - 1) === '市') {
                list.push(name.substring(0, name.length - 1));
              } else {
                list.push(name);
              }
            });
            arr = arr.concat(list);
            item.courseAddressList = list;
          }
        });
        return [...new Set(arr)];
      },
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
        // 展示筛选条，筛选出符合选中标签的商品
        if (this.data.data.enableFilter) {
          // 选中全部
          if (this.activeLabel.includes(0)) {
            labelProducts = this.productList.filter((item) => {
              return this.currentRegion === '全部地区' || (item.courseAddressList ? item.courseAddressList.filter((i) => i.indexOf(this.currentRegion) !== -1).length > 0 : true);
            });
          }
          // 选中其他标签
          else {
            // 取出当前所有选中的标签值
            const activeLabelName = this.activeLabel.map((i) => this.labelList[i]);
            // 执行商品筛选
            labelProducts = labelProducts.filter((item) => {
              // 如果存在自定义标签
              if (item.labelListByPriority['CUSTOM']) {
                let find = item.labelListByPriority['CUSTOM'].filter((i) => activeLabelName.includes(i.labelName));
                // 如果有地区选择，但未选择地区
                if (this.currentRegion === '全部地区') {
                  return find.length > 0;
                } else {
                  // 如果有地区选择，并且选择了指定地区
                  if (this.countryList.length) {
                    // 返回课程中符合当前地区的课程
                    return item.courseAddressList ? item.courseAddressList.filter((i) => i.indexOf(this.currentRegion) !== -1).length > 0 && find.length > 0 : true;
                  } else {
                    // 如果没有地区选择
                    return find.length > 0;
                  }
                }
              }
            });
          }
        }

        /*生成伪造的数据*/
        const list = (labelProducts || []).map((item) =>
          deepcopy({
            ...templateData,
            action: { code: this.data.action.code || 'bind-product' },
            data: {
              ...templateData.data,
              product: {
                ...item,
                labelTypes: this.data.data.labelTypes,
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
      /**
       * 商品列表的角标设置
       * @author  尹书延
       * @date    2023/11/16 19:11
       */
      markerSetting() {
        const { markerText = '', markerImg = '' } = this.data.data || {};
        return {
          markerText: markerText || '',
          markerImg: markerImg || '',
        };
      },
    },
    methods: {
      toAddressList() {
        this.$Router.push({ name: 'addressList', query: { countryList: this.countryList } });
      },
      handleLabelClick(index) {
        if (this.$Route.name === 'cmsCourseCLP') {
          uni.$emit('switchProductFilter');
        }
        this.loading = true;
        if (this.activeLabel.includes(index)) {
          this.activeLabel.splice(this.activeLabel.indexOf(index), 1);
        } else {
          const list = this.activeLabel.concat([index]);
          this.activeLabel = [...new Set(list)];
        }

        if (index === 0 && this.activeLabel.length > 1) {
          this.activeLabel = [0];
        }
        // 如果选择其他标签，则默认取消全部选中
        else if (this.activeLabel.length > 1 && this.activeLabel.includes(0)) {
          this.activeLabel.splice(this.activeLabel.indexOf(0), 1);
        } else if (this.activeLabel.length === 0) {
          // 如果其他标签都未选中，默认打开全部
          this.activeLabel.push(0);
        }
        setTimeout(() => {
          this.loading = false;
        }, 300);
      },
      isLabelActive(index) {
        return this.activeLabel.includes(index);
      },
      provideMarkerSetting(index) {
        const { markerSlot = [] } = this.data.data || {};
        if (!markerSlot || !markerSlot.length) return {};
        const slots = markerSlot.map(Number).filter((i) => !isNaN(i));
        return { showProdListMarker: slots.includes(Number(index) + 1) };
      },
    },
    beforeDestroy() {
      this.productList = [];
    },
  };
</script>

<style lang="scss">
  .cms-product-list {
    .empty-tips {
      font-size: 24rpx;
      text-align: center;
      color: var(--BLACK1);
      width: 100%;
    }
    .cms-image.cms-visual-editor-base-container {
      overflow: hidden;
    }
    .p-list-header {
      position: sticky;
      top: 0;
      background-color: #fff;
      margin: 0 0 8rpx;
      z-index: 10;
      width: 582rpx;
      padding: 0 12px;
      box-sizing: border-box;
    }
    .total-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 24rpx;
      color: var(--GREY1);
      > view:last-child {
        display: flex;
        align-items: center;
        justify-content: space-between;

        o2-icon {
          transform: rotate(90deg);
        }
      }
    }
    .label-box {
      display: flex;
      height: 52rpx;
      padding: 28rpx 0 32rpx;

      .label-item {
        background-color: var(--GREY4);
        color: var(--BLACK1);
        padding: 6rpx 16rpx;
        border-radius: 28rpx;
        height: max-content;
        font-size: 12px;
        flex-shrink: 0;
        line-height: 40rpx;

        &:not(:first-child) {
          margin-left: 24rpx;
        }

        &.active {
          background-color: var(--PRIMARY6);
          color: #fff;
        }
      }
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
