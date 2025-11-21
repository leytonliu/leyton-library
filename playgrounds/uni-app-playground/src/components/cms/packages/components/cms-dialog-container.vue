<template>
  <!-- TODO：考虑通过 v-if 还是 opacity 来控制显影 -->
  <view
    v-if="isShow"
    :class="wrapperClasses"
    @touchmove.stop.prevent="moveStop"
  >
    <view class="cms-dialog-container-mask" />

    <view class="cms-dialog-container-flex">
      <view class="cms-dialog-container-close-btn" @click="handleClose">
        <cms-icon icon="icon-guanbi2" size="28rpx" color="#fff" />
      </view>

      <scroll-view
        class="cms-dialog-container-content"
        :scroll-y="true"
        @touchmove.stop
      >
        <view
          :class="classes"
          :data-component="data.componentCode"
          :style="styles"
          @tap="handleTapBaseContainer"
        >
          <cms-base-component
            v-for="(item, index) in data.childrenData"
            :key="item.componentId"
            :data="item"
            :index="index"
          />
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { CmsBaseComponentProps } from '../../cms';
import { cmsBaseComponentDefaults } from '../utils/constants';
import useCmsComponent from '../hooks/useCmsComponent';
import CmsBaseComponent from '../cms-base-component.vue';
import { useCmsDialogDisplay } from '../hooks/useCmsDialogDisplay';
import CmsIcon from './cms-icon.vue';

defineOptions({
  name: 'CmsDialogContainer',
});

const props = withDefaults(defineProps<CmsBaseComponentProps>(), {
  ...cmsBaseComponentDefaults,
});

const { classes, styles, handleTapBaseContainer } = useCmsComponent(props);

const isShow = ref(false);

const { shouldShow, markAsShown } = useCmsDialogDisplay(
  props.data.data,
  props.data.componentId
);

console.log(props.data.componentId, shouldShow);

// 如果规则通过，则显示并扣除次数
if (shouldShow) {
  isShow.value = true;
  markAsShown();
}

const wrapperClasses = computed(() => {
  return [
    'cms-dialog-container-wrapper',
    isShow.value ? 'cms-dialog-container-wrapper-show' : '',
  ].filter(Boolean);
});

const moveStop = () => {
  // 阻止滚动穿透
};

const handleClose = () => {
  isShow.value = false;
};
</script>

<style lang="scss">
.cms-dialog-container-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 999;

  .cms-dialog-container-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 1;
  }

  .cms-dialog-container-flex {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    //
  }

  .cms-dialog-container-content {
    position: relative;
    z-index: 2;
    max-height: 50vh;
    width: 75vw;
  }

  .cms-dialog-container-close-btn {
    color: white;
    margin-bottom: 28rpx;
    position: relative;
    z-index: 3;
    opacity: 0.7;
  }

  &:not(.cms-dialog-container-wrapper-show) {
    opacity: 0;
    pointer-events: none;
  }
}
</style>
