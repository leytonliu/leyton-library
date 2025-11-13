<template>
  <view :class="classes" :data-component="data.componentCode" :style="styles">
    <div class="p-list-header">
      <scroll-view :enable-flex="true" :scroll-x="true" class="label-box">
        <view :class="['label-item', isLabelActive(index) && 'active']" v-for="(label, index) in labelList" :key="index" @click="handleLabelClick(index)">{{ label }}</view>
      </scroll-view>
      <view class="total-box" v-if="!loading">
        <view v-if="currentRegion === '全部地区' && activeLabel.includes(0) && activeLabel.length === 1">共{{ totalCnt }}篇内容</view>
        <view v-else>共{{ totalCnt }}篇内容</view>
        <view @click="toAddressList" v-if="countryList.length && activeTabIndex() === 1">
          <text>{{ currentRegion }}</text>
          <o2-icon icon="icon-jiantouyou" size="30rpx" />
        </view>
      </view>
    </div>
    <view v-if="loading" class="loading">
      <o2-image :width="48" is-absolute :src="minioUrl + imagePath + '/easy-loadimage/loading.gif'" />
      <text class="tip text-body2 color-grey2">{{ intl('b2c.component.cmsTabs.loading').d(`加载中`) }}</text>
    </view>
    <scroll-view scroll-y id="scroll-view-wrapper" :style="{ height: scrollViewHeight }" @scroll="handleScroll">
      <view v-if="productChildrenData.length" :style="paddingStyle">
        <view v-for="(item, index) in productChildrenData" :key="item.componentId" :style="itemWrapperStyles">
          <cms-base-component v-if="index >= startIndex && index <= endIndex" :children-styles="productListChildrenStyles[index]" :data="item" :index="index" :provides="provideMarkerSetting(index)" />
        </view>
        <view class="load-tips" v-if="isRequest">
          <o2-image :width="48" is-absolute :src="minioUrl + imagePath + '/easy-loadimage/loading.gif'" />
          <text class="tip text-body2 color-grey2">{{ intl('b2c.component.cmsTabs.loading').d(`加载中`) }}</text>
        </view>
        <view v-else-if="noMore" class="load-tips tip text-body2 color-grey2">- 没有更多了 -</view>
      </view>
      <view v-else-if="!loading" class="empty-tips">暂无数据~</view>
    </scroll-view>
  </view>
</template>

