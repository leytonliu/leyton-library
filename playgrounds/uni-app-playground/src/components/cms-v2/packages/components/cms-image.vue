<template>
  <view :class="classes" :data-component="data.componentCode" :style="styles" v-if="showImage" @tap="handleTapBaseContainer">
    <image key="@@image" :mode="imageMode" :src="getBindingValue(data.data.url)" :style="imageStyle" :show-menu-by-longpress="data.data.saveFlag" class="cms-image-inner" @load="onImageLoad" />
    <template v-if="!isLoading && !!data.childrenData">
      <cms-base-component v-for="(item, index) in data.childrenData" :key="item.componentId" :data="item" :index="index" />
    </template>
    <view v-if="prodListMarker.enable" class="cms-image-marker">
      <image mode="aspectFit" :src="prodListMarker.markerImg" class="cms-image-marker-img" />
      <view class="cms-image-marker-txt">{{ prodListMarker.markerText }}</view>
    </view>
  </view>
</template>

<script>
  import { convertStyleToString } from '@/utils/utils';
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  import { defer } from '@/utils/defer';
  import { mapState } from 'vuex';

  /**
   * 图片组件
   * @author  韦胜健
   * @date    2022/9/19 21:00
   */
  export default {
    name: 'CmsImage',
    mixins: [CmsComponentMixin],
    data() {
      return {
        isLoading: true, // 初始状态为加载中
        /**
         * 当父组件设置autoGetRect，获取子组件高度的时候，这里图片组件需要先等图片加载完毕，再读取高度返回给父节点
         * @author  韦胜健
         * @date    2022/9/19 20:57
         */
        queryRectPrepare: defer(),
      };
    },
    inject: {
      prodListMarkerSetting: { from: 'prodListMarkerSetting', default: {} },
      showProdListMarker: { from: 'showProdListMarker', default: false },
    },
    computed: {
      imageStyle() {
        const styles = {
          display: 'block',
        };
        if (this.data.data.width) {
          styles.width = this.data.data.width;
        }
        // 为图片自身设置圆角
        if (this.data.style.borderRadius) {
          styles.borderRadius = this.data.style.borderRadius;
        }
        styles.height = this.data.data.height;
        // if (!!this.data.data.height && this.data.data.height !== '100%') {
        //   styles.height = this.data.data.height;
        // }
        return convertStyleToString(styles);
      },
      imageMode() {
        switch (this.data.data.objectFit) {
          case 'fill':
            if (!!this.data.data.width && !!this.data.data.height && this.data.data.height !== '100%') {
              return 'scaleToFill';
            } else {
              return 'widthFix';
            }
          case 'contain':
            return 'aspectFit';
          case 'cover':
            return 'aspectFill';
          case 'none':
            return 'scaleToFill';
          case 'scale-down':
            return 'widthFix';
        }
        return 'widthFix';
      },
      isLogin() {
        return !!this.$store.state.login.token;
      },
      showImage() {
        if (this.data.data.visibleFlag) {
          return this.isLogin ? this.seedingFlag : false;
        } else {
          return true;
        }
      },
      /**
       * 商品列表的角标设置
       * @author  尹书延
       * @date    2023/11/16 19:41
       */
      prodListMarker() {
        /** 商品列表的角标展示在主图上 */
        if (this.data.data.url !== '@@product-image' || parseInt(this.data.data.height) < 42) return { enable: false };
        /** 判断是否需要展示角标 */
        if (!this.prodListMarkerSetting || !this.showProdListMarker) return { enable: false };
        const { markerText = '', markerImg = '' } = this.prodListMarkerSetting;
        /** 没有文字则不展示角标 */
        if (!markerText) return { enable: false };
        return { enable: true, markerText, markerImg };
      },
      ...mapState({
        seedingFlag: (state) => state.user.seedingFlag,
        userInfo: (state) => state.user.userInfo,
      }),
    },
    methods: {
      onImageLoad() {
        this.isLoading = false;
        this.$nextTick(() => this.queryRectPrepare.resolve());
      },
    },
  };
</script>

<style lang="scss">
  .cms-image.cms-visual-editor-base-container {
    position: relative;
    display: flex;

    .cms-image-inner {
      align-self: center;
    }

    .cms-image-marker {
      position: absolute;
      display: flex;
      align-items: center;
      top: 0;
      left: 0;
      padding: 4rpx 10rpx 4rpx 5rpx;
      border-radius: 0 0 8px 0;
      background-color: #0000005c;
      color: #fff;
      pointer-events: none;
      backdrop-filter: blur(3px);
      .cms-image-marker-img {
        width: 26rpx;
        height: 26rpx;
      }
      .cms-image-marker-txt {
        padding: 0 6rpx;
        font-size: 18rpx;
      }
    }
  }
</style>
