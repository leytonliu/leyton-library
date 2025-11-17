<template>
  <view
    class="cms-card-stack-container"
    :style="{ height: `${(height || 411) * 2 + 32 * 2}rpx` }"
  >
    <view
      class="cms-card-stack-items"
      :style="{ width: `${(width || 301) * 2}rpx` }"
    >
      <view
        v-for="(itemData, index) in stackedChildrenData"
        :key="itemData.index + '_' + index"
        class="cms-card-stack-item"
        :class="childrenClasses[index]"
        :style="{ height: `${(height || 411) * 2}rpx` }"
        :data-index="index"
      >
        <cms-base-component
          :auto-get-rect="autoGetRect"
          :children-styles="childrenStyles"
          :data="itemData.item"
          :index="index"
        />
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed, ref, reactive } from 'vue';
import { CmsBaseComponentProps } from '../../cms';
import { cmsBaseComponentDefaults } from '../utils/constants';
import useCmsComponent from '../hooks/useCmsComponent';
import CmsBaseComponent from '../cms-base-component.vue';

// 常量定义
const SLIDE_NONE = 0;
const SLIDE_LEFT = 1;
const SLIDE_RIGHT = 2;
const HORIZONTAL = 102;

defineOptions({
  name: 'CmsCardStack',
});

const props = withDefaults(defineProps<CmsBaseComponentProps>(), {
  ...cmsBaseComponentDefaults,
});

// 使用 Hook
const { classes, styles } = useCmsComponent(props);

// --- 状态定义 ---
const sysInfo = uni.getSystemInfoSync();
const isIOS = sysInfo.platform === 'ios';

// 宽高配置 (优先取配置，否则取默认值)
const height = computed(() => props.data.data.height || 411);
const width = computed(() => props.data.data.width || 301);

const currentIndex = ref(0);
const touchEvent = reactive({
  x: 0,
  type: SLIDE_NONE,
  lastIndex: 0,
});

// --- 计算属性 ---

const cardNum = computed(() => props.data.data.cardNum || 0);

/**
 * 实际计算需要的卡片数量
 * 不满 5 张图片时，需要补充到 5 张以上以维持堆叠效果
 */
const realNum = computed(() => {
  const count = cardNum.value;
  if (count === 1) return 5;
  if (count === 2 || count === 3) return 6;
  if (count === 4) return 8;
  return count;
});

/**
 * 填充后的子组件数据
 */
const stackedChildrenData = computed(() => {
  const items = props.data.childrenData || [];
  const count = cardNum.value;

  // 1. 初始映射：添加 parentComponentCode
  const tempItems = items.map((item, index) => ({
    item: {
      ...item,
      parentComponentCode: 'card-stack',
    },
    index,
  }));

  // 2. 如果数据少于 cardNum (理论不应发生，但也做个兜底)，补空
  if (tempItems.length < count) {
    tempItems.push(
      ...Array(count - tempItems.length)
        .fill(null)
        .map((_, i) => ({ item: {} as any, index: tempItems.length + i }))
    );
  }

  // 3. 根据数量复制填充，构造无限循环的假象
  if (!tempItems.length || tempItems.length > 4) {
    return tempItems;
  } else if (tempItems.length === 1) {
    return Array(5).fill(tempItems[0]);
  } else if (tempItems.length === 2) {
    // 2张变成6张
    return [...tempItems, ...tempItems, ...tempItems];
  } else {
    // 3或4张翻倍
    return [...tempItems, ...tempItems];
  }
});

/**
 * 计算每个卡片的类名 (核心堆叠逻辑)
 */
const childrenClasses = computed(() => {
  const current = currentIndex.value;
  const rNum = realNum.value;

  // 环形计算辅助函数
  const plus = (num: number) => (num + 1 >= rNum ? num + 1 - rNum : num + 1);

  // 计算关键位置的索引
  const prev = current - 1 < 0 ? current - 1 + rNum : current - 1;
  const next1 = plus(current);
  const next2 = plus(next1);
  const next3 = plus(next2);

  return stackedChildrenData.value.map((_, index) => {
    if (index === current) return ['cms-card-stack-item-current'];
    if (index === next1) return ['cms-card-stack-item-next'];
    if (index === next2) return ['cms-card-stack-item-next-2'];
    if (index === next3) return ['cms-card-stack-item-next-3'];
    if (index === prev) return ['cms-card-stack-item-prev'];

    // 其他未显示的卡片
    return index < current
      ? ['cms-card-stack-item-prev']
      : ['cms-card-stack-item-next-3'];
  });
});

// --- 方法 ---

/** 上一张 */
const prevPage = (curr = currentIndex.value) => {
  const rNum = realNum.value;
  if (curr > 0) {
    currentIndex.value = curr - 1;
  } else {
    currentIndex.value = rNum - 1;
  }
};

/** 下一张 */
const nextPage = (curr = currentIndex.value) => {
  const rNum = realNum.value;
  if (curr < rNum - 1) {
    currentIndex.value = curr + 1;
  } else {
    currentIndex.value = 0;
  }
};

/** 返回第一张 (处理特殊的填充逻辑) */
const backToFirstPage = (curr = currentIndex.value) => {
  const cNum = cardNum.value;
  let i = 0;

  // 因为数据被复制了，所以视觉上的“第一张”可能在数组的中间
  switch (cNum) {
    case 4:
      i = curr < 4 ? 0 : 4;
      break;
    case 3:
      i = curr < 3 ? 0 : 3;
      break;
    case 2:
      i = curr % 2 === 1 ? curr - 1 : curr;
      break;
    case 1:
      i = curr;
      break;
    default:
      i = 0;
  }
  currentIndex.value = i;
};
</script>

<style lang="scss">
.cms-card-stack-container {
  width: 100%;
  .cms-card-stack-items {
    position: relative;
    height: 100%;
    margin: 0 auto;
    .cms-card-stack-item {
      position: absolute;
      left: 0;
      width: 100%;
      opacity: 0;
      transform-origin: top center;
      transform: rotate(0) scale(1);
      transition-duration: 0;
      pointer-events: none;
      overflow: hidden;

      &.cms-card-stack-item-prev {
        top: 18%;
        left: -75%;
        transform: rotate(-20deg) scale(0.93);
        transition-duration: 360ms;
        z-index: 9;
      }
      &.cms-card-stack-item-current {
        top: 64rpx;
        opacity: 1;
        transition-duration: 360ms;
        pointer-events: auto;
        z-index: 7;
      }
      &.cms-card-stack-item-next {
        top: 44rpx;
        opacity: 0.5;
        transform: rotate(0) scale(0.93);
        transition-duration: 360ms;
        z-index: 5;
      }
      &.cms-card-stack-item-next-2 {
        top: 24rpx;
        opacity: 0.25;
        transform: rotate(0) scale(0.86);
        transition-duration: 360ms;
        z-index: 3;
      }
      &.cms-card-stack-item-next-3 {
        top: 4rpx;
        z-index: 1;
      }
    }
  }
}
</style>
