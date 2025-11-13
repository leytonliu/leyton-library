<template>
  <div>
    <o2-empty-page v-if="silentFlag && isEmpty && pageTypeCode !== 'PLP'" :text="intl('b2c.component.cms.cmsEmpty').d('商家暂未装修，敬请期待')" emptyCode="store" />
    <CmsPreview v-if="!loading && !isEmpty" :data="data" :env="env" />
    <o2-login v-if="logining" :pageForm="pageFrom" @fetchLogin="fetchLogin" />
  </div>
</template>

<script>
  import CmsPreview from '@/components/cms/packages/cms-preview';
  import * as runtimeEnv from '@/env/index';

  import { getJsonFile } from '@/utils/pageUtils';
  import { mapState } from 'vuex';
  import O2EmptyPage from '../o2-empty-page/o2-empty-page';
  import { skeletonType } from '@/utils/consts';

  export default {
    name: 'CmsPage',
    components: { O2EmptyPage, CmsPreview },
    options: {
      styleIsolation: 'shared',
      virtualHost: true,
    },
    props: {
      env: {},
      // 页面类型
      pageTypeCode: {
        type: String,
        default: 'INDEX',
      },
      // 页面编码
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
    },
    provide() {
      return {
        prevPageName: this.prevPageName,
      };
    },
    data() {
      return {
        loading: false,
        data: null,
        logining: false,
        skeletonType: skeletonType.home,
      };
    },
    watch: {
      'siteInfo.onlineShopCode': {
        // immediate: true,
        handler: async function (val) {
          if (this.silentFlag && val && val !== this.siteInfo.onlineShopCode) {
            await this.getCmsData();
          }
        },
      },
      pageCode: {
        immediate: true,
        handler: async function (val) {
          if (!this.data && val && this.pageTypeCode === 'CLP') {
            await this.getCmsData();
          }
        },
      },
      token: {
        handler: async function (newVal) {
          // 退出登录需要重新把图片部分可见属性置为true
          if (!newVal) {
            this.$store.commit('user/save', ['seedingFlag', true]);
          }
        },
      },
    },
    computed: {
      ...mapState(['activeTabbar']),
      ...mapState(['activeMallTabbar']),
      ...mapState({
        storeInfo: (state) => state.store.storeInfo,
        siteInfo: (state) => state.siteInfo,
        currentCurrency: (state) => state.currentCurrency,
        userInfo: (state) => state.user.userInfo,
        token: (state) => state.login.token,
        silentFlag: (state) => state.login.silentFlag,
      }),
      isEmpty() {
        return !this.loading && (!this.data || !this.data.name);
      },
      pageFrom() {
        switch (this.pageTypeCode) {
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
      },
    },
    mounted() {
      this.getCmsData();
      uni.$on('openLoginPopup', (value) => {
        this.logining = value;
      });
    },
    unmounted() {
      uni.$off('openLoginPopup');
    },
    methods: {
      fetchLogin() {
        this.logining = false;
      },
      async getCmsData() {
        this.loading = true;
        this.$showLorealLoading();
        const minioUrl = runtimeEnv.OSS_URL;
        const { route } = this.getCurPage();

        // 是否是有兜底逻辑的页面
        const hasDefaultPage = this.hasDefaultPage();

        const { data } = await (async () => {
          if (!this.siteInfo) return {};
          const { previewPageUrlPath, previewPageType, previewPageTypeCode, previewOnlineShopCode } = this.siteInfo;
          const isTargetPage = () => {
            let flag = true;
            // 首页和分类页因为使用了同一个路由，需要判断一下当前预览的是哪个页面
            if (['INDEX', 'CATEGORY', 'TRADE_INDEX'].includes(previewPageTypeCode)) {
              flag = (this.pageTypeCode === 'INDEX' && this.activeTabbar === 'home') || (this.pageTypeCode === 'CATEGORY' && this.activeTabbar === 'categories') || (this.pageTypeCode === 'TRADE_INDEX' && this.activeTabbar === 'mall');
            }

            if (previewPageType === 'dtc') {
              // bbc平台层级预览
              return `/${route}` === previewPageUrlPath && flag;
            } else if (previewPageType === 'shop') {
              // dtc预览、门店预览、bbc店铺预览
              if (this.isStore) {
                return `/${route}` === previewPageUrlPath && flag && previewOnlineShopCode === this.storeInfo.onlineShopCode;
              } else {
                return `/${route}` === previewPageUrlPath && flag && previewOnlineShopCode === this.siteInfo.onlineShopCode;
              }
            }
          };

          let activePage = {};
          if (this.siteInfo.previewFilePath && isTargetPage()) {
            activePage.filePath = this.siteInfo.previewFilePath;
          } else if (hasDefaultPage) {
            const url = this.$requestUrl.cms.getJsonFileName;
            const jsonParams = [
              {
                siteCode: this.siteInfo?.siteCode || runtimeEnv.SITE_CODE,
                queryType: 'PAGE',
                pageTypeCode: this.pageTypeCode,
                pageCode: this.pageCode,
              },
            ];
            // 从服务端获取真实页面的cms数据文件地址
            const { data } = await this.$http.post(url, jsonParams, { interceptFlag: true });
            const currentPageInfo = data['PAGE'] ? data['PAGE'][0] : {};
            /**
             * 获取页面cms数据:
             * - 配置了plp页面编码：跳转到对应样式plp，查出类别的商品
             * - 未配置plp页面编码（但是中台维护且发布了plp）：显示有默认标识的cms-plp
             * - 未配置plp页面编码（中台也没维护plp）：显示当前前端的default-plp
             */
            if (currentPageInfo.filePath) {
              const { data } = await this.$http.get(minioUrl + currentPageInfo.filePath);

              /**
               * 更新页面标题
               */
              this.$emit('updateNavTitle', data.pageName || this.intl('b2c.page.cmsCLP.pageTitle').d(`活动页`));

              activePage = this.getActivePage([data]);
            } else {
              const { categoryCode, pageTypeCode } = this.$Route.query;
              if (pageTypeCode === 'PLP') {
                this.$Router.replace({
                  name: 'productList',
                  params: { pageTypeCode, categoryCode },
                });
              } else if (pageTypeCode === 'CLP') {
                this.$emit('updateNavTitle', this.intl('b2c.page.cmsCLP.pageTitle').d(`活动页`));
                if (this.$Route.path !== '/pagesB/cmsCLP/index') {
                  uni.redirectTo({
                    url: '/pagesB/cmsCLP/index',
                  });
                }
              } else if (pageTypeCode === 'COURSE_CATEGORY') {
                this.$emit('updateNavTitle', this.intl('b2c.page.cmsCLP.pageTitle').d(`课程分类页`));
                if (this.$Route.path !== '/pagesB/cmsCourseCLP/index') {
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

            const { data } = await getJsonFile(this, jsonParams);
            activePage = this.getActivePage(data);
          }

          return activePage.filePath ? this.$http.get(minioUrl + activePage.filePath) : {};
        })();

        if (data && data.pages) {
          // 默认取小屏数据
          let activeData = data.pages.find(({ screenTypeCode }) => screenTypeCode === 'MOBILE');
          if (!activeData) {
            activeData = data.pages.find((i) => i.show);
          }
          if (activeData.shareInfo) {
            this.$emit('updateShareInfo', activeData.shareInfo);
          }
          this.data = activeData;
        } else {
          this.data = {};
        }
        this.loading = false;
        if (this.beforeHideLoading) await this.beforeHideLoading.promise;
        this.$hideLorealLoading();
      },

      /*
       * @Description: 判断要加载的页面是不是有默认页面，有默认页面，走单独的cmsPage查询，没有默认页面，直接从cms-config中读取数据
       * @Author: sunliu
       * @Date: 2022-10-17 16:19:39
       */
      hasDefaultPage() {
        return this.pageTypeCode === 'PLP' || this.pageTypeCode === 'CLP' || this.pageTypeCode === 'COURSE_CATEGORY' || this.pageTypeCode === 'CATEGORY' || this.pageTypeCode === 'TRADE_INDEX';
      },

      /*
       * @Description: 筛选一个生效的装修页面
       * @Author: sunliu
       * @Date: 2022-10-17 09:57:45
       */
      getActivePage(data) {
        if (!data || !data.length) {
          this.loading = false;
          // this.$hideLorealLoading();
          return {};
        }
        const { subPages } = data.find((i) => i.pageTypeCode === this.pageTypeCode) || {};
        let activePage = {};
        if (subPages) {
          // 先拿到主版本页面，作为兜底页面
          activePage = subPages.filter((page) => page.isMaster)[0];

          // 将subPages中的页面按照开始时间倒序排列(开始时间优先级最高)
          const _subPages = subPages.sort((a, b) => b.activeTimeFrom - a.activeTimeFrom);

          // 筛选一个在有效时间范围的页面（逻辑上是唯一的）
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
      },
    },
  };
</script>

<style lang="scss"></style>
