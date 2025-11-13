<template>
  <view :class="classes" :data-component="data.componentCode" :style="styles">
    <rich-text :nodes="getBindingValue(data.data.html)" />
  </view>
</template>

<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';

  /**
   * 富文本
   * @author  韦胜健
   * @date    2022/9/19 21:02
   */
  export default {
    name: 'CmsRichText',
    mixins: [CmsComponentMixin],
  };
</script>

<style lang="scss"></style>
