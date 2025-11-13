<template>
  <view :class="classes" :data-component="data.componentCode" :style="styles">
    <cms-base-component v-for="(item, index) in data.childrenData" :key="item.componentId" :data="item" :index="index" />
  </view>
</template>

<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';

  /**
   * 热区容器
   * @author  韦胜健
   * @date    2022/9/19 21:02
   */
  export default {
    name: 'CmsRangeContainer',
    mixins: [CmsComponentMixin],
    methods: {
      adjustStyles(styles) {
        styles.position = 'absolute';
      },
    },
  };
</script>

<style lang="scss">
  .cms-range-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    user-select: none;
  }
</style>
