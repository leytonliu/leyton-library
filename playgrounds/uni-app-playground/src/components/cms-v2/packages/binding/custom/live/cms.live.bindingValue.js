import Vue from 'vue';
import { formatTime,formatCardDate } from './cms.live.utils';

const intl = Vue.prototype.intl;

/*
 * @Description: 自定义直播间绑定字段渲染
 * @Author: sunliu
 * @Date: 2022-08-25 17:59:24
 */

export function cmsLiveBindingValue({ bindingValue }) {
  bindingValue.registry({
    code: '@@live-title',
    name: '绑定直播间标题',
    getter: (data) => {
      var _data$data;

      const live = (_data$data = data.data) === null || _data$data === void 0 ? void 0 : _data$data.live;
      return {
        done: !!live,
        val: live === null || live === void 0 ? void 0 : live.roomName,
      };
    },
  });
  bindingValue.registry({
    code: '@@live-mediaUrl',
    name: '绑定直播间封面图片',
    getter: (data) => {
      var _data$data2;

      const live = (_data$data2 = data.data) === null || _data$data2 === void 0 ? void 0 : _data$data2.live;
      return {
        done: !!live,
        val: live === null || live === void 0 ? void 0 : live.feedsImgUrl,
      };
    },
  });
  bindingValue.registry({
    code: '@@live-date',
    name: '绑定直播日期',
    getter: (data) => {
      var _data$data3;

      const product = (_data$data3 = data.data) === null || _data$data3 === void 0 ? void 0 : _data$data3.product;
      return {
        done: !!product,
        val: formatCardDate(product === null || product === void 0 ? void 0 : product.liveTime),
      };
    },
  });
  bindingValue.registry({
    code: '@@live-start-time',
    name: '绑定直播开播时间',
    getter: (data) => {
      var _data$data3;

      const live = (_data$data3 = data.data) === null || _data$data3 === void 0 ? void 0 : _data$data3.live;
      return {
        done: !!live,
        val: formatTime(live === null || live === void 0 ? void 0 : live.startTime),
      };
    },
  });
  bindingValue.registry({
    code: '@@live-end-time',
    name: '绑定直播结束时间',
    getter: (data) => {
      var _data$data4;

      const live = (_data$data4 = data.data) === null || _data$data4 === void 0 ? void 0 : _data$data4.live;
      return {
        done: !!live,
        val: formatTime(live === null || live === void 0 ? void 0 : live.endTime),
      };
    },
  });
  bindingValue.registry({
    code: '@@live-status',
    name: '绑定直播间状态',
    getter: (data) => {
      var _data$data5;

      const live = (_data$data5 = data.data) === null || _data$data5 === void 0 ? void 0 : _data$data5.live;
      let roomStatusMeaning = '';
      switch (live?.roomStatusCode) {
        case 'LIVING':
          roomStatusMeaning = intl('b2c.component.cmsLive.isLiving').d('直播中');
          break;
        case 'NOT_START':
          roomStatusMeaning = intl('b2c.component.cmsLive.soonLiving').d('即将开播');
          break;
        default:
          roomStatusMeaning = intl('b2c.component.cmsLive.replay').d('精彩回放');
      }
      return {
        done: !!live,
        val: live === null || live === void 0 ? void 0 : roomStatusMeaning,
      };
    },
  });
}
