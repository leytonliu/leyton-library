import { getOssImagePrefix } from '../../utils/util';
import { formatNum, getCurrencyMeaning } from '@/utils/utils';
import Vue from 'vue';

function getformatNum(num) {
  return formatNum(num);
}

export function cmsProductListBindingValue(params) {
  const bindingValue = params.bindingValue;
  bindingValue.registry({
    code: '@@product-name',
    name: '绑定商品名称',
    getter: (data) => {
      let _data$data;

      const product = (_data$data = data.data) === null || _data$data === void 0 ? void 0 : _data$data.product;
      return {
        done: !!product,
        val: product === null || product === void 0 ? void 0 : product.title,
      };
    },
  });
  bindingValue.registry({
    code: '@@product-symbol',
    name: '绑定商品货币符号',
    getter: (data) => {
      let _data$data2;
      const currentCurrency = Vue.prototype.$store.state.currentCurrency;
      const product = (_data$data2 = data.data) === null || _data$data2 === void 0 ? void 0 : _data$data2.product;
      //货币符号在装修预览的时候，默认给个￥
      return {
        done: !!product,
        val: (product === null || product === void 0 ? void 0 : product.currencySymbol) || getCurrencyMeaning(currentCurrency),
      };
    },
  });
  bindingValue.registry({
    code: '@@product-price',
    name: '绑定商品价格',
    getter: (data) => {
      let _data$data3;

      const product = (_data$data3 = data.data) === null || _data$data3 === void 0 ? void 0 : _data$data3.product;
      return {
        done: !!product,
        val: product === null || product === void 0 ? void 0 : getformatNum(product.unitPrice),
      };
    },
  });
  bindingValue.registry({
    code: '@@product-display-price',
    name: '绑定商品划线价',
    getter: (data) => {
      let _data$data3;
      const siteInfo = Vue.prototype.$store.state.siteInfo;
      const product = (_data$data3 = data.data) === null || _data$data3 === void 0 ? void 0 : _data$data3.product;
      const currencySymbol = product?.currencySymbol || siteInfo.currencySymbol;
      return {
        done: !!product,
        val: product?.displayPrice == null || (product?.displayPrice != null && product?.displayPrice === product.unitPrice) ? '' : `${currencySymbol}${product.displayPrice}`,
      };
    },
  });
  bindingValue.registry({
    code: '@@product-image',
    name: '绑定商品图片',
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
  bindingValue.registry({
    code: '@@product-card-image',
    name: '绑定商品卡片图片',
    getter: (data) => {
      let _data$data4;

      const product = (_data$data4 = data.data) === null || _data$data4 === void 0 ? void 0 : _data$data4.product;
      const prefix = getOssImagePrefix();
      return {
        done: !!product,
        val: prefix + (product === null || product === void 0 ? void 0 : product.cartImgUrl),
      };
    },
  });
  bindingValue.registry({
    code: '@@product-label',
    name: '绑定商品标签',
    getter: (data) => {
      let _data$data;

      const product = (_data$data = data.data) === null || _data$data === void 0 ? void 0 : _data$data.product;
      let productLabel = '',
        arr = [];
      if (product && product.labelList && Object.keys(product.labelList).length && product.labelTypes) {
        const labelType = Object.keys(product.labelList)[0];
        arr = product.labelList[labelType].slice(0, 3);
        productLabel = arr.length ? arr.join(' ') : '';
      }
      return {
        done: !!product,
        val: productLabel === null || productLabel === void 0 ? void 0 : productLabel,
      };
    },
  });

  bindingValue.registry({
    code: '@@online-shop-name',
    name: '绑定店铺名称',
    getter: (data) => {
      let _data$data;

      const product = (_data$data = data.data) === null || _data$data === void 0 ? void 0 : _data$data.product;
      return {
        done: !!product,
        val: product === null || product === void 0 ? void 0 : product.onlineShopName,
      };
    },
  });
  bindingValue.registry({
    code: '@@product-speaker',
    name: '绑定主讲人',
    getter: (data) => {
      let _data$data;

      const product = (_data$data = data.data) === null || _data$data === void 0 ? void 0 : _data$data.product;
      return {
        done: !!product,
        val: product === null || product === void 0 ? void 0 : product.speaker ? product.speaker.replaceAll(',', '、') : '',
      };
    },
  });
}
