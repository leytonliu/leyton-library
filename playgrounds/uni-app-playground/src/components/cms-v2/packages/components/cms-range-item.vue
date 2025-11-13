<template>
  <view
    :style="{
      position: 'absolute',
      top: data.readonlyData.top + '%',
      left: data.readonlyData.left + '%',
      height: data.readonlyData.height + '%',
      width: data.readonlyData.width + '%',
    }"
  >
    <view :class="classes" :data-component="data.componentCode" :style="styles" @tap="handleTapBaseContainer" />
  </view>
</template>

<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';

  /**
   * 热区子元素
   * @author  韦胜健
   * @date    2022/9/19 21:02
   */
  export default {
    name: 'CmsRangeItem',
    mixins: [CmsComponentMixin],
    methods: {
      adjustStyles(styles) {
        styles.height = '100%';
        styles.width = '100%';
      },
    },
  };
</script>

<style lang="scss">
  .cms-range-item {
  }
</style>
