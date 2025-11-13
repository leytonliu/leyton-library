import env from '@/env/index';
import Vue from 'vue';
import { defer } from '@/utils/defer';
import { IMG_PREFIX } from '@/utils/regExp';

//转成千分制
function thousandNum(num) {
  num += '';
  if (!num.includes('.')) num += '.';
  // noinspection JSAnnotator
  return num
    .replace(/(\d)(?=(\d{3})+\.)/g, function ($0, $1) {
      return $1 + ',';
    })
    .replace(/\.$/, '');
}

//保留2位小数，并补0
function toDecimal2(x) {
  let f = parseFloat(x);
  if (isNaN(f)) {
    return 0.0;
  }
  f = Math.round(x * 100) / 100;
  let s = f.toString();
  let rs = s.indexOf('.');
  if (rs < 0) {
    rs = s.length;
    s += '.';
  }
  return s;
}

/**
 * 金额格式化
 * @param {*} num
 */
const toMoney = function (num) {
  num = isNaN(num) ? 0 : num;
  let res = Number(num).toFixed(2);
  res = parseFloat(res);
  res = res.toLocaleString();
  if (res.indexOf('.') === -1) {
    res = `${res}`;
  } else if (res.indexOf('.') !== -1 && Number(num).toFixed(1) - Number(num).toFixed(2) === 0) {
    res = `${res}0`;
  }
  return `${Vue.prototype.$store.state.siteInfo.currencySymbol}${res}`;
};

/**
 * 时间格式转换
 * @param {Date} date date对象
 */
const formatTime = (date, type = '') => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  if (type === 'popup') {
    return month + '月' + day + '日' + ' ' + [hour, minute].map(formatNumber).join(':');
  }

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
};

const formatNumber = (n) => {
  n = n.toString();
  return n[1] ? n : '0' + n;
};

//最后输出的数字
const formatNum = function (a) {
  return thousandNum(toDecimal2(a));
};

// 金额取整
const integerPrice = (price) => {
  const formatPrice = formatNum(price);
  return formatPrice.substring(0, formatPrice.indexOf('.'));
};
// 小数金额取零
const decimalPrice = (price) => {
  const formatPrice = price + '';
  if (formatPrice.indexOf('.') === -1) {
    return '';
  } else {
    return formatPrice.substring(formatPrice.indexOf('.'), formatPrice.indexOf('.') + 3);
  }
};

const IsPC = () => {
  const userAgentInfo = navigator.userAgent;
  const Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];
  let flag = true;
  for (let v = 0; v < Agents.length - 1; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
};

const getDataSetMeaning = (list, value) => {
  const arr = list?.filter((item) => item.value === value);
  const meaning = arr?.length ? arr[0]?.meaning : value;
  return meaning;
};

const getImageUrl = (url) => {
  if (IMG_PREFIX.test(url)) {
    return url;
  } else {
    return `${env.OSS_URL}${url}`;
  }
};
// * 数字转整数 如 100000 转为10万
// * @param {需要转化的数} num
// * @param {需要保留的小数位数} point

const tranNumber = (num, point) => {
  let numStr = num.toString();
  if (num === 0) {
    return '';
  }
  // 十万以内直接返回
  if (numStr.length < 5) {
    return numStr;
  }
  //大于8位数是亿
  else if (numStr.length > 8) {
    let decimal = numStr.substring(numStr.length - 8, numStr.length - 8 + point);
    return parseFloat(parseInt(num / 100000000) + '.' + decimal) + '亿';
  }
  //大于6位数是十万 (以10W分割 10W以下全部显示)
  else if (numStr.length > 5) {
    let decimal = numStr.substring(numStr.length - 4, numStr.length - 4 + point);
    return parseFloat(parseInt(num / 10000) + '.' + decimal) + '万';
  }
  // 大于4是万
  else if (numStr.length > 4) {
    let decimal = numStr.substring(numStr.length - 4, numStr.length - 4 + point);
    return parseFloat(parseInt(num / 10000) + '.' + decimal) + '万';
  }
};

// 规格格式化 商品行上的显示 订单、评价、售后……
const specsFormat = (specs, key) => {
  const attributeName = key || 'variableAttrValueMeaning'; // 属性名称
  if (!specs || specs?.length == 0 || specs === null) {
    return '';
  }
  const text = specs
    ?.map((i) => i[attributeName])
    ?.filter((item) => item)
    ?.join('，');
  return text || '';
};

