<template>
  <CmsImage v-if="data.componentCode === 'image'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsColumnContainer v-else-if="data.componentCode === 'column-container'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsRowsContainer v-else-if="data.componentCode === 'rows-container'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsButton v-else-if="data.componentCode === 'button'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsText v-else-if="data.componentCode === 'text'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsFixedSizeContainer v-else-if="data.componentCode === 'fixed-size-container'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsRichText v-else-if="data.componentCode === 'rich-text'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsGridContainer v-else-if="data.componentCode === 'grid-container'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsCarouselContainer v-else-if="data.componentCode === 'carousel-container'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsSquareContainer v-else-if="data.componentCode === 'square-container'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsRollText v-else-if="data.componentCode === 'roll-text'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsVideo v-else-if="data.componentCode === 'video'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsRangeContainer v-else-if="data.componentCode === 'range-container'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsRangeItem v-else-if="data.componentCode === 'range-item'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsProductList v-else-if="data.componentCode === 'product-list'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsAllCourseList v-else-if="data.componentCode === 'all-course-list'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsTabContainer v-else-if="data.componentCode === 'tab-container'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsTabs v-else-if="data.componentCode === 'tabs'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsVerticalTabContainer v-else-if="data.componentCode === 'vertical-tab-container'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsStickyContainer v-else-if="data.componentCode === 'sticky-container'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" :is-first-floor-node="isFirstFloorNode" />
  <CmsPlaceholderProductChange v-else-if="data.componentCode === 'placeholder-product-change'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsAnchorBar v-else-if="data.componentCode === 'anchor-bar'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" :is-first-floor-node="isFirstFloorNode" />
  <CmsDialogContainer v-else-if="data.componentCode === 'dialog-container'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" :is-first-floor-node="isFirstFloorNode" />
  <CmsSpecialColumnList v-else-if="data.componentCode === 'special-column-list'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsCardStack v-else-if="data.componentCode === 'card-stack'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsGraphicSlide v-else-if="data.componentCode === 'graphic-slide'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsStoreSwitch v-else-if="data.componentCode === 'store-switch'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsPlaceHolder v-else-if="data.componentCode === 'placeholder-component'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsContainerGroups v-else-if="data.componentCode === 'container-groups'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsPointPlaceholder v-else-if="data.componentCode === 'point-placeholder-component'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsPointSignPlaceholder v-else-if="data.componentCode === 'point-sign-placeholder-component'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsPointProductList v-else-if="data.componentCode === 'point-product-list'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsPointTabs v-else-if="data.componentCode === 'point-list-tabs'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <view v-else-if="!!data">{{ intl('b2c.component.cms.unFinished').d(`未完成组件：`) }}{{ data.componentCode }}</view>
</template>

<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  import CmsImage from '@/components/cms/packages/components/cms-image';
  import CmsColumnContainer from '@/components/cms/packages/components/cms-column-container';
  import CmsRowsContainer from '@/components/cms/packages/components/cms-rows-container';
  import CmsButton from '@/components/cms/packages/components/cms-button';
  import CmsText from '@/components/cms/packages/components/cms-text';
  import CmsFixedSizeContainer from '@/components/cms/packages/components/cms-fixed-size-container';
  import CmsRichText from '@/components/cms/packages/components/cms-rich-text';
  import CmsGridContainer from '@/components/cms/packages/components/cms-grid-container';
  import CmsCarouselContainer from '@/components/cms/packages/components/cms-carousel-container';
  import CmsSquareContainer from '@/components/cms/packages/components/cms-square-contaienr';
  import CmsRollText from '@/components/cms/packages/components/cms-roll-text';
  import CmsVideo from '@/components/cms/packages/components/cms-video';
  import CmsRangeContainer from '@/components/cms/packages/components/cms-range-container';
  import CmsRangeItem from '@/components/cms/packages/components/cms-range-item';
  import CmsProductList from '@/components/cms/packages/components/cms-product-list';
  import CmsTabContainer from '@/components/cms/packages/components/cms-tab-container';
  import CmsTabs from '@/components/cms/packages/components/cms-tabs';
  import CmsVerticalTabContainer from '@/components/cms/packages/components/cms-vertical-tab-container';
  import CmsStickyContainer from '@/components/cms/packages/components/cms-sticky-container';
  import CmsPlaceholderProductChange from '@/components/cms/packages/components/cms-placeholder-product-change';
  import CmsAnchorBar from '@/components/cms/packages/components/cms-anchor-bar';
  import CmsSpecialColumnList from '@/components/cms/packages/components/cms-special-column-list';
  import CmsDialogContainer from '@/components/cms/packages/components/cms-dialog-container.vue';
  import CmsCardStack from '@/components/cms/packages/components/cms-card-stack.vue';
  import CmsGraphicSlide from '@/components/cms/packages/components/cms-graphic-slide.vue';
  import CmsPlaceHolder from '@/components/cms/packages/components/cms-placeholder';
  import CmsStoreSwitch from './components/cms-store-switch.vue';
  import CmsContainerGroups from '@/components/cms/packages/components/cms-container-groups';
  import CmsPointPlaceholder from '@/components/cms/packages/components/cms-point-placeholder.vue';
  import CmsPointSignPlaceholder from '@/components/cms/packages/components/cms-point-sign-placeholder.vue';
  import CmsAllCourseList from '@/components/cms/packages/components/cms-all-course-list';
  import CmsPointProductList from '@/components/cms/packages/components/cms-point-product-list.vue';
  import CmsPointTabs from '@/components/cms/packages/components/cms-point-tabs.vue';

  /**
   * 基础组件，负责根据节点数据的componentCode判断渲染哪一个cms组件
   * @author  韦胜健
   * @date    2022/9/20 9:39
   */
  export default {
    name: 'CmsBaseComponent',
    components: {
      CmsPointSignPlaceholder,
      CmsPointPlaceholder,
      CmsContainerGroups,
      CmsPlaceHolder,
      CmsPlaceholderProductChange,
      CmsVerticalTabContainer,
      CmsTabContainer,
      CmsProductList,
      CmsRangeItem,
      CmsRangeContainer,
      CmsVideo,
      CmsRollText,
      CmsSquareContainer,
      CmsCarouselContainer,
      CmsGridContainer,
      CmsRichText,
      CmsFixedSizeContainer,
      CmsText,
      CmsButton,
      CmsRowsContainer,
      CmsColumnContainer,
      CmsImage,
      CmsTabs,
      CmsStickyContainer,
      CmsAnchorBar,
      CmsSpecialColumnList,
      CmsDialogContainer,
      CmsCardStack,
      CmsGraphicSlide,
      CmsStoreSwitch,
      CmsAllCourseList,
      CmsPointProductList,
      CmsPointTabs,
    },
    props: {
      provides: Object,
    },
    provide() {
      const provides = this.provides || {};
      return {
        ...provides,
      };
    },
    mixins: [CmsComponentMixin],
    computed: {
      /*标记当前mixin为base component*/
      isBaseComponent() {
        return true;
      },
    },
  };
</script>

<style lang="scss">
  .cms-visual-editor-base-container {
    box-sizing: border-box;
    position: relative;
    display: block;
  }

  [data-component='image'] [data-component='fixed-size-container'] {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  [data-component='square-container'] {
    .square-container-inner > .cms-visual-editor-base-container {
      width: 100%;
      height: 100%;
    }
  }
</style>
