<template>
  <view :class="classes" :data-component="data.componentCode" :style="styles" @tap="handleTapBaseContainer">
    <cms-base-component v-for="(item, index) in data.childrenData" :key="item.componentId" :auto-get-rect="autoGetRectId" :data="item" :index="index" />
  </view>
</template>

<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  import { createAutoGetRect } from '@/components/cms/packages/utils/createAutoGetRect';

  export default {
    name: 'CmsStickyContainer',
    mixins: [CmsComponentMixin],
    data() {
      let maxHeight = 0; // 保存子节点返回的高度中最大的一个
      let count = 0; // 计数，判断子节点是否已经全部返回高度

      const { id, clear } = createAutoGetRect.create((rect) => {
        count++;
        const height = rect?.height || 0;
        if (maxHeight < height) {
          maxHeight = height;
        }
        if (count === this.data.childrenData.length) {
          /*子节点计数完毕，应用最大高度实现自适应高度的效果*/
          this.maxHeight = maxHeight;
          clear();
        }
      });

      return {
        maxHeight: null,
        autoGetRectId: id,
        stickyStyles: {},
      };
    },

    beforeCreate() {
      /*
       * @Description: 监听事件，如果页面中：
       * 1. 不存在永久吸顶容器，那所有 sticky-container 都正常显示
       * 2. 存在永久吸顶容器，那其后所有的sticky-container的 top 值都要加上永久吸顶容器的高度
       * @Author: sunliu
       * @Date: 2022-11-04 17:02:35
       */
      uni.$on('hasFixedContainer', ({ height }) => {
        if (!this.isFirstFloorNode) {
          this.stickyStyles = {
            zIndex: 4,
            top: `calc(${(this.env.fixedTopHeight + this.env.navHeight + height) * 2}rpx + ${this.statusBarHeight}px)`,
          };
        } else {
          this.stickyStyles = {
            zIndex: 6,
            top: `calc(${(this.env.fixedTopHeight + this.env.navHeight) * 2}rpx + ${this.statusBarHeight}px)`,
          };
        }
      });
    },

    watch: {
      maxHeight: {
        handler: function (value) {
          /*
           * @Description: 获取自身，并存储到env的stickyContainer数组中
           * @Author: sunliu
           * @Date: 2022-10-25 20:55:45
           */
          const node = { node: this.data, height: value, isFirstFloorNode: this.isFirstFloorNode };
          this.env.stickyContainer.push(node);

          // 页面中是否存在永久吸顶容器，位置一定是第一个的
          const hasFixedContainer = this.env.stickyContainer.find((i) => i.isFirstFloorNode);

          // 存在的话，派发事件，因为如果吸顶容器中存在图片，图片需要在load完成以后才会拿到height,它push的时机不一定是对的，即它在数组中的位置不一定是 0
          if (hasFixedContainer) {
            uni.$emit('hasFixedContainer', hasFixedContainer);
          }
        },
      },
    },

    methods: {
      adjustStyles(styles) {
        styles.position = 'sticky';
        styles.zIndex = this.stickyStyles.zIndex;
        styles.top = this.stickyStyles.top;
      },
    },

    destroyed() {
      uni.$off('hasFixedContainer');
    },
  };
</script>

<style lang="scss">
  .cms-sticky-container {
    width: 100%;

    & > .cms-visual-editor-base-container {
      flex: 1;
    }
  }
</style>