<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  import { removeUnit } from '@/components/cms/packages/utils/removeUnit';
  import { deepcopy } from '@/components/cms/packages/utils/deepcopy';
  import { iterateComponentData } from '@/components/cms/packages/utils/iterateComponentData';
  import { mapState } from 'vuex';
  import env from '@/env/index';
  import { convertStyleToString } from '@/utils/utils';

  /*
   * @Description: 全部课程列表组件，根据绑定的类别编码以及配置的模板自动生成课程/专栏列表
   * @Author: sunliu
   * @Date: 2024-01-09 14:35:09
   */
  export default {
    name: 'CmsAllCourseList',
    mixins: [CmsComponentMixin],
    provide() {
      return {
        prodListMarkerSetting: this.markerSetting,
      };
    },
    inject: {
      activeTabIndex: { from: 'activeTabIndex', default: () => {} }, // 获取课程类型[0：线上课程,1：线下课程]
    },
    data() {
      return {
        categoryCode: null, // 课程类别编码
        activeLabel: [0], // 存放激活的标签

        loadMore: false,
        currentRegion: '全部地区', // 存放选中的地区
        loading: false,
        minioUrl: env.OSS_URL,
        imagePath: env.DEFAULT_IMAGE_PATH + env.theme, // oss资源路径

        page: 0,
        size: 99,
        totalCnt: 0, // 数据总条数
        totalPages: 99, // 数据总页数

        allList: [], // 所有数据
        isRequest: false, // 是否正在请求数据
        oneHeight: 96, // 单条数据的高度
        showNum: 0, // 可见区域最多能展示多少条数据
        startIndex: 0, // 渲染元素的第一个索引
        endIndex: 0, // 渲染元素的最后一个索引
        paddingStyle: '',
        // scrollTop: 0, // 当前滚动高度,再次返回页面时能定位到之前的滚动高度
        lower: 96, // 距离底部多远时触发触底事件
        containerOffsetHeight: 0, // 滚动区域可见高度
        filterList: [], // filter接口返回的所有筛选数据
      };
    },
    watch: {
      regionFind: {
        immediate: true,
        handler: async function (value, oldVal) {
          this.loading = true;
          this.currentRegion = value === 'ALL' ? '全部地区' : value;
          if (oldVal && value !== oldVal) {
            await this.getData(true);
          }
          this.loading = false;
        },
      },
      allList() {
        this.resetIndex();
      },
    },
    computed: {
      ...mapState({
        siteInfo: (state) => state.siteInfo,
        regionFind: (state) => state.course.regionFind,
      }),
      itemWrapperStyles() {
        return convertStyleToString({ height: `${this.oneHeight}px` });
      },
      // 是否可以继续分页
      noMore() {
        return !(this.page < this.totalPages);
      },
      // 滚动区域定高
      scrollViewHeight() {
        return `calc(100% - 73px - 8rpx)`;
      },
      /*
       * @Description: 商品关联的标签集合
       * @Author: sunliu
       * @Date: 2024-01-16 14:14:36
       */
      labelList() {
        let labelFilterData = [];
        this.filterList.map(({ filterCode, filterValueList }) => {
          if (filterCode === 'labelProduct_CUSTOM') {
            labelFilterData = filterValueList.map(({ filterValueCode }) => filterValueCode);
          }
        });
        return ['全部', ...labelFilterData];
      },
      /*
       * @Description: 商品关联的地区数据集合
       * @Author: sunliu
       * @Date: 2024-01-16 14:14:02
       */
      countryList() {
        let addressFilterData = [];
        this.filterList.map(({ filterCode, filterValueList }) => {
          if (filterCode === 'salesAttr_COURSE_ADDRESS') {
            addressFilterData = filterValueList.map(({ filterValueCode }) => filterValueCode);
          }
        });
        return addressFilterData;
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

        /*生成伪造的数据*/
        const list = (this.allList || []).map((item) => {
          const product = {
            ...(item.kindTypeCode !== 'VIRTUAL_SPECIAL' && { courseForm: item.course.courseForm, speaker: item.course.speaker }),
            imageUrl: item.imageUrl,
            kindTypeCode: item.kindTypeCode,
            labelList: item.labelList,
            labelTypes: 'CUSTOM',
            platformProductCode: item.platformProductCode,
            title: item.title,
          };
          return deepcopy({
            id: item.id,
            ...templateData,
            action: { code: item.kindTypeCode === 'VIRTUAL_SPECIAL' ? 'bind-specialColumn' : 'bind-product' },
            data: {
              ...templateData.data,
              product,
              ...(item.kindTypeCode === 'VIRTUAL_SPECIAL' && {
                specialColumn: {
                  ...product,
                  courseTotalCount: item.courseCount,
                  specialColumnCode: item.platformProductCode,
                },
              }),
            },
          });
        });

        //将商品数据给到每一个childrenData
        iterateComponentData((data) => {
          data.childrenData?.forEach((childData) => {
            if (!childData) {
              return;
            }
            childData.data.product = data.data.product;
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
        return this.allList.map((_, index) => {
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
    async created() {
      const { categoryCode } = this.data.data.lovValue;
      this.categoryCode = categoryCode;

      this.loading = true;
      await this.getFilterData();
      await this.getData(true);
      this.loading = false;
    },
    mounted() {
      // 获取滚动区域的可视高度
      uni
        .createSelectorQuery()
        .in(this)
        .select('#scroll-view-wrapper')
        .boundingClientRect((rect) => {
          this.containerOffsetHeight = rect.height;
          this.canShowNum();
        })
        .exec();
    },
    methods: {
      async getFilterData() {
        const params = { categoryCode: this.categoryCode, catalogVersionCode: this.siteInfo.catalogVersionCode, kindTypeCodeList: ['VIRTUAL_COURSE'] };

        const {
          data: { filterList },
        } = await this.$http.get(this.$requestUrl.products.productFilterList, params);

        this.filterList = filterList;
      },
      async resetIndex() {
        let result = { startIndex: 0, endIndex: 0 };
        const maxIndex = this.allList.length - 1;
        const externalLength = 6;
        const showLength = this.showNum + externalLength * 2;
        if (maxIndex + 1 < showLength) {
          /*数据数量不够，显示所有数据*/
          result.startIndex = 0;
          result.endIndex = maxIndex;
        } else {
          /*数据数量超过虚拟滚动展示的行数，计算startIndex以及endIndex*/
          // 可见区域第一个元素的index
          let startIndex = ~~(this.scrollTop / this.oneHeight) - externalLength;
          if (startIndex < 0) {
            startIndex = 0;
          }
          if (startIndex > maxIndex) {
            startIndex = maxIndex;
          }
          let endIndex = startIndex + showLength;
          let whileMaxCount = showLength;
          while (endIndex > maxIndex) {
            endIndex--;
            startIndex--;
            whileMaxCount--;
            if (whileMaxCount <= 0) {
              /*while循环最多执行次数不能超过showLength，超过证明代码出现异常，避免死循环这里直接跳出循环*/
              break;
            }
          }
          result.startIndex = startIndex;
          result.endIndex = endIndex;
        }
        if (result.startIndex === this.startIndex && result.endIndex === this.endIndex) {
          return;
        }
        this.startIndex = result.startIndex;
        this.endIndex = result.endIndex;
        this.paddingStyle = convertStyleToString({
          overflowAnchor: 'none',
        });
      },
      /*
       * @Description: 请求列表数据
       * @Author: sunliu
       * @Date: 2024-01-17 23:36:46
       */
      async getData(isInit) {
        if (isInit) {
          // 初始化列表
          this.page = 0;
          this.allList = [];
        }
        if (this.page === 0 || this.page < this.totalPages) {
          this.isRequest = true; // 正在请求中
          // 处理筛选条件
          let filter = '';
          // 线上课程，只有标签筛选
          if (this.activeTabIndex() === 0) {
            if (this.activeLabel.includes(0) && this.activeLabel.length === 1) {
              filter = '';
            } else {
              filter = '?filter=[labelProduct_CUSTOM]' + this.activeLabel.map((i) => this.labelList[i]).join('||');
            }
          }
          // 线下课程有标签筛选和地区筛选
          if (this.activeTabIndex() === 1) {
            const arr = [];
            if (this.activeLabel.length > 1 || !this.activeLabel.includes(0)) {
              arr.push(`[labelProduct_CUSTOM]${this.activeLabel.map((i) => this.labelList[i]).join('||')}`);
            }
            if (this.regionFind !== 'ALL') {
              arr.push(`[salesAttr_COURSE_ADDRESS]${this.currentRegion}`);
            }
            if (arr.length) {
              filter = '?filter=' + arr.join('&filter=');
            }
          }

          const { productList, totalPages, totalCnt } = await this.env.getCourseListByCode({
            params: {
              filter,
              categoryCode: this.categoryCode,
              page: this.page,
              size: this.size,
            },
          });

          this.allList = [...this.allList, ...productList];
          this.totalPages = totalPages;
          this.totalCnt = totalCnt;
          this.isRequest = false;
        }
      },
      // 计算可见区域能展示的条数
      canShowNum() {
        // ~~ 按位两次取反，得到整数
        this.showNum = ~~(this.containerOffsetHeight / this.oneHeight) + 1;
      },
      // 监听滚动
      handleScroll(e) {
        this.handleData(e);
      },

      async handleData(e) {
        // 记录当前元素滚动的高度
        this.scrollTop = e.detail.scrollTop;
        this.resetIndex();
        // 滚动距离底部，还有this.lower距离时，触发触底事件，正在请求中不发送数据
        if (!this.isRequest && e.detail.scrollHeight - e.detail.scrollTop - this.containerOffsetHeight < this.lower) {
          if (this.page < this.totalPages) {
            this.page++;
            await this.getData();
          }
        }
      },
      toAddressList() {
        this.$Router.push({ name: 'addressList', query: { countryList: this.countryList } });
      },
      /*
       * @Description: 选择标签
       * @Author: sunliu
       * @Date: 2024-01-17 23:38:40
       */
      async handleLabelClick(index) {
        this.loading = true;
        this.scrollTop = 0;
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

        await this.getData(true);
        this.loading = false;
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
  };
</script>

<style lang="scss">
  .cms-all-course-list {
    height: 100%;
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

    .load-tips {
      width: 100%;
      display: flex !important;
      align-items: center;
      justify-content: center;
      padding-bottom: 48rpx;
    }

    .loading-content {
      opacity: 0.5;
      transition: 'opacity .05s';
    }
  }
</style>
