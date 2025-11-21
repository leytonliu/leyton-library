<script setup>
import { onLaunch } from '@dcloudio/uni-app';

onLaunch(() => {
  console.log('App Launch');
});
</script>

<style lang="scss">
/*每个页面公共css */
// 小程序通常不支持本地路径的 .ttf 文件（或者会有跨域问题）。
// 推荐方案：在 iconfont 项目页点击 "转 Base64" 后下载，或者将 .ttf 文件转为 Base64 字符串嵌入到 CSS 中。

@import './static/styles/iconfont.css';
</style>
