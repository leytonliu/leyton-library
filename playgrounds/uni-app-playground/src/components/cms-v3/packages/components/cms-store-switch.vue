<!--
 * @Author: shuyan.yin@hand-china.com
 * @Date: 2023-12-04 14:25:00
 * @LastEditTime: 2023-12-14 21:01:39
 * @LastEditors: shuyan.yin@hand-china.com
 * @Description: file content
 * @FilePath: \o2-b2c-mall\src\components\cms\packages\components\cms-store-switch.vue
-->
<template>
  <view :class="['store-switch-container', !isShow && 'store-switch-container-hidden']" :data-component="data.componentCode" :style="styles" @tap="goStoreSwitch">
    <view class="store-switch-icon"><o2-icon icon="icon-mendian" size="32rpx" /></view>
    <view class="store-switch-txt ellipsis1">{{ salonName }}</view>
    <view class="store-switch-right">
      <view class="store-switch-right-txt">切换门店</view>
      <view class="store-switch-right-arrow"><o2-icon icon="icon-jiantouyou" size="32rpx" /></view>
    </view>
  </view>
</template>
<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';

  export default {
    name: 'CmsStoreSwitch',
    mixins: [CmsComponentMixin],
    data() {
      return {
        salonName: '正在获取门店信息',
      };
    },
    mounted() {
      if (this.salonCode) this.getStoreName(this.salonCode);
    },
    computed: {
      userMemberInfo() {
        return this.$store.state.user.userInfo || {};
      },
      /** 是否可见，这个组件对沙龙账号的用户不可见 */
      isShow() {
        return this.userMemberInfo.salonAccountType && this.userMemberInfo.salonAccountType === 'CUSTOMER';
      },
      salonCode() {
        return this.userMemberInfo.currentStoreCode;
      },
    },
    watch: {
      async salonCode(val) {
        if (!this.isShow || !val) {
          this.salonName = '暂无门店信息';
          return;
        } else this.salonName = '正在获取门店信息';
        if (this.userMemberInfo.currentStoreName) this.salonName = this.userMemberInfo.currentStoreName;
        else {
          await this.getStoreName(val);
        }
      },
    },
    methods: {
      async getStoreName(val) {
        const url = this.$requestUrl.cms.getSalonStoreName + '/' + val;
        const res = await this.$http.get(url, {});
        if (res && res.data && res.data.salonStoreName) this.salonName = res.data.salonStoreName;
        else this.salonName = '门店信息获取失败';
      },
      goStoreSwitch() {
        if (!this.isShow) return;
        this.$Router.push({
          name: 'salonSelectStore',
        });
      },
    },
  };
</script>
<style lang="scss">
  .store-switch-container {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    padding: 16rpx 32rpx;
    color: #000;
    &.store-switch-container-hidden {
      display: none;
    }
    .store-switch-icon {
      width: 32rpx;
      height: 32rpx;
      margin-right: 16rpx;
      flex-shrink: 0;
    }
    .store-switch-txt {
      margin-right: 20rpx;
      width: 100%;
      height: 36rpx;
      font-size: 28rpx;
      font-family: SourceHanSansCN;
      font-weight: 300;
      line-height: 36rpx;
    }
    .store-switch-right {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      flex-shrink: 0;
      .store-switch-right-txt {
        height: 32rpx;
        flex-shrink: 0;
        font-size: 24rpx;
        font-family: SourceHanSansCN;
        font-weight: 300;
        line-height: 32rpx;
      }
      .store-switch-right-arrow {
        width: 32rpx;
        height: 32rpx;
        margin-left: 4rpx;
        flex-shrink: 0;
      }
    }
  }
</style>
