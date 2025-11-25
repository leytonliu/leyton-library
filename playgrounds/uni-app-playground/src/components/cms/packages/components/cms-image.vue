<template>
  <view
    :class="classes"
    :data-component="data.componentCode"
    :style="styles"
    @tap="handleTapBaseContainer"
  >
    <image
      key="@@image"
      :mode="imageMode"
      :src="imageUrl"
      :style="imageStyle"
      :show-menu-by-longpress="data.data.saveFlag"
      class="cms-image-inner"
      @load="onImageLoad"
    />
    <template v-if="!isLoading && !!data.childrenData">
      <cms-base-component
        v-for="(item, index) in data.childrenData"
        :key="item.componentId"
        :data="item"
        :index="index"
      />
    </template>
  </view>
</template>

<script lang="ts" setup>
import { CmsBaseComponentProps } from '../../cms';
import { cmsBaseComponentDefaults } from '../utils/constants';
import useCmsComponent from '../hooks/useCmsComponent';
import { computed, CSSProperties, nextTick, ref } from 'vue';
import { convertStyleToString } from '../utils/utils';
import cmsBaseComponent from '../cms-base-component.vue';

defineOptions({
  name: 'CmsImage',
  options: {
    virtualHost: true,
    styleIsolation: 'shared',
  },
});

const props = withDefaults(defineProps<CmsBaseComponentProps>(), {
  ...cmsBaseComponentDefaults,
});

const {
  classes,
  styles,
  getBindingValue,
  handleTapBaseContainer,
  measureAndReportHeight,
} = useCmsComponent(props, { autoReportHeightOnMounted: false });

/**
 * 图片地址
 */
const imageUrl = computed(() => {
  return getBindingValue(props.data.data.url);
});
/**
 * 图片样式
 */
const imageStyle = computed(() => {
  let styles: CSSProperties = {
    display: 'block',
  };
  if (props.data.data.width) {
    styles.width = props.data.data.width;
  }
  if (props.data.style.borderRadius) {
    // 为图片自身设置圆角
    styles.borderRadius = props.data.style.borderRadius;
  }
  styles.height = props.data.data.height;

  return convertStyleToString(styles);
});
/**
 * 图片适应模式
 */
const imageMode = computed(() => {
  switch (props.data.data.objectFit) {
    case 'fill':
      if (
        !!props.data.data.width &&
        !!props.data.data.height &&
        props.data.data.height !== '100%'
      ) {
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
});

const isLoading = ref(true);

const onImageLoad = () => {
  isLoading.value = false;
  nextTick(() => {
    measureAndReportHeight();
  });
};
</script>

<style lang="scss">
.cms-image.cms-visual-editor-base-container {
  position: relative;
  display: flex;

  //   width: 100%;
  //   height: 100%;
  .cms-image-inner {
    align-self: center;
  }
}

image {
  will-change: transform;
}
</style>