// 获取系统宽高
const getSystem = () => {
  const system = uni.getSystemInfoSync();
  return { w: system.windowWidth, h: system.windowHeight };
};

// 时间比较
const isTimeCompare = (func, period) => {
  const dayjs = require('dayjs');
  if (func === 'isSameOrAfter') {
    const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
    dayjs.extend(isSameOrAfter);
    return dayjs().isSameOrAfter(dayjs(period?.end));
  } else {
    const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
    dayjs.extend(isSameOrBefore);
    return dayjs().isSameOrBefore(dayjs(period?.end));
  }
};

/**
 * 转化为中划线命名
 * @author  韦胜健
 * @date    2022/9/20 9:35
 */
const kebabCase = (str) => {
  if (str.length > 1 && /[A-Z]/.test(str.charAt(0))) {
    str = str.charAt(0).toLowerCase() + str.substring(1);
  }
  return str.replace(/[A-Z]/g, (i) => '-' + i.toLowerCase());
};

/**
 * 将style对象转化为内敛样式字符串，会自动将驼峰命名转化为中划线命名
 * @author  韦胜健
 * @date    2022/9/20 9:33
 */
const convertStyleToString = (styleObject) => {
  if (styleObject == null) {
    return styleObject;
  }
  if (typeof styleObject == 'string') {
    return styleObject;
  }
  return Object.entries(styleObject)
    .reduce((prev, [key, value]) => {
      prev.push(`${kebabCase(key)}:${value}`);
      return prev;
    }, [])
    .join(';');
};

/*
 * @Description: 判断是否为空对象
 * @Author: sunliu
 * @Date: 2023-01-29 10:48:17
 */
const isEmptyObj = (data) => {
  if (typeof data !== 'object') {
    return;
  }
  return JSON.stringify(data) === '{}';
};

/**
 * 获取视频总时长
 * @param url 视频url
 * @returns {*}
 */
const getVideoTime = (url) => {
  const dfd = defer();
  if (!url) return;
  let audioContext = uni.createInnerAudioContext();
  audioContext.volume = 0;
  audioContext.autoplay = true;
  audioContext.src = url || '';
  // 必须写在onCanplay里面，否则获取不到
  audioContext.onCanplay(
    () => {
      audioContext.duration;
      audioContext.buffered;
      //如果不写上面2行，打印audioContext，duration，buffered都有值，但打印audioContext.duration或audioContext.buffered值为0
      setTimeout(() => {
        // 部分iphone手机audioContext.duration 会为0，所以判断audioContext.duration是否为0
        dfd.resolve(audioContext.duration || audioContext.buffered);
      }, 1000);
    },
    () => {
      dfd.resolve();
    },
  );
  return dfd.promise;
};

// 是否中文环境
const isZhCN = () => {
  const currentLang = Vue.prototype.$store.state.currentLang || Vue.prototype.$store.state.siteInfo.defLanguageCode;
  return currentLang === 'zh_CN';
};

// 跳转至外部链接
const goToDeepLink = (deepLink, linkType = 'H5', otherParams = {}, isNavigate = false) => {
  if (linkType === 'H5') {
    // #ifdef APP-PLUS
    if (plus.os.name == 'Android' || plus.os.name == 'iOS') {
      plus.runtime.openURL(deepLink);
      return;
    }
    // #endif
    // #ifdef H5
    window.location.replace(deepLink);
    // #endif
    // #ifdef MP-WEIXIN
    Vue.prototype.$Router.push({
      name: 'webPage',
      params: { path: deepLink, title: '' },
    });
    // #endif
  } else if (linkType === 'WE_CHAT') {
    goToWechatPage(deepLink, otherParams, isNavigate);
  } else if (linkType === 'EXTERNAL_WE_CHAT') {
    goToExternalWeChat(deepLink, otherParams);
  } else if (linkType === 'ACTIVITY_PAGE') {
    const { pageCode } = JSON.parse(otherParams);
    if (isNavigate) {
      Vue.prototype.$Router.push({
        name: 'cmsCLP',
        params: { pageTypeCode: 'CLP', pageCode },
      });
      return;
    }
    Vue.prototype.$Router.replace({
      name: 'cmsCLP',
      params: { pageTypeCode: 'CLP', pageCode },
    });
  }
};

