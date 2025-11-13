<template>
  <div>
    <o2-empty-page v-if="silentFlag && isEmpty && pageTypeCode !== 'PLP'" :text="intl('b2c.component.cms.cmsEmpty').d('商家暂未装修，敬请期待')" emptyCode="store" />
    <CmsPreview v-if="!loading && !isEmpty" :data="data" :env="env" />
    <o2-login v-if="logining" :pageForm="pageFrom" @fetchLogin="fetchLogin" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, provide, getCurrentInstance } from 'vue';
import { useStore } from 'vuex';
import CmsPreview from '@/components/cms-v3/packages/cms-preview.vue';
import * as runtimeEnv from '@/env/index';
import { getJsonFile } from '@/utils/pageUtils';
import O2EmptyPage from '../o2-empty-page/o2-empty-page.vue';
import { skeletonType } from '@/utils/consts';

/**
 * CMS 页面主组件 Vue3版本
 * @author  韦胜健
 * @date    2022/9/20 9:39
 */

const props = defineProps({
  env: {},
  pageTypeCode: {
    type: String,
    default: 'INDEX',
  },
  pageCode: {
    type: String,
    default: '',
  },
  prevPageName: {
    type: String,
    default: '',
  },
  beforeHideLoading: {
    type: Object,
  },
});

const emit = defineEmits(['updateNavTitle', 'updateShareInfo']);

const instance = getCurrentInstance();
const store = useStore();

const loading = ref(false);
const data = ref(null);
const logining = ref(false);
const skeletonTypeValue = ref(skeletonType.home);

// Provide
provide('prevPageName', props.prevPageName);

// Computed
const activeTabbar = computed(() => store.state.activeTabbar);
const activeMallTabbar = computed(() => store.state.activeMallTabbar);
const storeInfo = computed(() => store.state.store.storeInfo);
const siteInfo = computed(() => store.state.siteInfo);
const currentCurrency = computed(() => store.state.currentCurrency);
const userInfo = computed(() => store.state.user.userInfo);
const token = computed(() => store.state.login.token);
const silentFlag = computed(() => store.state.login.silentFlag);

const isEmpty = computed(() => {
  return !loading.value && (!data.value || !data.value.name);
});

const pageFrom = computed(() => {
  switch (props.pageTypeCode) {
    case 'CATEGORY':
      return 'classification';
    case 'PLP':
      return 'cmsPLP';
    case 'CLP':
      return 'cmsCLP';
    case 'COURSE_CATEGORY':
      return 'cmsCourseCLP';
    case 'TRADE_INDEX':
      return 'mall';
    default:
      return 'index';
  }
});

// Methods
const fetchLogin = () => {
  logining.value = false;
};

const getCurPage = () => {
  return { route: instance.proxy.$Route.path };
};

const hasDefaultPage = () => {
  return props.pageTypeCode === 'PLP' || props.pageTypeCode === 'CLP' || props.pageTypeCode === 'COURSE_CATEGORY' || props.pageTypeCode === 'CATEGORY' || props.pageTypeCode === 'TRADE_INDEX';
};

const getActivePage = (data) => {
  if (!data || !data.length) {
    loading.value = false;
    return {};
  }
  const { subPages } = data.find((i) => i.pageTypeCode === props.pageTypeCode) || {};
  let activePage = {};
  if (subPages) {
    activePage = subPages.filter((page) => page.isMaster)[0];
    const _subPages = subPages.sort((a, b) => b.activeTimeFrom - a.activeTimeFrom);

    for (const page of _subPages) {
      const { activeTimeFrom, activeTimeTo } = page;
      const now = Date.now();

      if (activeTimeFrom && activeTimeTo) {
        if (now >= activeTimeFrom && now <= activeTimeTo) {
          activePage = page;
          break;
        }
      } else if (activeTimeFrom && !activeTimeTo) {
        if (now >= activeTimeFrom) {
          activePage = page;
          break;
        }
      }
    }
  }
  return activePage;
};

