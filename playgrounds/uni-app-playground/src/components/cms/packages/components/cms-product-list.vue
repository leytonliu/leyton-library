<template>
  <view
    :class="classes"
    :data-component="data.componentCode"
    :style="styles"
    class="cms-product-list"
  >
    <scroll-view
      v-if="isHorizontal"
      class="cms-product-list-scroll"
      :enable-flex="true"
      :scroll-x="true"
    >
      <view class="cms-product-list-flex">
        <template v-if="productChildrenData.length">
          <cms-base-component
            v-for="(item, index) in productChildrenData"
            :key="item.componentId"
            :children-styles="childrenItemStyles[index]"
            :data="item"
            :index="index"
          />
        </template>
      </view>
    </scroll-view>

    <view
      v-else-if="!loading && productChildrenData.length === 0"
      class="empty-tips"
    >
      暂无商品数据
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, type CSSProperties } from 'vue';
import { CmsBaseComponentProps, CmsComponentData } from '../../cms';
import { cmsBaseComponentDefaults } from '../utils/constants';
import useCmsComponent from '../hooks/useCmsComponent';
import CmsBaseComponent from '../cms-base-component.vue';
import { deepcopy } from '../utils/deepcopy';
import { iterateComponentData } from '../utils/utils';

defineOptions({
  name: 'CmsProductList',
  options: {
    virtualHost: true,
    styleIsolation: 'shared',
  },
});

const props = withDefaults(defineProps<CmsBaseComponentProps>(), {
  ...cmsBaseComponentDefaults,
});

// 1. Hook 集成
const {
  classes,
  styles,
  bindingValue, // 必须拿到这个，用于注册伪造数据
  envConfig,
} = useCmsComponent(props);

// --- 状态 ---
const loading = ref(true);
const rawProductList = ref<any[]>([]); // 原始商品数据列表

// --- 计算属性 ---

const isHorizontal = computed(() => !!props.data.data?.horizontal);

/**
 * [核心逻辑] 数据裂变
 * 将 API 返回的商品数组，结合 CMS 配置的“子组件模板”，
 * 生成一份可供 CmsBaseComponent 渲染的组件树列表。
 */
const productChildrenData = computed(() => {
  // 1. 校验：必须有模板
  if (!props.data.childrenData || !props.data.childrenData[0]) {
    return [];
  }
  const templateComponent = props.data.childrenData[0];

  // 2. 映射：商品数据 -> 组件节点
  const list = rawProductList.value.map((productItem) => {
    // 深拷贝模板
    const componentNode = deepcopy(templateComponent);

    // [!] 注入数据
    // 将商品数据挂载到节点的 data.product 上
    // 这样子组件(如 Text) 就可以通过 getBindingValue('product.name') 拿到数据
    componentNode.data = {
      ...componentNode.data,
      product: productItem,
    };

    // 确保 action 存在 (点击商品跳转)
    if (!componentNode.action) {
      componentNode.action = { code: 'bind-product' };
    }

    return componentNode;
  });

  // 3. 递归注入 (确保模板深层的子组件也能拿到 product 数据)
  // 这一步是为了让 bindingValue 机制生效
  iterateComponentData((node: CmsComponentData) => {
    node.childrenData?.forEach((child) => {
      if (child) {
        child.data.product = node.data.product;
      }
    });
  }, list);

  // 4. [关键] 注册到 FakeDataManager
  // 这样 getBindingValue 向上查找 ID 时，能找到这些动态生成的节点
  if (bindingValue?.fakeDataManager) {
    bindingValue.fakeDataManager.resetFakeData(props.data);
    bindingValue.fakeDataManager.processFakeData(props.data, list);
  }

  return list;
});

/**
 * 计算子项样式 (Gutter 间距)
 */
const childrenItemStyles = computed(() => {
  const d = props.data.data || {};
  const gutter = parseFloat(d.gutter) || 0; // 假设 gutter 是数字或带 px 的字符串

  return productChildrenData.value.map((_, index) => {
    const isLast = index === productChildrenData.value.length - 1;

    // 横向滚动逻辑：
    // 除了最后一个元素，其他元素右侧都加 gutter
    const style: CSSProperties = {
      marginRight: isLast ? '0' : `${gutter}px`,
      // 这里的 height 通常由模板自身决定，或者由父级强制指定
      // 如果需要，可以加: height: '100%'
    };
    return style;
  });
});
</script>

<style lang="scss" scoped>
.cms-product-list {
  width: 100%;
  box-sizing: border-box;

  // 滚动容器
  .cms-product-list-scroll {
    width: 100%;
    white-space: nowrap; // 关键：禁止换行

    // 隐藏滚动条
    ::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
      color: transparent;
    }

    .cms-product-list-flex {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap; // 关键：不换行
      align-items: flex-start; // 顶部对齐

      // 稍微留一点 padding，防止 shadow 被切
      padding: 4rpx 0;
    }
  }

  .empty-tips {
    padding: 40rpx;
    text-align: center;
    color: #999;
    font-size: 24rpx;
  }
}
</style>