// 跳转内部小程序
const goToWechatPage = (link, otherParams, isNavigate) => {
  let path = link;
  const parseParams = JSON.parse(otherParams);
  let { params, pageCode } = parseParams;
  try {
    // pro资讯link是个url,parse会报错走到catch
    const linkParse = JSON.parse(link);
    // 兼容特定词
    path = linkParse.path;
    // params = linkParse.params;
  } catch (e) {}
  // const { params } = JSON.parse(otherParams);
  // let path = page.path;
  if (params) {
    const arr = params.split('=');
    path = `${path}?query={"${arr[0]}":"${arr[1]}"}`;
  }

  if (['classification', 'news', 'cart', 'ucenter', 'index'].includes(pageCode)) {
    let activeTabbar;
    switch (pageCode) {
      case 'classification':
        activeTabbar = 'categories';
        break;
      case 'news':
        activeTabbar = 'moments';
        break;
      case 'cart':
        activeTabbar = 'cart';
        break;
      case 'ucenter':
        activeTabbar = 'mine';
        break;
      default:
        activeTabbar = 'home';
    }
    Vue.prototype.$store.commit('save', ['activeTabbar', activeTabbar]);
    Vue.prototype.$Router.replaceAll({ name: 'index' });
  } else {
    if (isNavigate) {
      uni.navigateTo({
        url: path,
      });
      return;
    }
    uni.redirectTo({
      url: path,
    });
  }
};

// 跳转外部小程序
const goToExternalWeChat = (link, otherParams) => {
  const { appId, params } = JSON.parse(otherParams);
  let combinePath = link;
  if (link && params) {
    combinePath = `${link}?${params}`;
  }
  uni.navigateToMiniProgram({
    appId,
    path: combinePath,
    fail(res) {
      if (res && res.errMsg !== 'navigateToMiniProgram:fail cancel') {
        Vue.prototype.$showToast({
          title: Vue.prototype.intl('b2c.component.cmsCustomActionRender.jumpExternalProgramFailed').d('跳转失败'),
          icon: 'none',
        });
      }
    },
  });
};

const getVuexKey = () => {
  const vuexKey = uni.getAccountInfoSync().miniProgram.envVersion;
  return `${vuexKey}_vuex`;
};

const getCurrencyMeaning = (value) => {
  const siteInfo = Vue.prototype.$store.state.siteInfo;
  const currentCurrency = Vue.prototype.$store.state.currentCurrency;
  const currencyMap = siteInfo.supportCurrencyList.reduce((prev, current) => {
    prev[current.currencyCode] = current.currencySymbol;
    return prev;
  }, {});

  if (!value) {
    value = currentCurrency || siteInfo.defCurrencyCode;
  }
  return currencyMap[value] || siteInfo.currencySymbol;
};

const toPx = (num) => {
  if (typeof num === 'string') {
    if (num.indexOf('px') !== -1) {
      if (num.indexOf('rpx') !== -1) {
        // "10rpx"
        num = num.replace('rpx', '');
      } else if (num.indexOf('upx') !== -1) {
        // "10upx"
        num = num.replace('upx', '');
      } else {
        // "10px"
        return Number(num.replace('px', ''));
      }
    } else if (num.indexOf('%') !== -1) {
      // 传百分比,则相对于windowHeight,传"10%"则等于windowHeight的10%
      let rate = Number(num.replace('%', '')) / 100;
      return this.windowHeight * rate;
    }
  }
  return num ? uni.upx2px(Number(num)) : 0;
};

const switchTab = (name = 'home') => {
  Vue.prototype.$store.commit('save', ['activeTabbar', name]);
  if (Vue.prototype.$Route.name !== 'index') {
    Vue.prototype.$Router.replaceAll({ name: 'index' });
  }
};

const switchMallTab = ({ name = 'mallHome', params = {} }) => {
  Vue.prototype.$store.commit('save', ['activeMallTabbar', name]);
  Vue.prototype.$Router.push({
    name: 'mallIndex',
    params: { onlineShopCode: params.onlineShopCode, tenantId: params.tenantId },
  });
};

export { switchMallTab, switchTab, getCurrencyMeaning, getVuexKey, formatNumber, formatTime, formatNum, toMoney, integerPrice, decimalPrice, IsPC, getDataSetMeaning, getImageUrl, tranNumber, specsFormat, getSystem, isTimeCompare, kebabCase, convertStyleToString, isEmptyObj, getVideoTime, isZhCN, goToDeepLink, toDecimal2, toPx };
