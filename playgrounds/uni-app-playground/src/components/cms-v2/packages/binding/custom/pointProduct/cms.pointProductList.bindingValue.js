import { getOssImagePrefix } from '../../utils/util';

export function cmsPointProductListBindingValue(params) {
  const bindingValue = params.bindingValue;
  bindingValue.registry({
    code: '@@point-product-name',
    name: '绑定积分商品名称',
    getter: (data) => {
      let _data$data;

      const product = (_data$data = data.data) === null || _data$data === void 0 ? void 0 : _data$data.product;
      return {
        done: !!product,
        val: product === null || product === void 0 ? void 0 : product.exchangeableTypeCode === 'COUPON' ? product.couponName : product.platformProductName,
      };
    },
  });
  bindingValue.registry({
    code: "@@point-value",
    name: '绑定积分值',
    getter: (data) => {
      let _data$data;
      const product = (_data$data = data.data) === null || _data$data === void 0 ? void 0 : _data$data.product;
      return { done: !!product && !!product?.point, val: product?.point };
    },
  });
  bindingValue.registry({
    code: '@@point-product-image',
    name: '绑定积分商品图片',
    getter: (data) => {
      let _data$data4;

      const product = (_data$data4 = data.data) === null || _data$data4 === void 0 ? void 0 : _data$data4.product;
      const prefix = getOssImagePrefix();
      return {
        done: !!product,
        val: prefix + (product === null || product === void 0 ? void 0 : product.imageUrl),
      };
    },
  });
}
