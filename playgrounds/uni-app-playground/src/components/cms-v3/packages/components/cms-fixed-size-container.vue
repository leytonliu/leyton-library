<template>
  <view :class="classes" :data-component="data.componentCode" :style="styles" @tap="handleTapBaseContainer">
    <view class="cms-visual-editor-fixed-size-container">
      <cms-base-component v-for="(item, index) in data.childrenData" :key="item.componentId" :data="item" :index="index" />
    </view>
  </view>
</template>

<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';

  /**
   * 固定容器组件，适配父节点的宽高，使得内容的大小不能超出这个宽高以避免撑开父节点宽高的问题
   * @author  韦胜健
   * @date    2022/9/19 20:56
   */
  export default {
    name: 'CmsFixedSizeContainer',
    mixins: [CmsComponentMixin],
  };
</script>

<style lang="scss">
  .cms-visual-editor-fixed-size-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    & > .cms-visual-editor-base-container {
      height: 100%;
      width: 100%;

      &.cms-rows-container {
        display: flex !important;
        flex-direction: column;

        ::v-deep & > .cms-visual-editor-base-container {
          flex: 1;
          overflow: hidden;
        }
      }
    }
  }
</style>
