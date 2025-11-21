<template>
  <text
    class="cms-icon iconfont"
    :class="[icon, customClass]"
    :style="iconStyle"
    @click="handleClick"
  ></text>
</template>

<script lang="ts" setup>
import { computed, CSSProperties } from 'vue';

defineOptions({
  name: 'CmsIcon',
});

interface Props {
  /** 图标名称，例如 'icon-guanbi2' */
  icon: string;
  /** 图标大小，支持数字(默认rpx)或字符串('20px', '40rpx') */
  size?: string | number;
  /** 图标颜色 */
  color?: string;
  /** 自定义样式类 */
  customClass?: string;
  /** 自定义内联样式 */
  customStyle?: CSSProperties | string;
}

const props = withDefaults(defineProps<Props>(), {
  size: '32rpx', // 默认大小
  color: 'inherit', // 默认继承
  customClass: '',
  customStyle: '',
});

const emits = defineEmits<{
  (e: 'click', event: any): void;
}>();

/**
 * 单位处理工具
 */
const addUnit = (value: string | number | undefined, unit = 'rpx'): string => {
  if (value === undefined || value === null || value === '') return '';
  if (
    typeof value === 'string' &&
    /^\d+(\.\d+)?(px|rpx|rem|em|%)$/.test(value)
  ) {
    return value;
  }
  return `${value}${unit}`;
};

/**
 * 计算样式
 */
const iconStyle = computed(() => {
  const style: CSSProperties = {
    fontSize: addUnit(props.size),
    color: props.color,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (typeof props.customStyle === 'object') {
    Object.assign(style, props.customStyle);
  }

  return style;
});

const handleClick = (e: any) => {
  emits('click', e);
};
</script>

<style lang="scss" scoped>
/* 前提：请确保在 App.vue 中全局引入了 @import "@/static/styles/iconfont.css"; 
*/

/* 2. 修改 CSS 类名 */
.cms-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  text-rendering: auto;
  -webkit-font-smoothing: antialiased;
}
</style>
