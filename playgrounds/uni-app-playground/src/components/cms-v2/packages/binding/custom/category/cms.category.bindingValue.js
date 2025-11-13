import { getOssImagePrefix } from '../../utils/util';

/*
 * @Description: 自定义类别绑定字段渲染
 */
export function cmsCategoryBindingValue({ bindingValue }) {
  bindingValue.registry({
    code: '@@category-title',
    name: '绑定类别标题',
    getter: (data) => {
      const category = data.data?.category;
      return { done: !!category, val: category?.categoryName };
    },
  });

  bindingValue.registry({
    code: '@@category-imageUrl',
    name: '绑定类别图片',
    getter: (data) => {
      const category = data.data?.category;

      const prefix = getOssImagePrefix();
      return { done: !!category, val: prefix + category?.imageUrl };
    },
  });
}
