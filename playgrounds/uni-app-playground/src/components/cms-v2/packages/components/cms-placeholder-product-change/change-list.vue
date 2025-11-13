<template>
  <swiper v-if="url.length" class="mb16" :current="activeIndex" :style="{ height: '278rpx' }" acceleration :display-multiple-items="3" circular :next-margin="config.marginWidth" :previous-margin="config.marginWidth" easing-function="linear" @transition="onTransition" @animationfinish="change">
    <swiper-item v-for="(item, index) in url" :key="index" class="df aic jcc" @tap="goToDetail(item)">
      <o2-image v-if="item.imageUrl" auto :width="'100%'" :height="'100%'" :style="{ height: '224rpx', width: widthList[index], opacity: opacityList[index], transform: `scale(${scaleList[index]})` }" :src="item.imageUrl" />
    </swiper-item>
  </swiper>
</template>

<script>
  import { getSystem } from '@/utils/utils';
  export default {
    name: 'change-list',
    data() {
      return {
        activeIndex: 0,
        url: [],
        scaleList: [],
        opacityList: [],
        widthList: [],
        // 卡片配置
        config: {
          itemWidth: 127, // 单个卡片宽度，默认系统宽度/展示数量
          scale: 0.236, // 放大系数
          opacity: 0.4,
          showCount: 3, // 展示数量
          marginWidth: 25,
        },
      };
    },
    mounted() {
      const system = getSystem();
      this.config.itemWidth = (system.w - this.config.marginWidth * 2) / this.config.showCount;
    },
    props: {
      data: {
        type: Array,
        default: function () {
          return [];
        },
      },
    },
    watch: {
      data: {
        immediate: true,
        handler(newVal, oldVal) {
          if (oldVal !== newVal) {
            this.url = newVal;
            this.scaleList = new Array(newVal.length).fill(1);
            this.opacityList = new Array(newVal.length).fill(this.config.opacity);
            this.widthList = new Array(newVal.length).fill('178rpx');
            this.calculateScale(0);
          }
        },
      },
    },
    methods: {
      goToDetail(data) {
        if (data.platformProductCode) {
          this.$Router.push({
            name: 'productDetail',
            params: { platformProductCode: data.platformProductCode, title: data.title },
          });
        }
      },
      onTransition(event) {
        const dx = parseInt(event.detail.dx);
        this.calculateScale(dx);
      },
      calculateScale(dx) {
        const { itemWidth, scale, opacity } = this.config;
        const calculateWidth = itemWidth * 1.4;
        const displayCardLength = this.url.length;
        const transitionIndex = Math.round(dx / itemWidth);
        const currentIndex = this.activeIndex + transitionIndex + 1;
        const disScaleCacheList = [];
        const calculateRange = displayCardLength <= 3 ? 1 : 2;
        for (let i = -calculateRange; i <= calculateRange; i++) {
          const dis = Math.abs(dx - (transitionIndex + i) * itemWidth);
          const targetIndex = (currentIndex + i + displayCardLength) % displayCardLength;
          // 1表示离中心最近， 0最远
          const disScale = Math.max(calculateWidth - dis, 0) / calculateWidth;
          disScaleCacheList.push({ targetIndex, disScale });
        }
        disScaleCacheList.forEach(({ targetIndex, disScale }, index) => {
          this.opacityList[targetIndex] = opacity + (1 - opacity) * disScale;
          // 要求最外边框间距缩短，通过增加两边卡片宽度的方法实现类似的效果
          if (displayCardLength > 3 && (index === 0 || index === disScaleCacheList.length - 1)) {
            const referDisScale = index === 0 ? disScaleCacheList[1].disScale : disScaleCacheList[disScaleCacheList.length - 2].disScale;
            const widthDisScale = Math.max(0.7 - referDisScale, 0) / 0.7;
            this.widthList[targetIndex] = 178 + 60 * widthDisScale + 'rpx';
          } else {
            this.widthList[targetIndex] = '178rpx';
          }
          this.$set(this.scaleList, targetIndex, 1 + disScale * scale);
        });
      },
      change(event) {
        this.activeIndex = event.detail.current;
      },
    },
  };
</script>
