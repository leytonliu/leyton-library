<template>
  <view :class="classes" :data-component="data.componentCode" :style="styles" @tap="handleTapBaseContainer">
    <!-- 整体卡片 -->
    <view class="cms-place-holder-card" :style="cardStyle">
      <!-- 标题 -->
      <view class="place-holder-header-container">
        <view :class="['place-holder-header-content', index === activeIndex ? 'place-holder-header-show' : 'place-holder-header-hide']" v-for="(item, index) in componentData.pages" :key="item.componentId">
          <view class="place-holder-header" @tap="toPage(item.componentId)">
            <h2>{{ item.title }}</h2>
            <h5>{{ item.subTitle }}</h5>
            <view class="split-line">
              <view :class="[`split-line-${item.componentId}`]" />
            </view>
          </view>
        </view>
      </view>
      <!-- 进度条 -->
      <view class="indicator-container">
        <view class="indicator-outer">
          <view class="indicator-inner" :style="{ width: `${indicatorWidth}%`, marginLeft: `${indicatorLeft}%` }"></view>
        </view>
      </view>
      <!-- 轮播图 -->
      <swiper :style="{ height: '480rpx' }" @change="swiperChange" autoplay>
        <!-- height = 原有的 692rpx - place-holder-header ( 46rpx + 90rpx + 40rpx + 2rpx + 34rpx ) -->
        <swiper-item v-for="item in componentData.pages" :key="item.componentId">
          <view class="swiper-item h100">
            <!--按类别选购-->
            <view v-if="item.componentId === 'category'" class="category-content">
              <view v-for="(product, pIndex) in item.products" :key="pIndex" class="category-item" :style="{ background: `url(${imagePath}${product.bgUrl})`, backgroundSize: 'cover' }" @tap="toPage('product', product.categoryCode)">
                <view class="left df aic">
                  <view><o2-image width="120" height="120" :src="`${imagePath}${product.imgUrl}`" /></view>
                  <view class="left-text">
                    <view>{{ product.title }}</view>
                    <view>{{ product.desc }}</view>
                  </view>
                </view>
                <view class="right">
                  <text class="isNumber">{{ `${checkNumber(product.btnText).a} ` }}&nbsp;</text>
                  <text>{{ checkNumber(product.btnText).b }}</text>
                </view>
              </view>
            </view>
            <!--按颜色选购-->
            <view v-if="item.componentId === 'color'" class="df color-content">
              <view v-for="(product, pIndex) in item.products" :key="pIndex" class="color-item">
                <text>{{ product.title }}</text>
                <view class="desc" :style="{ backgroundColor: product.bgColor }">
                  <text>{{ product.desc }}</text>
                </view>
                <image :src="`${imagePath}${product.imgUrl}`" :style="{ transform: `rotate(90deg) translateX(${getTop(product)})` }" @tap="popupImage(pIndex, product.categoryCode)" />
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>
    <view class="bottom-tips" v-if="activeIndex === 0">
      <view>
        <o2-icon icon="icon-zuo" size="24rpx" color="#666666" />
        <text>左滑按颜色选购</text>
      </view>
    </view>
    <view class="bottom-tips color-bottom-tips" v-else>
      <view>
        <text>右滑按品类选购</text>
        <o2-icon icon="icon-you" size="24rpx" color="#666666" />
      </view>
    </view>
  </view>
</template>
<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  import env from '@/env/index';
  import { isNumber } from 'plain-utils/object/isNumber';
  import placeholderTrackMixin from '@/mixin/track/placeholderTrackMixin';

  export default {
    name: 'CmsPlaceHolder',
    mixins: [CmsComponentMixin, placeholderTrackMixin],
    data() {
      return {
        componentData: {},
        imagePath: env.OSS_URL + env.DEFAULT_IMAGE_PATH + 'tradePage/',
        activeIndex: 0, // 当前划到的轮播下标
      };
    },
    options: { styleIsolation: 'shared' },
    mounted() {
      this.queryComponentData();
    },
    methods: {
      async queryComponentData() {
        const res = await this.$http.get(`${env.OSS_URL}${env.DEFAULT_IMAGE_PATH}placeholder-data.json`);
        this.componentData = res.data;
        this.$nextTick(() => {
          this.createCategoryObserver();
          this.createColorObserver();
        });
      },
      swiperChange({ detail: { current } }) {
        this.activeIndex = current;
      },
      // 页面跳转
      toPage(id, categoryCode = '') {
        this.trackCategoryTap({ id, categoryCode });
        switch (id) {
          case 'color':
            this.$Router.push({ name: 'categoryPurchase', params: { currentType: 'YS' } });
            break;
          case 'category':
            this.$Router.push({ name: 'categoryPurchase', params: { currentType: 'PL' } });
            break;
          case 'product':
            // if (this.changeTopBar) {
            //   this.changeTopBar();
            // }
            this.$Router.push({ name: 'categoryPurchase', params: { categoryCode, currentType: 'PL' } });
            break;
        }
      },
      getTop(product) {
        const top = product.top ? 206 - product.top : 206;
        return `${top}rpx`;
      },
      resetTop() {
        const page2 = this.componentData.pages.map((component) => {
          component.products.forEach((item) => (item.top = 0));
          return component;
        });
        this.$set(this.componentData, 'pages', page2);
      },
      popupImage(pIndex, categoryCode) {
        this.trackColorTap({ pIndex, categoryCode });

        const page = this.componentData.pages.map((component) => {
          component.products.forEach((item, index) => {
            item.top = index === pIndex ? 36 : 0;
          });
          return component;
        });
        this.$set(this.componentData, 'pages', page);
        setTimeout(() => {
          this.$Router.push({ name: 'categoryPurchase', params: { categoryCode, currentType: 'YS' } });
          setTimeout(() => this.resetTop(), 2000);
        }, 500);
      },
      // btnText中的第一个数字要加粗
      checkNumber(btnText) {
        if (!btnText) return { a: '', b: '' };
        let a = btnText.slice(0, 1);
        let b = btnText.slice(isNumber(a) ? 1 : 0);
        if (!isNumber(a)) a = '';
        return { a, b };
      },
    },
    computed: {
      indicatorWidth() {
        const pages = this.componentData.pages || [];
        return (1 / pages.length) * 100;
      },
      indicatorLeft() {
        const pages = this.componentData.pages || [];
        return this.activeIndex * (1 / pages.length) * 100;
      },
      cardStyle() {
        const pages = this.componentData.pages || [];
        if (!pages.length) return ``;
        return `background-image:url(${this.imagePath}${pages[this.activeIndex].backgroundUrl})`;
      },
    },
  };
