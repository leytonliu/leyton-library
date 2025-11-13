<!--
 * @Author: lidong.liu@hand-china.com
 * @Date: 2024-02-28 10:31:00
 * @LastEditTime:  2024-02-28 10:31:00
 * @LastEditors:  lidong.liu@hand-china.com
 * @Description: file content
 * @FilePath: \o2-b2c-mall\src\components\cms\packages\components\cms-point-sign-placeholder.vue
-->
<template>
  <view :class="classes" :data-component="data.componentCode" :style="styles" v-if="isLogin">
    <view class="point-sign-card-border">
      <view class="point-sign-card">
        <view class="point-sign-card-row">
          <view class="point-sign-card-title">签到赢积分</view>
          <view class="point-sign-card-more" @tap="toSignCourtesy">
            查看签到详情
            <image :src="minioUrl + imagePath + '/icon-right.png'" class="point-sign-card-summary-icon" />
          </view>
        </view>
        <view class="point-sign-card-main">
          今日签到可获得
          <text class="point-value">{{ award }}</text>
          积分
        </view>
        <view class="point-sign-card-btn-wrapper">
          <view class="point-sign-card-btn btn-disabled" v-if="signFlag">今日已签到</view>
          <view class="point-sign-card-btn" v-else @tap="sign">立即签到</view>
        </view>
      </view>
    </view>
    <task-popup ref="taskPopup" :image="image" :text="popupSignText" popupSyle="default" :num="popupAward" buttonText="我知道了" @onBackPage="closeTaskPopup" />
  </view>
</template>
<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  import env from '@/env';
  import TaskPopup from '@/components/task-popup/index.vue';

  export default {
    name: 'CmsPointSignPlaceholder',
    components: { TaskPopup },
    mixins: [CmsComponentMixin],
    data() {
      return {
        minioUrl: env.OSS_URL,
        imagePath: env.DEFAULT_IMAGE_PATH + env.theme,
        award: 0, // 今日签到可获积分
        signFlag: false, // 是否已签到
        popupAward: 0, // 本次签到获得积分
        popupContinueAward: 0, //  连续签到可得
        popupSignText: '', // 弹窗提示
        openPopupFlag: false,
      };
    },
    computed: {
      isLogin() {
        return !!this.$store.state.login.token;
      },
      image() {
        return this.minioUrl + this.imagePath + '/task-coupon@3x.png';
      },
    },
    watch: {
      isLogin: {
        immediate: true,
        handler: async function (val) {
          val && (await this.queryTodaySignPoints());
        },
      },
    },
    onPageShow() {
      if (this.isLogin) {
        this.queryTodaySignPoints();
      }
    },
    methods: {
      async sign() {
        // 签到
        try {
          const { data } = await this.$http.get(this.$requestUrl.login.getCustomerInfo);
          if (data && data.applyStatus && data.currentRole === 'GUEST') {
            switch (data.applyStatus) {
              case 'WAIT_APPROVE':
                this.$Router.push({ name: 'submited' });
                break;
              case 'REJECT':
                this.$Router.push({ name: 'approveFailed' });
                break;
              case 'WAIT_AUTH':
                this.$Router.push({ name: 'role', params: { tabBarFrom: 'home' } });
                break;
            }
          } else {
            const url = this.$requestUrl.taskCenter.dailySign;
            this.$showLorealLoading();
            const res = await this.$http.post(url);
            if (res.data && res.data.success) {
              const { award = 0, continueAward = 0 } = res.data;
              this.popupAward = award;
              this.popupContinueAward = continueAward;
              this.popupSignText = '签到成功，连签可获得更多积分';
              this.$refs.taskPopup.openDealer();
            }
          }
        } catch (e) {
          console.log('签到失败', e);
        } finally {
          this.$hideLorealLoading();
        }
      },
      async queryTodaySignPoints() {
        // 查询今日签到可得积分
        const url = this.$requestUrl.taskCenter.queryTodaySignPoints;
        try {
          const res = await this.$http.get(url);
          const { signFlag = 0, award = 0 } = res.data;
          this.signFlag = signFlag;
          this.award = award;
        } catch (e) {
          console.log('查询今日签到可得积分失败', e);
        }
      },
      toSignCourtesy() {
        this.$Router.push({ name: 'signInWithCourtesy' });
      },
      async closeTaskPopup() {
        // 关闭第一个签到成功弹窗或者关闭第二个连签弹窗后，需要重新查询积分活动
        if ((this.popupContinueAward && this.openPopupFlag) || !this.popupContinueAward) {
          await this.queryTodaySignPoints();
          uni.$emit('queryPoints');
        }
        this.$refs.taskPopup.$refs.taskPopup.close();
        if (this.popupContinueAward && !this.openPopupFlag) {
          setTimeout(() => {
            this.popupAward = this.popupContinueAward;
            this.popupSignText = '恭喜您连续签到获得了更多积分！';
            this.$refs.taskPopup.openDealer();
            this.openPopupFlag = true;
          }, 100);
        }
      },
    },
  };
</script>
<style lang="scss">
  .cms-point-sign-placeholder {
    display: flex !important;
    align-items: center;
    justify-content: center;

    .point-sign-card-border {
      box-sizing: border-box;
      width: 690rpx;
      height: 268rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16rpx;
      background: linear-gradient(64deg, rgba(147, 147, 147, 1), rgba(229, 229, 229, 1), rgba(248, 248, 248, 1), rgba(138, 138, 138, 1));
    }

    .point-sign-card {
      width: 686rpx;
      height: 264rpx;
      background: radial-gradient(76% 142% at 100% 100%, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.04) 29%, rgba(0, 0, 0, 0) 44%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0) 100%), #ffffff;
      border-radius: 16rpx;
      //border-radius和border-image会冲突，会导致缺角
      //border: 2rpx solid;
      //border-style: solid;
      //border-width: 2rpx;
      //border-image: linear-gradient(64deg, rgba(147, 147, 147, 1), rgba(229, 229, 229, 1), rgba(248, 248, 248, 1), rgba(138, 138, 138, 1)) 2 2;
      box-sizing: border-box;
      padding: 32rpx 32rpx 40rpx;

      .point-sign-card-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16rpx;

        .point-sign-card-title {
          @include font-regular();
          font-size: 32rpx;
          color: #000000;
          line-height: 32rpx;
        }

        .point-sign-card-more {
          @include font-regular();
          font-size: 24rpx;
          color: #000000;
          line-height: 24rpx;
          text-align: left;
          font-style: normal;
          display: flex;
          align-items: center;

          .point-sign-card-summary-icon {
            width: 24rpx;
            height: 24rpx;
            margin-left: 8rpx;
          }
        }
      }

      .point-sign-card-main {
        @include font-regular();
        font-size: 24rpx;
        color: #999999;
        line-height: 24rpx;
        text-align: left;
        font-style: normal;
        margin-bottom: 32rpx;

        .point-value {
          @include font-medium();
          font-size: 40rpx;
          color: #000000;
          line-height: 40rpx;
          text-align: left;
          font-style: normal;
          margin: 0 8rpx 0;
        }
      }

      .point-sign-card-btn-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;

        .point-sign-card-btn {
          width: 622rpx;
          height: 72rpx;
          background: #2f2f34;
          border-radius: 40rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          @include font-regular();
          font-size: 28rpx;
          color: #ffffff;
          line-height: 28rpx;
          text-align: center;
          font-style: normal;
        }

        .btn-disabled {
          background: #b9b9bb;
        }
      }
    }
  }
</style>
