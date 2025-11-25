<template>
  <view
    v-if="displayChildren.length"
    :class="classes"
    :data-component="data.componentCode"
    :style="styles"
    @tap="handleTapBaseContainer"
  >
    <swiper
      :current="activeIndex"
      :previous-margin="data.data.scaleMode ? data.data.prevMargin : String(0)"
      :next-margin="data.data.scaleMode ? data.data.nextMargin : String(0)"
      :autoplay="data.data.autoplay"
      :circular="data.data.loop"
      :style="swiperStyles"
      @change="swiperChange"
    >
      <swiper-item
        v-for="(item, index) in displayChildren"
        :key="item.componentId"
      >
        <view
          :class="[
            'swiper-item',
            activeIndex === index
              ? 'swiper-item-active'
              : `swiper-item-default`,
            data.data.scaleMode && 'scale-mode',
            index === prevIndex && 'transform-right',
            index === nextIndex && 'transform-left',
          ]"
        >
          <cms-base-component
            :children-styles="carouselChildrenStyles"
            :data="item"
            :index="index"
          />
        </view>
      </swiper-item>
    </swiper>

    <view
      v-if="data.data.paginationType === '2'"
      class="indicator-outer"
      :style="{
        backgroundColor: data.data.inActiveColor,
        bottom: `${data.data.marginBottom * 2}rpx`,
      }"
    >
      <view
        class="indicator-inner"
        :style="{
          width: `${indicatorWidth}%`,
          marginLeft: `${indicatorLeft}%`,
          backgroundColor: data.data.activeColor,
        }"
      ></view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { CmsBaseComponentProps } from '../../cms';
import { cmsBaseComponentDefaults } from '../utils/constants';
import useCmsComponent from '../hooks/useCmsComponent';
import cmsBaseComponent from '../cms-base-component.vue';
import { computed, CSSProperties, ref } from 'vue';
import { convertStyleToString } from '../utils/utils';
import { useAdaptiveHeight } from '../hooks/useAdaptiveHeight';
import { checkComponentVisible } from '../utils/cmsUtils';

defineOptions({
  name: 'CmsCarouselContainer',
});

const props = withDefaults(defineProps<CmsBaseComponentProps>(), {
  ...cmsBaseComponentDefaults,
});

const { classes, styles, handleTapBaseContainer, bindingValue } =
  useCmsComponent(props);

const activeIndex = ref<number>(0);

const { maxHeight, childrenHeights } = useAdaptiveHeight();

const swiperStyles = computed(() => {
  const style: CSSProperties = {};
  if (props.data.data.height) {
    style.height = `${props.data.data.height * 2}rpx`;
  } else if (maxHeight.value != null) {
    style.height = `${maxHeight.value}px`;
  } else {
    style.height = '100vw';
  }
  // 轮播如果配置圆角，则在swiper组件上加上圆角属性
  if (props.data.style.borderRadius) {
    style.borderRadius = props.data.style.borderRadius;
    style.overflow = 'hidden';
  }

  return convertStyleToString(style);
});

const prevIndex = computed(() => {
  return activeIndex.value === 0
    ? props.data.data.carouselNum - 1
    : activeIndex.value - 1;
});

const nextIndex = computed(() => {
  return activeIndex.value === props.data.data.carouselNum - 1
    ? 0
    : activeIndex.value + 1;
});
const carouselChildrenStyles = computed(() => {
  /*当读取到最大高度的时候，就设置每个子节点容器高度为100%*/
  return maxHeight.value == null ? {} : { height: '100%' };
});

/**
 * 过滤处理可以展示的 swiper-item
 */
const displayChildren = computed(() => {
  if (!props.data.childrenData) return [];

  return props.data.childrenData?.filter((child) => {
    return checkComponentVisible(child, bindingValue);
  });
});
/**
 * indicator Width
 */
const indicatorWidth = computed(() => {
  return (1 / displayChildren.value.length) * 100;
});

const indicatorLeft = computed(() => {
  return activeIndex.value * (1 / displayChildren.value.length) * 100;
});

const swiperChange = ({ detail: { current, source } }: any) => {
  if (source === 'autoplay' || source === 'touch') {
    activeIndex.value = current;
  }
};
</script>

<style lang="scss">
.cms-carousel-container {
  .indicator-outer {
    width: 420rpx;
    margin: 0 auto;
    height: 2rpx;
    position: absolute;
    z-index: 5;
    left: 50%;
    margin-left: -210rpx;

    .indicator-inner {
      height: 2rpx;
      transition: all 0.5s;
    }
  }

  .scale-mode.swiper-item-default {
    transform: scale(0.88);
  }
  .transform-left {
    transform-origin: left;
  }
  .transform-right {
    transform-origin: right;
  }
  .scale-mode.swiper-item {
    transition: transform 0.3s;
  }
}
</style>
