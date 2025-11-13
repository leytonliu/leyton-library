<template>
  <view>
    <change-list v-for="(data, urlIndex) in url" :key="urlIndex" :data="data" />
    <view class="df jcc aic" @click="handleChange" v-if="url && url.length">
      <o2-icon icon="change" size="32rpx" />
      <text class="text-body2 color-grey1 ml8">{{ intl('b2c.components.cmsChange.tips').d('换一换') }}</text>
    </view>
  </view>
</template>
<script>
  import ChangeList from '@/components/cms/packages/components/cms-placeholder-product-change/change-list';
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  export default {
    name: 'cms-placeholder-product-change',
    components: { ChangeList },
    mixins: [CmsComponentMixin],
    data() {
      return {
        current: 0,
        loading: false,
        emptyData: [
          [{ imageUrl: '' }, { imageUrl: '' }, { imageUrl: '' }, { imageUrl: '' }, { imageUrl: '' }],
          [{ imageUrl: '' }, { imageUrl: '' }, { imageUrl: '' }, { imageUrl: '' }, { imageUrl: '' }],
          [{ imageUrl: '' }, { imageUrl: '' }, { imageUrl: '' }, { imageUrl: '' }, { imageUrl: '' }],
        ],
      };
    },
    computed: {
      url() {
        if (this.loading) {
          return this.emptyData;
        }
        if (this.data.data.list?.length > this.current && this.data.data.list[this.current].list) {
          const fenge = (arr, N) => {
            const result = [];
            for (let i = 0; i < 15; i += N) {
              const newArr = arr.slice(i, i + N);
              // swiper设置了display-multiple-items，至少需要设置的数量，这里是3
              if (newArr.length === 2) {
                newArr.push({});
              } else if (newArr.length === 1) {
                newArr.unshift({});
                newArr.push({});
              }
              result.push(newArr);
            }
            return result;
          };
          const allList = fenge(this.data.data.list[this.current].list, 5);
          return allList;
        }
        return [];
      },
    },
    methods: {
      // 获取数据
      async getRecommend() {
        const recommend = this.data.data.list[this.current];
        if (!recommend.hasSearch) {
          this.loading = true;
          try {
            const siteInfo = uni.getStorageSync('siteInfo');
            const res = await this.$http.get(
              this.$requestUrl.cms.getRecommend,
              {
                page: 1,
                size: 15,
                maxScore: 0,
                recommendCode: recommend.recommendCode,
                onlineShopCode: siteInfo.onlineShopCode,
              },
              { interceptFlag: true },
            );
            this.$set(this.data.data.list[this.current], 'list', res.data.data);
            this.data.data.list[this.current].hasSearch = true;
            this.loading = false;
          } catch (e) {
            this.loading = false;
          }
        }
      },
      // 点击换一换
      handleChange() {
        if (this.current + 1 >= this.data.data.list.length) {
          this.current = 0;
        } else {
          this.current++;
        }
        this.getRecommend();
      },
    },
    mounted() {
      this.getRecommend();
    },
  };
</script>

<style scoped lang="scss"></style>
