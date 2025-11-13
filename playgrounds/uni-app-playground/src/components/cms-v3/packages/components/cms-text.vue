<template>
  <view
    v-if="!!getBindingValue(data.data.text) && textEventStop"
    :class="classes"
    :data-component="data.componentCode"
    :style="styles"
    @tap.stop="handleTapBaseContainer"
  >
    <view :style="textStyles">
      {{ getBindingValue(data.data.text) }}
    </view>
  </view>
  <view
    v-else-if="!!getBindingValue(data.data.text)"
    :class="classes"
    :data-component="data.componentCode"
    :style="styles"
    @tap="handleTapBaseContainer"
  >
    <view :style="textStyles" :class="data.data.fontFamily || 'font-regular'">
      <view v-if="data.data.text === '@@product-label'" class="label-wrap">
        <view
          class="label mr4"
          v-for="(label, index) in getBindingValue(data.data.text).split(' ')"
          :key="index"
          >{{ label }}</view
        >
      </view>
      <template v-else-if="data.data.text === '@@customer-point'">
        {{ point }}
      </template>
      <template v-else>
        {{ getBindingValue(data.data.text) || data.data.text }}
      </template>
    </view>
  </view>
</template>

<script>
import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
import { convertStyleToString } from '@/components/cms/packages/utils/utils';

export default {
  name: 'CmsText',
  mixins: [CmsComponentMixin],
  mounted() {},
  watch: {
    isLogin: {
      immediate: true,
      handler: async function (val) {
        if (val && this.data.data.text === '@@customer-point' && this.isLogin) {
          this.fetchPoint();
        }
      },
    },
  },
  computed: {
    isLogin() {
      return !!this.$store.state.login.token;
    },
    textEventStop() {
      return this.data.data.text === '@@online-shop-name';
    },
    textStyles() {
      return convertStyleToString(
        {
          single: {
            overflow: 'hidden',
            'text-overflow': 'ellipsis',
            display: '-webkit-box',
            '-webkit-box-orient': 'vertical',
            '-webkit-line-clamp': '1',
          },
          multiple: {
            overflow: 'hidden',
            'text-overflow': 'ellipsis',
            display: '-webkit-box',
            '-webkit-box-orient': 'vertical',
            '-webkit-line-clamp': '2',
            height: 'inherit',
          },
        }[this.data.data.overflowMode]
      );
    },
  },
  data() {
    return {
      point: 0,
    };
  },
  methods: {
    async fetchPoint() {
      const url = this.$requestUrl.ucenter.queryPoint;
      try {
        const { data } = await this.$http.get(url);
        this.point = data.totalPoint;
      } catch (e) {
        console.log('CMS获取用户积分失败', e);
        this.point = 0;
      }
    },
  },
};
</script>

<style lang="scss">
.cms-text {
  .font-light {
    @include font-light();
  }
  .font-regular {
    @include font-regular();
  }
  .font-medium {
    @include font-medium();
  }
  .font-bold {
    @include font-bold();
  }

  .label-wrap {
    height: 28rpx;
    line-height: 28rpx;
    white-space: pre-wrap;
    overflow: hidden;
    width: 252rpx;
  }
  .label {
    display: inline-block;
    width: max-content;
    //height: 40rpx;
    text-align: center;
    //line-height: 40rpx;

    @include font-regular();
    font-weight: 400;
  }
}
</style>