</script>
<style lang="scss">
  .cms-place-holder {
    .cms-place-holder-card {
      box-shadow: 0 2rpx 8rpx 0 rgba(0, 0, 0, 0.1);
      border-radius: 16rpx;
      background-color: #ffffff;
      background-size: cover;
    }
    .swiper-item {
      // background: #ffffff;
      border-radius: 16rpx;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .place-holder-header-container {
      position: relative;
      height: 90rpx; // .h2 60rpx + .h5 30rpx
      // 因为进度条单独抽离，所以原有的 34rpx padding-bottom 拿给进度条
      // 因为标题改为绝对定位，所以原有的 40rpx margin-bottom 要拿到这里
      // padding: 46rpx 0 34rpx;
      padding: 46rpx 0 40rpx;
      .place-holder-header-content {
        position: absolute;
        width: 100%;
        height: 100%;
        transition: all 240ms ease;
        opacity: 1;
        pointer-events: all;
        &.place-holder-header-hide {
          opacity: 0;
          pointer-events: none;
        }
      }
    }
    .place-holder-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      h2 {
        font-size: 40rpx;
        @include font-regular();
        font-weight: 400;
        color: #000000;
        line-height: 60rpx;
      }
      h5 {
        width: 370rpx;
        height: 30rpx;
        font-size: 24rpx;
        @include font-light();
        color: #333333;
        opacity: 0.6;
        line-height: 30rpx;
        // margin-bottom: 40rpx;
        text-align: center;
      }
    }
    .indicator-container {
      height: 2rpx;
      padding-bottom: 34rpx; // 因为进度条单独抽离，所以原有的 34rpx padding-bottom 拿给进度条
      position: relative;
      width: 100%;
      overflow: hidden;
      .indicator-outer {
        position: absolute;
        top: 0;
        width: 346rpx;
        height: 2rpx;
        // margin: 0 auto;
        left: calc((100% - 346rpx) / 2);
        background-color: #d8d8d8;
        z-index: 5;

        .indicator-inner {
          top: 0;
          height: 2rpx;
          background-color: #000;
          transition: all 0.5s;
        }
      }
    }
    .category-content {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      flex: 1;
    }
    .category-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 40rpx;
      .left {
        .o2-image {
          background-color: transparent !important;
        }
      }
      .left-text {
        margin-left: 32rpx;
        & > view:nth-child(1) {
          font-size: 28rpx;
          @include font-regular();
          font-weight: 300;
          color: #000000;
          line-height: 42rpx;
          margin-bottom: 16rpx;
        }
        & > view:nth-child(2) {
          font-size: 24rpx;
          @include font-light();
          font-weight: 200;
          color: #000000;
          line-height: 30rpx;
        }
      }
      .right {
        width: 128rpx;
        height: 48rpx;
        line-height: 39rpx;
        background: #000000;
        border-radius: 24rpx;
        border: 1rpx solid #000000;
        text-align: center;
        text {
          font-size: 20rpx;
          @include font-regular();
          color: #ffffff;
        }
        .isNumber {
          font-size: 24rpx;
        }
      }
    }
    .bottom-tips {
      margin-top: 22rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #fff;
      line-height: 36rpx;
      height: 58rpx;
      box-sizing: border-box;
      & > view {
        position: relative;
      }
      .o2-icon {
        position: absolute;
        left: -24rpx;
        top: calc(50% - 12rpx);
        margin-left: 0;
      }
      text {
        font-size: 24rpx;
        @include font-regular();
        margin-left: 12rpx;
        color: #666;
      }
    }
    .color-bottom-tips {
      .o2-icon {
        left: auto;
        right: -36rpx;
      }
    }
    .color-content {
      padding: 30rpx 8rpx 0;
      justify-content: space-between;
    }
    .color-item {
      display: flex;
      gap: 8rpx;
      flex-direction: column;
      align-items: center;
      min-width: 100rpx;
      text {
        font-size: 22rpx;
        @include font-regular();
        font-weight: 300;
        color: #000000;
        line-height: 34rpx;
      }
      .desc {
        width: 84rpx;
        height: 32rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        text {
          font-size: 16rpx;
          @include font-medium();
          font-weight: 500;
          color: #000000;
          line-height: 20rpx;
        }
      }
      image {
        width: 406rpx;
        height: 100rpx;
      }
    }
  }
</style>
