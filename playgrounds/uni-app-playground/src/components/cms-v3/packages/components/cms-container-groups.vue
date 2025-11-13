<template>
  <div class="cms-container-groups">
    <div v-if="!!childrenData">
      <cms-base-component v-for="(item, index) in childrenData" :key="item.componentId" :data="item" :index="index" />
    </div>
  </div>
</template>
<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  import { mapState } from 'vuex';

  export default {
    name: 'CmsContainerGroups',
    mixins: [CmsComponentMixin],
    data() {
      return {};
    },
    computed: {
      ...mapState({
        seedingFlag: (state) => state.user.seedingFlag,
        userInfo: (state) => state.user.userInfo,
        seedingPopupFlag: (state) => state.user.seedingPopupFlag,
      }),
      isLogin() {
        return !!this.$store.state.login.token;
      },
      childrenData() {
        if (this.data.childrenData?.length) {
          const prev = [];
          for (const item of this.data.childrenData) {
            if (item.componentCode === 'image') {
              // 如果登录了并且图片设置了部分可见，并且没有弹出过部分可见的弹窗
              if (this.isLogin && item.data.visibleFlag && this.seedingFlag && !this.seedingPopupFlag) {
                this.$store.commit('user/save', ['seedingPopupFlag', true]);
                prev.push(item);
                break;
              } else {
                this.$store.commit('user/save', ['seedingPopupFlag', false]);
                if (!item.data.visibleFlag) {
                  prev.push(item);
                  break;
                }
              }
            }
          }
          return prev;
        }
        return this.data.childrenData;
      },
    },
    methods: {},
  };
</script>
