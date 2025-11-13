import { kebabCase, convertStyleToString } from '@/utils/utils';
import { createAutoGetRect } from '@/components/cms/packages/utils/createAutoGetRect';
import { mapState } from 'vuex';
import exposureTrackMixin from '@/mixin/track/exposureTrackMixin';

/**
 * BaseComponent以及其他cms组件的共同混入逻辑
 * @author  韦胜健
 * @date    2022/9/20 9:32
 */
export const CmsComponentMixin = {
  mixins: [exposureTrackMixin],
  options: {
    styleIsolation: 'shared', // 解除自定义组件的样式隔离
    virtualHost: true, // 启用虚拟的宿主节点，以避免实体宿主节点影响样式布局
  },
  inject: {
    cmsPageData: {}, // 注入页面数据
    bindingValue: {}, // 注入绑定值管理对象
    actionRender: {}, // 注入动作配置管理对象
    stateProvider: {}, // 注入cms-preview范围内共享的状态
    env: {},
    statusBarHeight: { default: 0 },
    isProvideHidden: { default: null },
  },
  props: {
    data: { type: Object, required: true }, // 节点数据
    index: { type: Number, required: true }, // 节点数据在数组中的索引
    childrenStyles: {}, // 父节点设置子节点（当前节点的）样式
    autoGetRect: { type: String }, // 父组件是否需要当前子节点自动获取高度
    isFirstFloorNode: { type: Boolean, default: false }, // 是否是第一层节点
    isHidden: { type: Boolean, default: null }, // 节点是否隐藏
  },
  provide() {
    return { isProvideHidden: () => this.isComputedHidden };
  },
  data() {
    return {};
  },
  created() {
    if (!this.isBaseComponent) {
      if (this.data.anchorTitle) {
        const effects = [];
        const clearEffects = () => effects.forEach((i) => i());
        this.$watch(
          () => this.isComputedHidden,
          async (hidden, oldVal) => {
            if (hidden === oldVal) {
              return;
            }
            /*不论如何将上次添加锚点的副作用移除*/
            clearEffects();
            if (hidden) {
              return;
            }
            /*这里等待一个时间片之后再执行，确保执行的时候已经处理过移除动作*/
            if (typeof wx !== 'undefined') {
              await new Promise((resolve) => wx.nextTick(() => resolve()));
            } else {
              await new Promise((resolve) => setTimeout(() => resolve()));
            }
            const anchorListState = this.stateProvider.getStateHandler('anchorList');
            const currentValue = [...anchorListState.getValue()];
            const anchorInfo = { componentId: this.data.componentId, anchorTitle: this.data.anchorTitle, seq: currentValue.length + 1, getContext: () => this };
            anchorListState.setValue([...currentValue, anchorInfo]);

            /*副作用，移除本次添加的锚点标题*/
            effects.push(() => {
              const currentValue = [...anchorListState.getValue()];
              const index = currentValue.findIndex((i) => (i.componentId = anchorInfo.componentId));
              if (index > -1) {
                currentValue.splice(index, 1);
                anchorListState.setValue(currentValue);
              }
            });
          },
          { immediate: true },
        );

        /*组件销毁的时候清理副作用*/
        this.$on('hook:beforeDestroy', () => clearEffects());
      }
    }
  },
  computed: {
    ...mapState(['activeTabbar']),
    ...mapState(['activeMallTabbar']),
    /**
     * 当前节点 base container样式
     * @author  韦胜健
     * @date    2022/9/20 9:28
     */
    styleObject() {
      let styles = {};

      // 如果父节点有设置子节点样式，则应用父节点设置的子节点样式
      if (this.childrenStyles) {
        Object.assign(styles, this.childrenStyles);
      }

      // 如果子节点自己有设置样式，则以子节点设置的为准，某些外边距
      if (this.data.style) {
        Object.assign(styles, this.data.style);
      }

      if (styles.backgroundImage) {
        styles.backgroundImage = `url('${styles.backgroundImage}')`;
      }

      // 如果有设置宽度，则弹性放大以及压缩都为0，表示不放大以及压缩
      if (styles.width) {
        styles.flex = '0 0 auto';
      }

      // 如果某个子组件有配置adjustStyles函数，则调用这个函数调整base container的样式
      if (this.adjustStyles) {
        styles = this.adjustStyles(styles) || styles;
      }
      return styles;
    },
    styles() {
      /*style属性仅支持绑定字符串形式的内联样式*/
      return convertStyleToString(this.styleObject);
    },
    /**
     * base  container的样式类名
     * @author  韦胜健
     * @date    2022/9/20 9:29
     */
    classes() {
      return [kebabCase(this.$options.name), 'cms-visual-editor-base-container', this.data.componentId].filter(Boolean);
    },
    /**
     * 当前是否为base component, base component中覆盖实现这个计算属性，用来在mixin中区分当前是具体的cms组件还是base component
     * @author  韦胜健
     * @date    2022/9/20 9:29
     */
    isBaseComponent() {
      return false;
    },
    /**
     * 判断当前是否已经隐藏，某些容器会隐藏子组件，此时子组件需要做一些处理动作
     * @author  韦胜健
     * @date    2023/12/21 14:30
     */
    isComputedHidden() {
      return this.isHidden != null ? this.isHidden : this.isProvideHidden != null ? this.isProvideHidden() : null;
    },
  },
  watch: {
    async activeTabbar(val) {
      if (val === 'home' && this.$Route.name === 'index') {
        await this.getRect();
      }
    },
  },
  methods: {
    /**
     * 获取绑定值
     * @author  韦胜健
     * @date    2022/9/20 9:30
     */
    getBindingValue(value) {
      return this.bindingValue.getBindingValue(value, this.data);
    },
    /**
     * 处理点击base container的点击动作
     * @author  韦胜健
     * @date    2022/9/20 9:30
     */
    handleTapBaseContainer() {
      this.actionRender.handleTapBaseContainer(this.data);
    },

    /*
     * @Description: 立即获取高度拿不到真实高度，图片可能没有加载完毕
     * @Author: sunliu
     * @Date: 2023-06-16 16:44:03
     */
    async getRect() {
      if (!!this.autoGetRect && !this.isBaseComponent) {
        /*如果当前节点cms组件有实现queryRectPrepare这个dfd对象，则等待这个任务完成之后再读取高度（比如当前是图片组件的话，需要等图片组件加载完毕之后再读取高度）*/
        if (this.queryRectPrepare) {
          await this.queryRectPrepare.promise;
        }
        setTimeout(() => {
          this.createSelectorQuery()
            .select('.cms-visual-editor-base-container')
            .boundingClientRect()
            .exec((res) => {
              if (res[0].height) {
                createAutoGetRect.rect(this.autoGetRect, res[0]);
              }
            });
        }, 300);
      }
    },
  },

  async mounted() {
    await this.getRect();
  },
};
