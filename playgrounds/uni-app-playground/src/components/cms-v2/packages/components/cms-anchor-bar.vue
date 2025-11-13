<template>
  <view :class="classes" :data-component="data.componentCode" :style="styles" @tap="handleTapBaseContainer">
    <scroll-view scroll-x width="100vw" :scroll-into-view="scrollIntoView" scroll-with-animation>
      <view class="cms-anchor-bar-item-list">
        <view v-for="(item, index) in anchorListState.getValue()" :key="item.componentId" :id="item.componentId" class="cms-anchor-bar-item-wrapper" :style="wrapperStyles" @click="handleTapAnchor(item)">
          <view class="cms-anchor-bar-item-inner" :style="(!activeComponentId ? index === 0 : item.componentId === activeComponentId) ? innerStyles.activeStyles : innerStyles.inactiveStyles">
            {{ item.anchorTitle }}
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  import { convertStyleToString } from '@/utils/utils';
  import { throttle } from '@/components/cms/packages/utils/throttle';
  import { trackCmsAnchorClick } from '@/components/cms/packages/utils/cmsTrackers';

  export default {
    name: 'CmsAnchorBar',
    mixins: [CmsComponentMixin],
    inject: {
      pageScrollEvent: {},
    },
    data() {
      const anchorListState = this.stateProvider.getStateHandler('anchorList');
      const navigationTopSize = Number(uni.getSystemInfoSync().statusBarHeight) + 44;

      return {
        activeComponentId: null,
        anchorListState,
        stickyStyles: {},
        scrollIntoView: null,
        navigationTopSize,
        stopHandlePageScroll: false,
        getAnchorTopData: async () => {
          const anchorList = anchorListState.getValue();
          const pageRect = await new Promise((resolve, reject) => {
            wx.createSelectorQuery()
              .select('.cms-page')
              .boundingClientRect()
              .exec((res) => {
                if (res[0]) {
                  resolve(res[0]);
                } else {
                  reject(`query .cms-page boundingClientRect failed!`);
                }
              });
          });
          const anchorBarHeight = await new Promise((resolve, reject) => {
            this.createSelectorQuery()
              .select('.cms-visual-editor-base-container')
              .boundingClientRect()
              .exec((res) => {
                if (res[0]) {
                  resolve(res[0].height);
                } else {
                  reject(`query anchor bar boundingClientRect failed!`);
                }
              });
          });
          const anchorTopData = await Promise.all(
            anchorList.map(async (anchorInfo) => {
              const top = await new Promise((resolve, reject) => {
                const that = anchorInfo.getContext();
                that
                  .createSelectorQuery()
                  .select('.cms-visual-editor-base-container')
                  .boundingClientRect()
                  .exec((res) => {
                    if (res[0]) {
                      resolve(res[0].top);
                    } else {
                      reject(`query ${anchorInfo.anchorTitle} boundingClientRect failed!`);
                    }
                  });
              });
              return {
                ...anchorInfo,
                offsetTop: Number((top - pageRect.top).toFixed(0)),
              };
            }),
          );
          return { anchorTopData, pageRect, anchorBarHeight };
        },
        handlePageScroll: throttle(async (e) => {
          if (this.stopHandlePageScroll) {
            return;
          }
          const { anchorTopData, anchorBarHeight } = await this.getAnchorTopData();
          let scrollTop = e.scrollTop + anchorBarHeight + this.navigationTopSize;
          const rangeData = anchorTopData.map((i, index) => {
            const nextItem = anchorTopData[index + 1];
            return {
              ...i,
              start: index === 0 ? -Infinity : i.offsetTop,
              end: nextItem ? nextItem.offsetTop : Infinity,
            };
          });
          const active = rangeData.find((i) => scrollTop >= i.start && scrollTop <= i.end);
          if (!!active && this.activeComponentId !== active.componentId) {
            await this.execScroll({
              scrollVertical: false,
              scrollHorizontal: true,
              componentId: active.componentId,
              anchorTopData,
            });
          }
        }, 100),
      };
    },
    computed: {
      wrapperStyles() {
        return convertStyleToString({
          width: Number((100 / this.data.data.textShowNum).toFixed(2)) + 'vw',
        });
      },
      innerStyles() {
        const publicStyles = {
          lineHeight: this.data.data.textLineHeight,
          fontSize: this.data.data.textFontSize,
          borderRadius: this.data.data.textBorderRadius,
          paddingLeft: this.data.data.textPaddingX,
          paddingRight: this.data.data.textPaddingX,
        };

        const activeStyles = {
          ...publicStyles,
          backgroundColor: this.data.data.textBackgroundActive,
          color: this.data.data.textColorActive,
        };
        const inactiveStyles = {
          ...publicStyles,
          backgroundColor: this.data.data.textBackgroundInactive,
          color: this.data.data.textColorInactive,
        };

        return { activeStyles: convertStyleToString(activeStyles), inactiveStyles: convertStyleToString(inactiveStyles) };
      },
    },
    created() {
      this.stickyStyles = {
        zIndex: 1,
        top: `calc(${uni.getSystemInfoSync().statusBarHeight}px + 44px)`,
      };
      this.pageScrollEvent.on(this, this.handlePageScroll);

      /**
       * 当页面中的锚点数据变化时，检查 activeComponentId 是否已经消失，是的话就重置为第一个锚点
       * @author  韦胜健
       * @date    2023/12/21 14:29
       */
      this.$watch(
        () => this.anchorListState.getValue(),
        (list) => {
          if (!list.find((item) => item.componentId === this.activeComponentId)) {
            this.activeComponentId = !list[0] ? undefined : list[0].componentId;
          }
        },
      );
    },
    methods: {
      adjustStyles(styles) {
        styles.position = 'sticky';
        styles.zIndex = this.stickyStyles.zIndex;
        styles.top = this.stickyStyles.top;
      },
      async execScroll({ scrollVertical, scrollHorizontal, componentId, anchorTopData }) {
        if (!anchorTopData) {
          anchorTopData = (await this.getAnchorTopData()).anchorTopData;
        }
        if (scrollHorizontal) {
          this.activeComponentId = componentId;
          this.scrollIntoView = (() => {
            const index = anchorTopData.findIndex((i) => i.componentId === componentId);
            const showComponentId = anchorTopData[Math.max(0, Math.min(index - 1, anchorTopData.length - 3))].componentId;
            return `#${showComponentId}`;
          })();
        }
        if (scrollVertical) {
          this.activeComponentId = componentId;
          const anchorTopItem = anchorTopData.find((i) => i.componentId === componentId);
          uni.pageScrollTo({
            scrollTop: anchorTopItem.offsetTop - 52 - this.navigationTopSize,
            duration: 500,
          });
          this.stopHandlePageScroll = true;
          setTimeout(() => {
            this.stopHandlePageScroll = false;
          }, 700);
        }
      },
      handleTapAnchor(anchorItem) {
        // 埋点-锚点点击
        trackCmsAnchorClick({ componentId: anchorItem.componentId, anchorTitle: anchorItem.anchorTitle });
        this.execScroll({ scrollVertical: true, scrollHorizontal: true, componentId: anchorItem.componentId });
      },
    },
  };
</script>
<style lang="scss">
  .cms-anchor-bar {
    width: 100vw;
    overflow: hidden;
    padding: 12px 0;

    .cms-anchor-bar-item-list {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
    }

    .cms-anchor-bar-item-wrapper {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .cms-anchor-bar-item-inner {
    }
  }
</style>
