<template>
  <view
    :class="classes"
    :data-component="data.componentCode"
    :style="styles"
    @tap="handleTapBaseContainer"
  >
    <button :class="buttonClasses" :style="buttonStyles">
      {{ getBindingValue(data.data.text) }}
      <text v-if="!!data.data.arrow" class="iconfont icon-right" />
    </button>
  </view>
</template>

<script>
import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
import { convertStyleToString } from '@/components/cms/packages/utils/utils';

/**
 * 按钮组件
 * @author  韦胜健
 * @date    2022/9/19 20:55
 */
export default {
  name: 'CmsButton',
  mixins: [CmsComponentMixin],
  computed: {
    buttonClasses() {
      return [
        'cms-button',
        `cms-button-size-${this.data.data.size}`,
        `cms-button-mode-${this.data.data.mode}`,
      ];
    },
    buttonStyles() {
      return convertStyleToString({ width: this.data.data.width });
    },
  },
};
</script>

<style lang="scss">
.cms-button {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background-color: transparent;
  border-radius: 0;

  /*---------------------------------------reset-------------------------------------------*/

  &::after {
    border: none;
  }

  &.empty.plain {
    border: none transparent;
  }

  &.cms-button-mode-light {
    border: solid 1px black;
    background-color: white;
    color: black;

    //&:hover,
    &:active {
      background-color: whitesmoke;
    }
  }

  &.cms-button-mode-dark {
    border: solid 1px black;
    background-color: black;
    color: white;

    //&:hover,
    &:active {
      background-color: dimgray;
    }
  }

  &.cms-button-size-large {
    font-size: 18px;
    height: 48px;
    padding: 0 16px;
  }

  &.cms-button-size-normal {
    font-size: 16px;
    height: 36px;
    padding: 0 12px;
  }

  &.cms-button-size-small {
    font-size: 14px;
    height: 24px;
    padding: 0 8px;
  }
}
</style>
