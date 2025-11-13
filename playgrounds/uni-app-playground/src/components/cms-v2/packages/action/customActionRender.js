import Vue from 'vue';
import env from '@/env/index';
import { locationUtils } from '@/utils/locationUtils';
import { copyData, queryTemplateIds } from '@/utils/pageUtils';
import { batchSubscribe, subscribe } from '@/utils/subscribe';
import { showSalonModal, taskMonitor, toCLP } from '@/utils/cmsUtils';
/**
 * 注册自定义的动作处理逻辑
 * @author  韦胜健
 * @date    2022/9/19 20:41
 */
export function customActionRender({ actionRender: { registryActionRender } }) {
  registryActionRender('@@fixed', (data) => {
    // #ifdef H5
    const reg = /(http|https):\/\/([\w.]+\/?)\S*/gi;
    window.location.href = data.action.data.match(reg) ? data.action.data : `#${data.action.data}`;
    // #endif
    // #ifdef MP-WEIXIN
    Vue.prototype.$Router.push({
      name: 'webPage',
      params: { path: data.action.data, title: '', cmsAction: true },
    });
    // #endif
  });

  registryActionRender('bind-weapp-page', (data) => {
    let { page, params } = data.action?.data;

    if (['classification', 'news', 'cart', 'ucenter', 'index'].includes(page.code)) {
      let activeTabbar;
      switch (page.code) {
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
      Vue.prototype.$switchTab(activeTabbar);
    } else if (page.code === 'mallIndex') {
      Vue.prototype.$Router.push({
        name: 'mallIndex',
        params: {
          tenantId: data.data?.product?.tenantId,
          onlineShopCode: data.data?.product?.onlineShopCode,
        },
      });
    } else if (page.code === 'specialColumnDetail') {
      const { code: specialColumnCode } = data.action.data.targetSpecial || {};
      Vue.prototype.$Router.push({
        name: 'specialColumnDetail',
        params: { specialColumnCode },
      });
    } else {
      let path = page.path;
      if (params) {
        let search = [];
        const paraList = params.split('&');
        paraList.forEach((param) => {
          const arr = param.split('=');
          if (!arr[0] || !arr[1]) return;
          search.push(`${arr[0]}=${arr[1]}`);
        });
        if (search.length) path = `${path}?${search.join('&')}`;
        // const arr = params.split('=');
        // path = `${path}?query={"${arr[0]}":"${arr[1]}"}`;
      }
      // uni.navigateTo({
      //   url: path,
      // });
      Vue.prototype.$Router.push(path);
    }
  });

  registryActionRender('pdp', (data) => {
    Vue.prototype.$Router.push({
      name: 'productDetail',
      params: { platformProductCode: data.action.data.platformProductCode },
    });
  });

  const subscribeLive = async (code) => {
    if (Object.keys(Vue.prototype.$store.state.message.templateIds).length < 1) await queryTemplateIds({ context: Vue.prototype });
    subscribe((res) => subscribeMessage(res, code), false, { subsType: 'live' });
  };

  const subscribeMessage = async (res, code) => {
    // 订阅消息
    if (res && JSON.stringify(res) !== '{}' && Object.values(res).some((val) => !!val)) {
      const url = Vue.prototype.$requestUrl.message.subscribeMessage;
      const params = Object.keys(res).reduce((prev, key) => {
        prev.push({
          weChatSubscribeTypeCode: key,
          subscribeData: {
            subscribeFlag: res[key],
            value: code,
            key: 'platformProductCode',
          },
        });
        return prev;
      }, []);
      await Vue.prototype.$http.post(url, params);
      uni.showModal({
        title: '预约成功提醒',
        content: '您已预约成功，我们将在直播开播前发送消息提醒，敬请期待',
        showCancel: false,
        success: async (res) => {
          if (res.confirm) {
            const { applyStatus } = Vue.prototype.$store.state.user.userInfo;
            if (applyStatus === 'WAIT_APPROVE' || applyStatus == 'REJECT') return;
            const url = Vue.prototype.$requestUrl.taskCenter.doTask;
            const params = {
              taskTypeCode: 'SUBSCRIBE_LIVE',
              courseCode: code,
            };
            const res = await Vue.prototype.$http.post(url, params);
            if (res.data && res.data.successFlag) {
              Vue.prototype.$store.commit('save', ['liveInfo', res.data]);
              console.log(res);
            } else {
              // TODO：任务参与失败报错
              console.log('res.data', res.data);
            }
          }
        },
      });
    }
  };

  registryActionRender('bind-product', async (data) => {
    // 沙龙弹窗
    const { params } = data.action.data;
    const { popupFlag, popupCode } = params || {};
    console.log('{ data, popupFlag, popupCode }\n', { data, popupFlag, popupCode });
    const { successFlag, isPopup, isConfirm } = await showSalonModal({ popupFlag, popupCode, cancelRouterParams: { name: 'basicInformation' } });
    console.log('{ successFlag, isPopup, isConfirm }\n', { successFlag, isPopup, isConfirm });
    if (!successFlag || (isPopup && !isConfirm)) return; // 如果 失败 或 用户点了去修改 则不执行后面的逻辑
    // 跳转页面
    switch (data.data?.product?.kindTypeCode) {
      // 课程跳转
      case 'VIRTUAL_COURSE':
        if (data.data?.product?.courseForm === 'OFFLINE') {
          Vue.prototype.$Router.push({
            name: 'offLineProductDetail',
            params: { courseCode: data.data.product.platformProductCode },
          });
        } else {
          Vue.prototype.$Router.push({
            name: 'onLineProductDetail',
            params: { courseCode: data.data.product.platformProductCode },
          });
        }
        break;
      // 专栏跳转
      case 'VIRTUAL_SPECIAL':
        Vue.prototype.$Router.push({
          name: 'specialColumnDetail',
          params: { specialColumnCode: data.data.product.platformProductCode },
        });
        break;
      // 权益卡跳转
      case 'BENEFIT_CARD':
        Vue.prototype.$Router.push({
          name: 'equityCardProductDetail',
          params: { platformProductCode: data.data.product.platformProductCode },
        });
        break;
      // 大秀门票PDP跳转
      case 'ELE_CARD':
        Vue.prototype.$Router.push({
          name: 'offLineProductDetail',
          params: { courseCode: data.data.product.platformProductCode, kindTypeCode: 'ELE_CARD' },
        });
        break;
      default:
        Vue.prototype.$Router.push({
          name: 'productDetail',
          params: { platformProductCode: data.data.product.platformProductCode },
        });
    }
  });
  registryActionRender('bind-subscribe-live', (data) => {
    switch (data.data?.product?.kindTypeCode) {
      // 课程跳转
      case 'VIRTUAL_COURSE':
        if (data.data?.product?.courseForm === 'OFFLINE') {
          Vue.prototype.$Router.push({
            name: 'offLineProductDetail',
            params: { courseCode: data.data.product.platformProductCode },
          });
        } else {
          // 如果是直播而且是预约会有以下逻辑，否则直接跳转详情
          if (data.data?.product?.courseForm === 'LIVE_STREAMING' && data.data?.product?.liveType === 'BOOKING') {
            // 如果是直播已开始则触发复制文案
            if (new Date(data.data?.product?.time).getTime() < new Date().getTime()) {
              copyData(data.data?.product?.dyToken, '复制成功，去抖音观看直播吧');
            } else {
              // 否则 触发订阅
              subscribeLive(data.data.product.platformProductCode);
            }
          } else {
            Vue.prototype.$Router.push({
              name: 'onLineProductDetail',
              params: { courseCode: data.data.product.platformProductCode },
            });
          }
        }
        break;
      default:
        Vue.prototype.$Router.push({
          name: 'productDetail',
          params: { platformProductCode: data.data.product.platformProductCode },
        });
    }
  });
  registryActionRender('bind-note', (data) => {
    Vue.prototype.$Router.push({
      name: 'dynamicDetail',
      params: { noteCode: data.data?.note?.noteInfoCode },
    });
  });

  registryActionRender('bind-live-room', (data) => {
    // #ifdef MP-WEIXIN
    if (Vue.prototype.$store.state.siteInfo.previewFilePath) {
      Vue.prototype.$showToast({
        title: Vue.prototype.intl('b2c.component.cmsCustomActionRender.previewViewLive').d('预览不支持查看直播'),
        duration: 1000,
      });
      return false;
    }
    const { loginName } = Vue.prototype.$store.state.user.userInfo;
    const custom_params = encodeURIComponent(
      JSON.stringify({
        onlineShopCode: data.data.live.onlineShopCode,
        ...(loginName ? { loginName } : {}),
      }),
    );
    wx.navigateTo({
      url: `plugin-private://${env.LIVE_ID}/pages/live-player-plugin?room_id=${data.data.live.roomCode}&custom_params=${custom_params}`,
    });
    // #endif
  });

  /*
   * @Description: PLP页面跳转
   * @Author: sunliu
   * @Date: 2022-10-17 16:57:02
   */
  registryActionRender('bind-category', (data) => {
    const { params } = data.action.data;
    const { categoryCode } = data.data.category;

    Vue.prototype.$Router.push({
      name: 'cmsPLP',
      params: { pageTypeCode: 'PLP', pageCode: params.pageCode, categoryCode, prevPageName: Vue.prototype.$Route.name },
    });
  });

  /*
   * @Description: 活动页跳转
   * @Author: sunliu
   * @Date: 2022-10-19 18:07:23
   */
  registryActionRender('bind-clp', async (data) => {
    const { params } = data.action.data;
    const { trackingFlag, taskLovValue } = data.data;
    // 色彩成就奖立即报名页面不做登录拦截
    const signUpFlag = params.pageCode === env.COLOR_SIGN_UP_CLP_CODE;
    Vue.prototype.$showLorealLoading();
    // 任务监控: 活动页
    if (trackingFlag === 1 && ['LEARN_ONLINE_COURSE', 'BROWSIN_PAGES'].includes(taskLovValue.taskTypeCode)) {
      const taskParams = { taskLovValue, pageCode: params.pageCode };
      taskMonitor({ context: Vue.prototype, taskParams });
    } else if (params.enableSubscribe === 1) {
      // 菁英班订阅通知
      const subscribeCallback = async (res) => {
        if (res && JSON.stringify(res) !== '{}') {
          if (Object.values(res).some((val) => !!val)) {
            const url = Vue.prototype.$requestUrl.message.subscribeMessage;
            const { userId } = Vue.prototype.$store.state.user.userInfo;
            const para = Object.keys(res).reduce((prev, key) => {
              if (key === 'QUESTIONNAIRE_NOTICE') {
                // 菁英班通知 传userId
                prev.push({
                  weChatSubscribeTypeCode: key,
                  subscribeData: {
                    subscribeFlag: res[key],
                    value: userId,
                    key: 'userId',
                  },
                });
              }
              return prev;
            }, []);
            await Vue.prototype.$http.post(url, para);
            toCLP({ context: Vue.prototype, popupFlag: params.popupFlag, popupCode: params.popupCode, otherParams: { pageCode: params.pageCode, noInterceptor: signUpFlag } });
          } else {
            toCLP({ context: Vue.prototype, popupFlag: params.popupFlag, popupCode: params.popupCode, otherParams: { pageCode: params.pageCode, noInterceptor: signUpFlag } });
          }
        }
      };
      batchSubscribe(subscribeCallback, ['questionnaireNotice']);
    } else {
      toCLP({ context: Vue.prototype, popupFlag: params.popupFlag, popupCode: params.popupCode, otherParams: { pageCode: params.pageCode, noInterceptor: signUpFlag } });
    }
  });

  /*
   * @Description: 课程活动页跳转
   * @Author: sunliu
   * @Date: 2023-10-26 10:10:44
   */
  registryActionRender('bind-course-category', (data) => {
    const { params: actionParams, firstPos = '', secondPos = '' } = data.action.data;
    const { trackingFlag, taskLovValue } = data.data;
    if (trackingFlag === 1 && ['LEARN_ONLINE_COURSE', 'BROWSIN_PAGES'].includes(taskLovValue.taskTypeCode)) {
      const taskParams = {
        taskLovValue,
        pageCode: actionParams.pageCode,
        coursePos: { firstPos, secondPos },
      };
      taskMonitor({ context: Vue.prototype, taskParams });
    } else {
      Vue.prototype.$Router.push({
        name: 'cmsCourseCLP',
        params: { pageTypeCode: 'COURSE_CATEGORY', pageCode: actionParams.pageCode, pos: { firstPos, secondPos } },
      });
    }
  });

  /*
   * @Description: 领取优惠券/码
   * @Author: wanghuanhuan
   * @Date: 2022-12-16  17:13:44
   */
  registryActionRender('bind-coupon', (data) => {
    const userInfo = Vue.prototype.$store.state.user.userInfo;
    if (!userInfo.currentRole || userInfo.currentRole === 'ANONYMOUS') {
      uni.$emit('openLoginPopup', true);
    } else {
      const { code, couponTypeCode } = data.data.coupon || {};
      if (code) {
        const url = couponTypeCode ? `${Vue.prototype.$requestUrl.promotion.receiveCoupon}/${code}` : `${Vue.prototype.$requestUrl.promotion.receivePromoCode}/${code}`;
        // 调用领取券/码接口
        Vue.prototype.$http.post(url).then((res) => {
          if (res && res.data) {
            Vue.prototype.$showToast({
              title: Vue.prototype.intl('b2c.component.cmsCustomActionRender.receiveSuccess').d('领取成功'),
              duration: 1000,
            });
          }
        });
      }
    }
  });

  /*
   * @Description: 跳转splp页
   * @Author: wanghuanhuan
   * @Date: 2022-12-19  11:15:41
   */
  registryActionRender('bind-splp', (data) => {
    const {
      params: { marketingKey },
    } = data.action.data || { params: {} };
    if (marketingKey) {
      Vue.prototype.$Router.push({
        name: 'productList',
        params: { marketingKey },
      });
    }
  });
  /*
   * @Description: 跳转外部小程序
   * @Author: wanghuanhuan
   * @Date: 2023-06-05  14:30:18
   */
  let externalClickFlag = false;
  registryActionRender('bind-external-miniProgram', (data) => {
    if (externalClickFlag) {
      return;
    }
    externalClickFlag = true;
    const { programCode } = data.action.data || {};
    if (programCode) {
      Vue.prototype.$http.get(Vue.prototype.$requestUrl.cms.getMiniProgram, { miniProgramLinkCode: programCode }).then(
        (res) => {
          if (res && res.data && !res.data.failed) {
            const { appId, path, params } = res.data;
            let combinePath = path;
            if (params) {
              combinePath = `${path}?${params}`;
            }
            uni.navigateToMiniProgram({
              appId,
              path: combinePath,
              complete() {
                externalClickFlag = false;
              },
              fail(res) {
                if (res && res.errMsg !== 'navigateToMiniProgram:fail cancel') {
                  Vue.prototype.$showToast({
                    title: Vue.prototype.intl('b2c.component.cmsCustomActionRender.jumpExternalProgramFailed').d('跳转失败'),
                    icon: 'none',
                  });
                }
              },
            });
          }
        },
        () => {
          externalClickFlag = false;
        },
      );
    }
  });

  /*
   * @Description: 跳转表单
   * @Author: wanghuanhuan
   * @Date: 2023-10-25  15:32:53
   */
  registryActionRender('bind-form', async (data) => {
    const actionData = data.action.data;
    if (actionData) {
      // 兼容旧版页面，旧版的 action.data 就是固定链接，现在改成 action.data.url
      /** @type {string} */
      let updatedUrl = typeof actionData === 'string' ? actionData : actionData.url;
      const { pageCode } = Vue.prototype.$Route.query;
      const { nickName, unionId, salonName } = Vue.prototype.$store.state.user.userInfo;
      const url = Vue.prototype.$requestUrl.login.getD2sCustomer;
      Vue.prototype.$showLorealLoading();
      // 处理地址信息
      const addressData = { regionName: '', cityName: '', districtName: '' };
      try {
        await locationUtils.getLocation();
        const { latitude, longitude } = locationUtils.state.location;
        if (latitude || longitude) {
          // 只有正常获取了经纬度才进入这一步
          const { province, city, district } = await locationUtils.wxGetLocation(`${latitude},${longitude}`);
          Object.assign(addressData, { regionName: province, cityName: city, districtName: district });
        } else {
          console.error('获取地址信息失败：获取经纬度失败\n', { latitude, longitude });
        }
      } catch (e) {
        console.error('获取地址信息失败\n', e);
      }
      Vue.prototype.$http.get(url).then(
        (res) => {
          Vue.prototype.$hideLorealLoading();
          if (res && res.data) {
            const { mobilePhone, userId } = res.data;
            const replaceKeys = {
              salonName: actionData.salonName,
              nickName: actionData.nickName,
              mobilePhone: actionData.mobilePhone,
              userId: actionData.userId,
              unionId: actionData.unionId,
              activityCode: actionData.activityCode,
              regionName: actionData.regionName,
              cityName: actionData.cityName,
              districtName: actionData.districtName,
            };
            const replaceValues = {
              salonName,
              nickName,
              mobilePhone,
              userId,
              unionId,
              activityCode: pageCode,
              ...addressData,
            };
            const _cpv = {};
            for (let key in replaceValues) {
              if (replaceValues.hasOwnProperty(key)) {
                const newKey = replaceKeys[key] || key; // 这里是否要做一个检查 replaceKeys[key] 是否合法的校验
                const newValue = replaceValues[key] || '';
                _cpv[newKey] = newValue;
                // const replaceReg = new RegExp(`\\s?["]?${key}["]?\\s?:\\s?"value"`);
                // updatedUrl = updatedUrl.replace(replaceReg, `"${newKey}":"${newValue}"`);
              }
            }
            updatedUrl += `${/[&?]$/.test(updatedUrl) ? '' : updatedUrl.includes('?') ? '&' : '?'}_cpv=${JSON.stringify(_cpv)}`;
            if (updatedUrl) {
              Vue.prototype.$Router.push({
                name: 'webPage',
                params: { path: updatedUrl, title: '', cmsAction: true },
              });
            }
          }
        },
        () => Vue.prototype.$hideLorealLoading(),
      );
    }
  });

  /*
   * @Description: 跳转专栏详情
   * @Author: wanghuanhuan
   * @Date: 2023-10-26  19:51:32
   */
  registryActionRender('bind-specialColumn', (data) => {
    const { specialColumnCode } = data.data.specialColumn;
    Vue.prototype.$Router.push({
      name: 'specialColumnDetail',
      params: { specialColumnCode },
    });
  });

  /*
   * @Description: 跳转促销活动商品列表页
   * @Author: liulidong
   * @Date: 2023-11-18  14:49:51
   */
  registryActionRender('bind-promotion-plp', (data) => {
    const {
      params: { sceneCode },
    } = data.action.data || { params: {} };
    if (sceneCode) {
      Vue.prototype.$Router.push({
        name: 'promotionPLP',
        params: { sceneCode },
      });
    }
  });
  /*
   * @Description: 跳转兑换商品页
   * @Author: wanghuanhuan
   * @Date: 2024-03-13  14:00:17
   */
  registryActionRender('bind-point-product', (data) => {
    switch (data.data?.product?.exchangeableTypeCode) {
      // 优惠券跳转
      case 'COUPON':
        uni.$emit('openCouponExchangePopup', { ...data.data.product });
        break;
      // 线下课程跳转
      case 'COURSE':
        Vue.prototype.$Router.push({
          name: 'offLineProductDetail',
          params: { courseCode: data.data.product.platformProductCode },
        });
        break;
      // 商品跳转
      default:
        Vue.prototype.$Router.push({
          name: 'productDetail',
          params: { platformProductCode: data.data.product.platformProductCode },
        });
    }
  });

  /*
   * @Description: 跳转登陆注册页
   * @Author: liulidong
   * @Date: 2024-03-20  19:49:51
   */
  registryActionRender('bind-login', async () => {
    if (!Vue.prototype.$store.state.login.token) {
      Vue.prototype.$Router.push({
        name: 'role',
      });
      return;
    }
    const res = await Vue.prototype.$http.get(Vue.prototype.$requestUrl.login.getCustomerInfo);
    if (res.data.applyStatus === 'WAIT_APPROVE') {
      Vue.prototype.$Router.push({
        name: 'submited',
      });
    } else if (res.data.applyStatus === 'REJECT') {
      Vue.prototype.$Router.push({
        name: 'approveFailed',
      });
    } else if (res.data.applyStatus === 'APPROVED') {
      Vue.prototype.$showToast({
        title: '您已经登陆了',
        duration: 2000,
      });
    }
  });
}
