import { createAutoGetRect } from '@/components/cms/packages/utils/createAutoGetRect';

export const ImageMixin = {
  // options: {
  //   styleIsolation: 'shared', // 解除自定义组件的样式隔离
  //   virtualHost: true, // 启用虚拟的宿主节点，以避免实体宿主节点影响样式布局
  // },
  props: {
    autoGetRect: { type: String }, // 是否需要计算高度
    computedClassName: { type: String }, // 需要计算高度的类名
  },
  data() {
    return {};
  },
  methods: {
    /*
     * @Description: 计算图片高度
     * @Author: wanghuanhuan
     * @Date: 2023-12-11  17:46:16
     */
    async getRect() {
      if (this.autoGetRect) {
        if (this.queryRectPrepare) {
          await this.queryRectPrepare.promise;
        }
        this.createSelectorQuery()
          .select(this.computedClassName)
          .boundingClientRect()
          .exec((res) => {
            if (res && res[0] && res[0].height) {
              createAutoGetRect.rect(this.autoGetRect, res[0]);
            }
          });
      }
    },
  },

  async mounted() {
    await this.getRect();
  },
};
