<template>
  <!-- <CmsImage v-if="data.componentCode === 'image'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsColumnContainer v-else-if="data.componentCode === 'column-container'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
  <CmsRowsContainer v-else-if="data.componentCode === 'rows-container'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" /> -->
  <!-- <CmsButton
    v-if="data.componentCode === 'button'"
    :key="data.componentId"
    :auto-get-rect="autoGetRect"
    :children-styles="childrenStyles"
    :data="data"
    :index="index"
  />
  <CmsText
    v-else-if="data.componentCode === 'text'"
    :key="data.componentId"
    :auto-get-rect="autoGetRect"
    :children-styles="childrenStyles"
    :data="data"
    :index="index"
  /> -->
  <!-- <CmsFixedSizeContainer v-else-if="data.componentCode === 'fixed-size-container'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" />
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
  <CmsPointTabs v-else-if="data.componentCode === 'point-list-tabs'" :key="data.componentId" :auto-get-rect="autoGetRect" :children-styles="childrenStyles" :data="data" :index="index" /> -->
  <!-- <view v-else-if="!!data"
    >{{ intl('b2c.component.cms.unFinished').d(`未完成组件：`)
    }}{{ data.componentCode }}</view
  > -->
  <view> ssssss </view>
</template>

<script setup>
import { computed, provide } from 'vue';
import { useCmsComponent } from '@/components/cms-v3/packages/utils/useCmsComponent';

// 组件导入（这些组件稍后需要逐个迁移）
// import CmsImage from '@/components/cms-v3/packages/components/cms-image.vue';
// import CmsColumnContainer from '@/components/cms-v3/packages/components/cms-column-container.vue';
// import CmsRowsContainer from '@/components/cms-v3/packages/components/cms-rows-container.vue';
import CmsButton from '@/components/cms-v3/packages/components/cms-button.vue';
import CmsText from '@/components/cms-v3/packages/components/cms-text.vue';
// import CmsFixedSizeContainer from '@/components/cms-v3/packages/components/cms-fixed-size-container.vue';
// import CmsRichText from '@/components/cms-v3/packages/components/cms-rich-text.vue';
// import CmsGridContainer from '@/components/cms-v3/packages/components/cms-grid-container.vue';
// import CmsCarouselContainer from '@/components/cms-v3/packages/components/cms-carousel-container.vue';
// import CmsSquareContainer from '@/components/cms-v3/packages/components/cms-square-contaienr.vue';
// import CmsRollText from '@/components/cms-v3/packages/components/cms-roll-text.vue';
// import CmsVideo from '@/components/cms-v3/packages/components/cms-video.vue';
// import CmsRangeContainer from '@/components/cms-v3/packages/components/cms-range-container.vue';
// import CmsRangeItem from '@/components/cms-v3/packages/components/cms-range-item.vue';
// import CmsProductList from '@/components/cms-v3/packages/components/cms-product-list.vue';
// import CmsTabContainer from '@/components/cms-v3/packages/components/cms-tab-container.vue';
// import CmsTabs from '@/components/cms-v3/packages/components/cms-tabs.vue';
// import CmsVerticalTabContainer from '@/components/cms-v3/packages/components/cms-vertical-tab-container.vue';
// import CmsStickyContainer from '@/components/cms-v3/packages/components/cms-sticky-container.vue';
// import CmsPlaceholderProductChange from '@/components/cms-v3/packages/components/cms-placeholder-product-change';
// import CmsAnchorBar from '@/components/cms-v3/packages/components/cms-anchor-bar.vue';
// import CmsSpecialColumnList from '@/components/cms-v3/packages/components/cms-special-column-list.vue';
// import CmsDialogContainer from '@/components/cms-v3/packages/components/cms-dialog-container.vue';
// import CmsCardStack from '@/components/cms-v3/packages/components/cms-card-stack.vue';
// import CmsGraphicSlide from '@/components/cms-v3/packages/components/cms-graphic-slide.vue';
// import CmsPlaceHolder from '@/components/cms-v3/packages/components/cms-placeholder.vue';
// import CmsStoreSwitch from '@/components/cms-v3/packages/components/cms-store-switch.vue';
// import CmsContainerGroups from '@/components/cms-v3/packages/components/cms-container-groups.vue';
// import CmsPointPlaceholder from '@/components/cms-v3/packages/components/cms-point-placeholder.vue';
// import CmsPointSignPlaceholder from '@/components/cms-v3/packages/components/cms-point-sign-placeholder.vue';
// import CmsAllCourseList from '@/components/cms-v3/packages/components/cms-all-course-list.vue';
// import CmsPointProductList from '@/components/cms-v3/packages/components/cms-point-product-list.vue';
// import CmsPointTabs from '@/components/cms-v3/packages/components/cms-point-tabs.vue';

/**
 * 基础组件，负责根据节点数据的componentCode判断渲染哪一个cms组件
 * Vue3 版本
 * @author  韦胜健
 * @date    2022/9/20 9:39
 */

const props = defineProps({
  data: { type: Object, required: true },
  index: { type: Number, required: true },
  childrenStyles: {},
  autoGetRect: { type: String },
  isFirstFloorNode: { type: Boolean, default: false },
  isHidden: { type: Boolean, default: null },
  provides: Object,
});

// 提供 provides
const providesData = props.provides || {};
Object.keys(providesData).forEach((key) => {
  provide(key, providesData[key]);
});

// 使用 CMS 组件通用逻辑
const { isComputedHidden } = useCmsComponent(props, { isBaseComponent: true });

// 标记当前为 base component
const isBaseComponent = computed(() => true);
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
