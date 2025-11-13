<!--
 * @Author: lidong.liu@hand-china.com
 * @Date: 2024-02-04 10:31:00
 * @LastEditTime:  2024-02-04 10:31:00
 * @LastEditors:  lidong.liu@hand-china.com
 * @Description: file content
 * @FilePath: \o2-b2c-mall\src\components\cms\packages\components\cms-point-placeholder.vue
-->
<template>
  <view :class="classes" :data-component="data.componentCode" :style="styles" v-if="isLogin">
    <view class="point-card">
      <view class="point-card-line">
        <view class="point-card-value">
          <text>{{ point }}</text>
          <text class="point-card-unit">积分</text>
        </view>
        <view class="point-card-rule" @tap="handleTapBaseContainer">积分规则</view>
      </view>
      <view class="point-card-summary" @tap="goIntegralDetail">
        <view>积分兑换明细</view>
        <image :src="minioUrl + imagePath + '/icon-right.png'" class="point-card-summary-icon" />
      </view>
    </view>
  </view>
</template>
<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  import env from '@/env';

  export default {
    name: 'CmsPointPlaceholder',
    mixins: [CmsComponentMixin],
    data() {
      return {
        minioUrl: env.OSS_URL,
        imagePath: env.DEFAULT_IMAGE_PATH + env.theme,
        point: 0,
        pointChanged: false,
      };
    },
    computed: {
      isLogin() {
        return !!this.$store.state.login.token;
      },
    },
    watch: {
      isLogin: {
        immediate: true,
        handler: async function (val) {
          val && (await this.fetchPoint());
        },
      },
    },
    onPageShow() {
      if (this.isLogin) {
        this.fetchPoint();
      }
    },
    mounted() {
      uni.$on('queryPoints', () => {
        setTimeout(async () => {
          await this.fetchPoint();
          // 业务需要：如果第一次查询积分没变化，则再查询一次，最多查询两次
          if (!this.pointChanged) {
            setTimeout(() => {
              this.fetchPoint();
            }, 1000);
          }
        }, 1000);
      });
    },
    destroyed() {
      uni.$off('queryPoints');
    },
    methods: {
      goIntegralDetail() {
        this.$Router.push({ name: 'integralDetail', params: { pageFrom: 'center' } });
      },
      async fetchPoint() {
        const url = this.$requestUrl.ucenter.queryPoint;
        try {
          const { data } = await this.$http.get(url);
          if (data.totalPoint && data.totalPoint !== this.point) {
            this.pointChanged = true;
          } else {
            this.pointChanged = false;
          }
          this.point = data.totalPoint;
        } catch (e) {
          console.log('e', e);
          this.point = 0;
        }
      },
    },
  };
</script>
<style lang="scss">
  .cms-point-placeholder {
    display: flex !important;
    align-items: center;
    justify-content: center;

    .point-card {
      box-sizing: border-box;
      width: 686rpx;
      height: 184rpx;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.98) 100%);
      border-radius: 16rpx;
      //border: 2rpx solid;
      border-image: linear-gradient(180deg, rgba(255, 255, 255, 0.57), rgba(255, 255, 255, 1)) 2 2;
      backdrop-filter: blur(2px);
      overflow: hidden;
      padding: 38rpx 32rpx 40rpx;

      .point-card-line {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 32rpx;

        .point-card-value {
          font-size: 48rpx;
          @include font-medium();
          color: #000000;
          line-height: 48rpx;
        }

        .point-card-unit {
          font-size: 24rpx;
          @include font-regular();
          color: #000000;
          line-height: 24rpx;
          margin-left: 8rpx;
        }

        .point-card-rule {
          background: rgba(0, 0, 0, 0.5);
          width: 140rpx;
          height: 52rpx;
          border-radius: 50rpx;
          font-size: 24rpx;
          color: #ffffff;
          @include font-regular();
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 52rpx;
        }
      }

      .point-card-summary {
        font-size: 24rpx;
        @include font-regular();
        color: #000000;
        line-height: 24rpx;
        display: flex;
        align-items: center;

        .point-card-summary-icon {
          width: 24rpx;
          height: 24rpx;
          margin-left: 8rpx;
        }
      }
    }
  }
</style>