const getCmsData = async () => {
  loading.value = true;
  instance.proxy.$showLorealLoading();
  const minioUrl = runtimeEnv.OSS_URL;
  const { route } = getCurPage();

  const hasDefault = hasDefaultPage();

  const { data: responseData } = await (async () => {
    if (!siteInfo.value) return {};
    const { previewPageUrlPath, previewPageType, previewPageTypeCode, previewOnlineShopCode } = siteInfo.value;
    const isTargetPage = () => {
      let flag = true;
      if (['INDEX', 'CATEGORY', 'TRADE_INDEX'].includes(previewPageTypeCode)) {
        flag = (props.pageTypeCode === 'INDEX' && activeTabbar.value === 'home') || (props.pageTypeCode === 'CATEGORY' && activeTabbar.value === 'categories') || (props.pageTypeCode === 'TRADE_INDEX' && activeTabbar.value === 'mall');
      }

      if (previewPageType === 'dtc') {
        return `/${route}` === previewPageUrlPath && flag;
      } else if (previewPageType === 'shop') {
        if (instance.proxy.isStore) {
          return `/${route}` === previewPageUrlPath && flag && previewOnlineShopCode === storeInfo.value.onlineShopCode;
        } else {
          return `/${route}` === previewPageUrlPath && flag && previewOnlineShopCode === siteInfo.value.onlineShopCode;
        }
      }
    };

    let activePage = {};
    if (siteInfo.value.previewFilePath && isTargetPage()) {
      activePage.filePath = siteInfo.value.previewFilePath;
    } else if (hasDefault) {
      const url = instance.proxy.$requestUrl.cms.getJsonFileName;
      const jsonParams = [
        {
          siteCode: siteInfo.value?.siteCode || runtimeEnv.SITE_CODE,
          queryType: 'PAGE',
          pageTypeCode: props.pageTypeCode,
          pageCode: props.pageCode,
        },
      ];
      const { data } = await instance.proxy.$http.post(url, jsonParams, { interceptFlag: true });
      const currentPageInfo = data['PAGE'] ? data['PAGE'][0] : {};

      if (currentPageInfo.filePath) {
        const { data } = await instance.proxy.$http.get(minioUrl + currentPageInfo.filePath);
        emit('updateNavTitle', data.pageName || instance.proxy.intl('b2c.page.cmsCLP.pageTitle').d(`活动页`));
        activePage = getActivePage([data]);
      } else {
        const { categoryCode, pageTypeCode } = instance.proxy.$Route.query;
        if (pageTypeCode === 'PLP') {
          instance.proxy.$Router.replace({
            name: 'productList',
            params: { pageTypeCode, categoryCode },
          });
        } else if (pageTypeCode === 'CLP') {
          emit('updateNavTitle', instance.proxy.intl('b2c.page.cmsCLP.pageTitle').d(`活动页`));
          if (instance.proxy.$Route.path !== '/pagesB/cmsCLP/index') {
            uni.redirectTo({
              url: '/pagesB/cmsCLP/index',
            });
          }
        } else if (pageTypeCode === 'COURSE_CATEGORY') {
          emit('updateNavTitle', instance.proxy.intl('b2c.page.cmsCLP.pageTitle').d(`课程分类页`));
          if (instance.proxy.$Route.path !== '/pagesB/cmsCourseCLP/index') {
            uni.redirectTo({
              url: '/pagesB/cmsCourseCLP/index',
            });
          }
        }
      }
    } else {
      const jsonParams = {
        queryType: 'CMS_CONFIG',
      };

      const { data } = await getJsonFile(instance.proxy, jsonParams);
      activePage = getActivePage(data);
    }

    return activePage.filePath ? instance.proxy.$http.get(minioUrl + activePage.filePath) : {};
  })();

  if (responseData && responseData.pages) {
    let activeData = responseData.pages.find(({ screenTypeCode }) => screenTypeCode === 'MOBILE');
    if (!activeData) {
      activeData = responseData.pages.find((i) => i.show);
    }
    if (activeData.shareInfo) {
      emit('updateShareInfo', activeData.shareInfo);
    }
    data.value = activeData;
  } else {
    data.value = {};
  }
  loading.value = false;
  if (props.beforeHideLoading) await props.beforeHideLoading.promise;
  instance.proxy.$hideLorealLoading();
};

// Watchers
watch(
  () => siteInfo.value?.onlineShopCode,
  async (val) => {
    if (silentFlag.value && val && val !== siteInfo.value.onlineShopCode) {
      await getCmsData();
    }
  }
);

watch(
  () => props.pageCode,
  {
    immediate: true,
    handler: async (val) => {
      if (!data.value && val && props.pageTypeCode === 'CLP') {
        await getCmsData();
      }
    },
  }
);

watch(token, async (newVal) => {
  if (!newVal) {
    store.commit('user/save', ['seedingFlag', true]);
  }
});

// Lifecycle
onMounted(() => {
  getCmsData();
  uni.$on('openLoginPopup', (value) => {
    logining.value = value;
  });
});

onUnmounted(() => {
  uni.$off('openLoginPopup');
});
</script>

<style lang="scss"></style>
