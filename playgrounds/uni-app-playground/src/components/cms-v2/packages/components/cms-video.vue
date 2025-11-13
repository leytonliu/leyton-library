<template>
  <view :class="classes" :data-component="data.componentCode" :style="styles">
    <view v-if="!isReady" class="video-cover">
      <view class="o2-loading-content">
        <image :src="imagePath + '/loading-logo.svg'" mode="aspectFit"></image>
      </view>
      <view class="loreal-loading"></view>
    </view>
    <video id="cmsVideo" :autoplay="data.data.autoplay === 1" :controls="true" :muted="data.data.autoplay === 1" :poster="videoUrl" :src="getBindingValue(data.data.url)" :style="{ height: data.data.height, width: data.data.width }" :object-fit="videoMode" :custom-cache="false" @pause="pause" @play="play" @error="loadError" @loadedmetadata="loadedMetadata" />
  </view>
</template>

<script>
  import { CmsComponentMixin } from '@/components/cms/packages/utils/CmsComponentMixin';
  import { setCurPlayContext, clearCurPlayContext } from '@/components/cms/packages/utils/videoContext';
  import env from '@/env';

  export default {
    name: 'CmsVideo',
    mixins: [CmsComponentMixin],
    data() {
      return {
        videoUrl: '',
        isPlayMap: {}, // 当前视频状态：暂停|播放
        autoPauseMap: {}, // 是手动暂停还是切换页签时的自动暂停
        videoContextMap: {},
        isReady: false, // 视频元数据是否加载完成
        imagePath: env.OSS_URL + env.DEFAULT_IMAGE_PATH + env.theme, // oss资源路径
      };
    },
    async mounted() {
      if (this.data.data.poster) {
        this.videoUrl = this.data.data.poster;
      } else {
        // #ifdef H5
        this.videoUrl = await this.getVideoBase64(this.data.data.url);
        // #endif
      }
      this.autoPauseMap[this.data.componentId] = true;
      this.isPlayMap[this.data.componentId] = true;
      this.videoContextMap[this.data.componentId] = uni.createVideoContext('cmsVideo', this);
      uni.$on('switchTab', ({ videoComponentId }) => {
        if (videoComponentId && this.autoPauseMap[videoComponentId]) {
          this.videoContextMap[videoComponentId].play(videoComponentId);
        } else {
          this.autoPauseMap[this.data.componentId] = this.isPlayMap[this.data.componentId];
          this.videoContextMap[this.data.componentId].pause();
        }
      });
    },
    beforeDestroy() {
      clearCurPlayContext(this.videoContextMap[this.data.componentId]);
      uni.$off('switchTab');
    },
    computed: {
      videoMode() {
        switch (this.data.data.objectFit) {
          case 'none':
            return 'fill';
          case 'scale-down':
            return 'contain';
          default:
            return this.data.data.objectFit || 'fill';
        }
      },
    },
    methods: {
      loadedMetadata() {
        // 元数据加载完成时触发，关闭loading
        this.isReady = true;
      },
      pause() {
        this.isPlayMap[this.data.componentId] = false;
        clearCurPlayContext(this.videoContextMap[this.data.componentId]);
      },
      play() {
        this.isPlayMap[this.data.componentId] = true;
        setCurPlayContext(this.videoContextMap[this.data.componentId]);
      },
      loadError(e) {
        console.log('视频加载出错!!!', e);
      },
      getVideoBase64(url) {
        return new Promise(function (resolve) {
          let dataURL = '';
          let video = document.createElement('video');
          video.setAttribute('crossOrigin', 'anonymous'); //处理跨域
          video.setAttribute('src', url);
          video.setAttribute('width', 750);
          video.setAttribute('height', 750);
          video.setAttribute('preload', 'auto');
          video.addEventListener('loadeddata', function () {
            let canvas = document.createElement('canvas'),
              width = video.width, //canvas的尺寸和图片一样
              height = video.height;
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(video, 0, 0, width, height); //绘制canvas
            dataURL = canvas.toDataURL('image/jpeg');
            resolve(dataURL);
          });
        });
      },
    },
  };
</script>

<style lang="scss">
  .cms-video {
    /* #ifdef H5 */
    #cmsVideo {
      height: unset;
    }
    /deep/ .uni-video-container {
      position: relative;
    }
    /* #endif */
  }
  .video-cover {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;

    .loreal-loading {
      position: absolute;
      top: calc(50% - 60rpx);
      left: calc(50% - 60rpx);
      width: 120rpx;
      height: 120rpx;
      background: #000000;
      -webkit-mask: radial-gradient(closest-side circle, royalblue 2%, transparent 2%) center top/25% 25% no-repeat, radial-gradient(closest-side circle, transparent 98%, red 50% 99%, transparent 100%), conic-gradient(transparent 2%, royalblue 98%);
      -webkit-mask-composite: source-over, source-in;
      animation: rotate 1s linear infinite;
    }
    @keyframes rotate {
      to {
        transform: rotate(360deg);
      }
    }
    .o2-loading-content {
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      /deep/ .o2-image {
        background-color: transparent !important;
      }
      image {
        width: 90rpx;
        height: 90rpx;
      }
    }
  }
</style>
