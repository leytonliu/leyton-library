<template>
  <view class="content">
    <button type="primary" @click="startGeneratePoster" style="margin: 20px">
      生成订单海报 (最终修复版)
    </button>
    <view style="text-align: center; color: #999; font-size: 14px">
      已修复：预览滚动、图片裁剪、企业微信白屏
    </view>

    <canvas
      canvas-id="posterCanvas"
      class="poster-canvas"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
    ></canvas>

    <view class="preview-modal" v-if="showPreview" @touchmove.stop.prevent>
      <view class="preview-mask" @click="closePreview"></view>
      <view class="preview-container">
        <view class="preview-header">
          海报预览
          <text class="close-icon" @click="closePreview">×</text>
        </view>

        <scroll-view scroll-y class="preview-scroll">
          <view style="padding: 20px">
            <image
              :src="posterTempPath"
              mode="widthFix"
              class="preview-image"
              @click="previewBigImage"
            />
          </view>
        </scroll-view>

        <view class="preview-footer">
          <button class="save-btn" type="primary" @click="handleSaveToAlbum">
            保存到相册
          </button>
            <button class="save-btn" type="primary" @click="handleSharePoster">
            handleSharePoster
          </button>
          
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// ================== 1. 数据 ==================
const mockOrderData = {
  status: '待付款',
  userPhone: '许宁 132XXXX2847',
  address: {
    userName: '许宁',
    phone: '13223432847',
    detail: '深圳市福田区泰然四路深业泰然立城B座14-26F、A座21-28F',
  },
  shops: [
    {
      name: 'La Koradior',
      count: 2,
      items: [
        {
          title: '2025年冬季H型直筒落地红色连衣裙',
          spec: '艳红色 / XS',
          price: '749.5',
          originalPrice: '1499',
          count: 1,
          img: 'https://osschina.hongsheart.com/20260126/854ae15b-6de0-4e08-b25f-8ca7b904a0a9.jpg?x-oss-process=style/middle',
        },
        {
          title: '2025年冬季100%绵羊毛浅黄色外套',
          spec: '浅黄色 / XS',
          price: '1249.5',
          originalPrice: '2499',
          count: 1,
          img: 'https://osschina.hongsheart.com/20260126/854ae15b-6de0-4e08-b25f-8ca7b904a0a9.jpg?x-oss-process=style/middle',
        },
        {
          title: '2025年冬季H型直筒落地红色连衣裙',
          spec: '艳红色 / XS',
          price: '749.5',
          originalPrice: '1499',
          count: 1,
          img: 'https://osschina.hongsheart.com/20260126/854ae15b-6de0-4e08-b25f-8ca7b904a0a9.jpg?x-oss-process=style/middle',
        },
        {
          title: '2025年冬季100%绵羊毛浅黄色外套',
          spec: '浅黄色 / XS',
          price: '1249.5',
          originalPrice: '2499',
          count: 1,
          img: 'https://osschina.hongsheart.com/20260126/854ae15b-6de0-4e08-b25f-8ca7b904a0a9.jpg?x-oss-process=style/middle',
        },
        {
          title: '2025年冬季H型直筒落地红色连衣裙',
          spec: '艳红色 / XS',
          price: '749.5',
          originalPrice: '1499',
          count: 1,
          img: 'https://osschina.hongsheart.com/20260126/854ae15b-6de0-4e08-b25f-8ca7b904a0a9.jpg?x-oss-process=style/middle',
        },
        {
          title: '2025年冬季100%绵羊毛浅黄色外套',
          spec: '浅黄色 / XS',
          price: '1249.5',
          originalPrice: '2499',
          count: 1,
          img: 'https://osschina.hongsheart.com/20260126/854ae15b-6de0-4e08-b25f-8ca7b904a0a9.jpg?x-oss-process=style/middle',
        },
        {
          title: '2025年冬季H型直筒落地红色连衣裙',
          spec: '艳红色 / XS',
          price: '749.5',
          originalPrice: '1499',
          count: 1,
          img: 'https://osschina.hongsheart.com/20260126/854ae15b-6de0-4e08-b25f-8ca7b904a0a9.jpg?x-oss-process=style/middle',
        },
        {
          title: '2025年冬季100%绵羊毛浅黄色外套',
          spec: '浅黄色 / XS',
          price: '1249.5',
          originalPrice: '2499',
          count: 1,
          img: 'https://osschina.hongsheart.com/20260126/854ae15b-6de0-4e08-b25f-8ca7b904a0a9.jpg?x-oss-process=style/middle',
        },
        {
          title: '2025年冬季H型直筒落地红色连衣裙',
          spec: '艳红色 / XS',
          price: '749.5',
          originalPrice: '1499',
          count: 1,
          img: 'https://osschina.hongsheart.com/20260126/854ae15b-6de0-4e08-b25f-8ca7b904a0a9.jpg?x-oss-process=style/middle',
        },
        {
          title: '2025年冬季100%绵羊毛浅黄色外套',
          spec: '浅黄色 / XS',
          price: '1249.5',
          originalPrice: '2499',
          count: 1,
          img: 'https://osschina.hongsheart.com/20260126/854ae15b-6de0-4e08-b25f-8ca7b904a0a9.jpg?x-oss-process=style/middle',
        },
      ],
    },
    {
      name: 'Koradior',
      count: 1,
      items: [
        {
          title: '经典剪裁西装外套',
          spec: '黑色 / S',
          price: '1899.0',
          originalPrice: '3200',
          count: 1,
          img: 'https://osschina.hongsheart.com/20260126/854ae15b-6de0-4e08-b25f-8ca7b904a0a9.jpg?x-oss-process=style/middle',
        },
      ],
    },
  ],
  remark: '请尽快发货，谢谢！',
  settlement: {
    total: '4898',
    coupon: '0',
    promotion: '1000',
    finalPay: '3898',
  },
  qrCode:
    'https://osschina.hongsheart.com/20260126/854ae15b-6de0-4e08-b25f-8ca7b904a0a9.jpg?x-oss-process=style/middle',
  orderInfo: {
    orderNo: 'MALL20251031000006',
    guide: '11960020 张辰',
    store: '导购门店',
    time: '2025/10/24 18:15',
  },
};

export default {
  data() {
    return {
      canvasWidth: 375,
      canvasHeight: 1300,
      orderData: JSON.parse(JSON.stringify(mockOrderData)),
      showPreview: false,
      posterTempPath: '',
    };
  },
  onReady() {
    const sysInfo = uni.getSystemInfoSync();
    this.canvasWidth = sysInfo.screenWidth;
  },
  methods: {
    // 下载图片
    downloadImage(url) {
      return new Promise((resolve) => {
        if (!url || !url.startsWith('http')) return resolve(url);
        uni.downloadFile({
          url: url,
          success: (res) =>
            resolve(res.statusCode === 200 ? res.tempFilePath : ''),
          fail: () => resolve(''),
        });
      });
    },

    // 主流程
    async startGeneratePoster() {
      uni.showLoading({ title: '准备资源中...', mask: true });
      try {
        const tasks = [];
        this.orderData.shops.forEach((shop) => {
          shop.items.forEach((item) => {
            tasks.push(
              this.downloadImage(item.img).then((p) => (item.localImgPath = p)),
            );
          });
        });
        tasks.push(
          this.downloadImage(this.orderData.qrCode).then(
            (p) => (this.orderData.localQrCodePath = p),
          ),
        );
        await Promise.all(tasks);

        this.canvasHeight = this.calculatePosterHeight();
        await this.$nextTick();

        uni.showLoading({ title: '正在绘制...', mask: true });

        // 使用老版本 API
        const ctx = uni.createCanvasContext('posterCanvas', this);
        this.drawPosterContent(ctx);

        // 绘制并导出
        ctx.draw(false, () => {
          setTimeout(() => {
            this.generateTempImage();
          }, 500);
        });
      } catch (e) {
        console.error(e);
        uni.hideLoading();
      }
    },

    calculatePosterHeight() {
      let h = 120 + 20 + 120;
      this.orderData.shops.forEach((shop) => {
        h += 40;
        shop.items.forEach(() => (h += 110));
      });
      h += 80 + 180 + 380 + 180 + 30;
      return h;
    },

    drawPosterContent(ctx) {
      const CW = this.canvasWidth;
      const PADDING = 0;
      let currentY = 0;

      // 背景
      ctx.setFillStyle('#F5F5F5');
      ctx.fillRect(0, 0, CW, this.canvasHeight);

      // 头部
      const headerHeight = 120;
      ctx.setFillStyle('#C5A678');
      ctx.fillRect(0, currentY, CW, headerHeight);

      ctx.setFillStyle('#FFFFFF');
      ctx.setFontSize(24);
      ctx.fillText(this.orderData.status, PADDING + 20, currentY + 50);

      ctx.setFontSize(14);
      ctx.fillText(this.orderData.userPhone, PADDING + 20, currentY + 85);
      currentY += headerHeight;

      // 白色卡片
      const cardStartY = currentY;
      const cardWidth = CW - PADDING * 2;
      const cardHeight = this.canvasHeight - cardStartY - 20;

      ctx.setFillStyle('#FFFFFF');
      this.drawRoundedRectPath(
        ctx,
        PADDING,
        cardStartY,
        cardWidth,
        cardHeight,
        8,
      );
      ctx.fill();

      // 内容区
      currentY = cardStartY + 20;
      const contentX = PADDING + 15;
      const contentMaxWidth = cardWidth - 30;

      // 1. 收货地址
      ctx.setFillStyle('#333333');
      ctx.setFontSize(15);
      // 模拟粗体
      ctx.fillText('收货地址', contentX, currentY + 10);
      ctx.fillText('收货地址', contentX + 0.5, currentY + 10);

      currentY += 35;
      ctx.setFontSize(14);
      ctx.fillText(
        `${this.orderData.address.userName} ${this.orderData.address.phone}`,
        contentX,
        currentY + 10,
      );
      currentY += 25;
      ctx.setFillStyle('#666666');
      ctx.setFontSize(13);
      currentY = this.drawWrappedText(
        ctx,
        this.orderData.address.detail,
        contentX,
        currentY + 10,
        contentMaxWidth,
        20,
      );

      // 分割线
      ctx.setFillStyle('#f7f7f7');
      this.drawRoundedRectPath(ctx, PADDING, currentY, CW, 8, 0);
      ctx.fill();
      currentY += 25;

      // 2. 店铺和商品
      for (const shop of this.orderData.shops) {
        ctx.setFillStyle('#333333');
        ctx.setFontSize(14);
        ctx.fillText(shop.name, contentX, currentY + 15);
        // 模拟粗体
        ctx.fillText(shop.name, contentX + 0.5, currentY + 15);

        ctx.setFillStyle('#666666');
        ctx.setFontSize(13);
        const countText = `${shop.count} 件`;
        const countTextWidth = ctx.measureText(countText).width;
        ctx.fillText(
          countText,
          CW - PADDING - 15 - countTextWidth,
          currentY + 15,
        );
        currentY += 35;

        // 线条
        ctx.beginPath();
        ctx.moveTo(0, currentY);
        ctx.lineTo(CW - PADDING, currentY);
        ctx.setStrokeStyle('#EEEEEE');
        ctx.setLineWidth(0.5);
        ctx.stroke();
        currentY += 20;

        // 商品项
        for (const item of shop.items) {
          const itemStartY = currentY;

          // --- 图片绘制修复 ---
          if (item.localImgPath) {
            ctx.save();
            // 先画路径
            this.drawRoundedRectPath(ctx, contentX, itemStartY, 80, 80, 6);
            // 再剪切
            ctx.clip();
            // 再画图
            ctx.drawImage(item.localImgPath, contentX, itemStartY, 80, 80);
            ctx.restore();
          } else {
            // 失败占位
            ctx.setFillStyle('#EEEEEE');
            this.drawRoundedRectPath(ctx, contentX, itemStartY, 80, 80, 6);
            ctx.fill();
          }
          // -------------------

          const textX = contentX + 95;
          const textMaxWidthForGoods = contentMaxWidth - 95;

          ctx.setFillStyle('#333333');
          ctx.setFontSize(13);
          let textY = this.drawWrappedText(
            ctx,
            item.title,
            textX,
            itemStartY + 12,
            textMaxWidthForGoods - 30,
            18,
            2,
          );

          ctx.setFillStyle('#999999');
          ctx.setFontSize(11);
          ctx.fillText(item.spec, textX, textY + 5);

          const priceY = itemStartY + 75;
          ctx.setFillStyle('#333333');
          ctx.setFontSize(16);
          ctx.fillText(`¥${item.price}`, textX, priceY);
          ctx.fillText(`¥${item.price}`, textX + 0.5, priceY);
          const priceWidth = ctx.measureText(`¥${item.price}`).width;

          ctx.setFillStyle('#999999');
          ctx.setFontSize(11);
          const originalPriceStr = `¥${item.originalPrice}`;
          const originX = textX + priceWidth + 10;
          ctx.fillText(originalPriceStr, originX, priceY);
          const originalWidth = ctx.measureText(originalPriceStr).width;
          ctx.beginPath();
          ctx.moveTo(originX, priceY - 4);
          ctx.lineTo(originX + originalWidth, priceY - 4);
          ctx.setStrokeStyle('#999999');
          ctx.setLineWidth(1);
          ctx.stroke();

          ctx.setFontSize(12);
          const itemCountText = `x ${item.count}`;
          const itemCountWidth = ctx.measureText(itemCountText).width;
          ctx.fillText(
            itemCountText,
            CW - PADDING - 15 - itemCountWidth,
            itemStartY + 12,
          );

          currentY += 110;
        }
      }

      // 3. 备注
      currentY += 5;
      ctx.setFillStyle('#333333');
      ctx.setFontSize(14);
      ctx.fillText('订单备注', contentX, currentY + 15);
      ctx.fillText('订单备注', contentX + 0.5, currentY + 15);
      currentY += 35;
      ctx.setFontSize(13);
      currentY = this.drawWrappedText(
        ctx,
        this.orderData.remark,
        contentX,
        currentY + 10,
        contentMaxWidth,
        20,
      );
      currentY += 20;

      ctx.setFillStyle('#f7f7f7');
      this.drawRoundedRectPath(ctx, PADDING, currentY, CW, 8, 0);
      ctx.fill();
      currentY += 25;

      // 4. 结算
      ctx.setFillStyle('#333333');
      ctx.setFontSize(15);
      ctx.fillText('结算', contentX, currentY + 15);
      ctx.fillText('结算', contentX + 0.5, currentY + 15);
      currentY += 40;

      const drawSettlementRow = (
        label,
        value,
        isRed = false,
        isBold = false,
      ) => {
        ctx.setFillStyle('#333333');
        ctx.setFontSize(13);
        ctx.fillText(label, contentX, currentY + 10);

        ctx.setFillStyle(isRed ? '#FF0000' : '#333333');
        ctx.setFontSize(isBold ? 14 : 13);
        if (isBold) ctx.setFontSize(16);

        const valStr = isRed ? `- ¥${value}` : `¥ ${value}`;
        const valWidth = ctx.measureText(valStr).width;
        ctx.fillText(valStr, CW - PADDING - 15 - valWidth, currentY + 10);
        if (isBold)
          ctx.fillText(
            valStr,
            CW - PADDING - 15 - valWidth + 0.5,
            currentY + 10,
          );
        currentY += 30;
      };

      drawSettlementRow('商品总价', this.orderData.settlement.total);
      drawSettlementRow('优惠券', this.orderData.settlement.coupon, true);
      drawSettlementRow('促销优惠', this.orderData.settlement.promotion, true);
      currentY += 5;
      drawSettlementRow(
        '实付款',
        this.orderData.settlement.finalPay,
        false,
        true,
      );
      currentY += 30;

      // 5. 二维码
      const qrSize = 160;
      const qrX = (CW - qrSize) / 2;
      if (this.orderData.localQrCodePath) {
        ctx.drawImage(
          this.orderData.localQrCodePath,
          qrX,
          currentY,
          qrSize,
          qrSize,
        );
      }
      currentY += qrSize + 25;

      ctx.setFillStyle('#999999');
      ctx.setFontSize(12);
      const tipText = '长按图片扫码支付';
      const tipWidth = ctx.measureText(tipText).width;
      ctx.fillText(tipText, (CW - tipWidth) / 2, currentY);
      currentY += 40;

      // 6. 订单信息
      ctx.beginPath();
      ctx.moveTo(contentX, currentY);
      ctx.lineTo(CW - PADDING - 15, currentY);
      ctx.setStrokeStyle('#EEEEEE');
      ctx.stroke();
      currentY += 25;

      ctx.setFillStyle('#333333');
      ctx.setFontSize(14);
      ctx.fillText('订单信息', contentX, currentY + 10);
      ctx.fillText('订单信息', contentX + 0.5, currentY + 10);
      currentY += 40;

      const drawInfoRow = (label, value) => {
        ctx.setFillStyle('#666666');
        ctx.setFontSize(12);
        ctx.fillText(label, contentX, currentY + 10);
        const valWidth = ctx.measureText(value).width;
        ctx.fillText(value, CW - PADDING - 15 - valWidth, currentY + 10);
        currentY += 30;
      };

      drawInfoRow('订单编号', this.orderData.orderInfo.orderNo);
      drawInfoRow('服务导购', this.orderData.orderInfo.guide);
      drawInfoRow('下单门店', this.orderData.orderInfo.store);
      drawInfoRow('下单时间', this.orderData.orderInfo.time);
    },

    // 4. 【关键修复】使用 ctx.arc 手动画圆角，修复安卓图片剪切丢失问题
    drawRoundedRectPath(ctx, x, y, w, h, r) {
      ctx.beginPath();
      // 右下
      ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5);
      // 左下
      ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI);
      // 左上
      ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
      // 右上
      ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2);
      ctx.closePath();
    },

    // 5. 换行
    drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 0) {
      const words = text.split('');
      let line = '';
      let currentY = y;
      let lineCount = 0;
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
          if (maxLines > 0 && lineCount >= maxLines - 1) {
            line = line.substring(0, line.length - 1) + '...';
            ctx.fillText(line, x, currentY);
            return currentY + lineHeight;
          }
          ctx.fillText(line, x, currentY);
          line = words[i];
          currentY += lineHeight;
          lineCount++;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
      return currentY + lineHeight;
    },

    // 6. 生成图片
    generateTempImage() {
      uni.canvasToTempFilePath(
        {
          canvasId: 'posterCanvas',
          destWidth: this.canvasWidth * 2,
          destHeight: this.canvasHeight * 2,
          success: (res) => {
            uni.hideLoading();
            this.posterTempPath = res.tempFilePath;
            this.showPreview = true;
          },
          fail: (err) => {
            uni.hideLoading();
            uni.showToast({ title: '生成预览失败', icon: 'none' });
          },
        },
        this,
      );
    },

    closePreview() {
      this.showPreview = false;
    },
    previewBigImage() {
      if (this.posterTempPath)
        uni.previewImage({ urls: [this.posterTempPath] });
    },
    handleSaveToAlbum() {
      if (!this.posterTempPath) return;
      uni.saveImageToPhotosAlbum({
        filePath: this.posterTempPath,
        success: () => uni.showToast({ title: '已保存', icon: 'success' }),
        fail: () => uni.showToast({ title: '保存失败', icon: 'none' }),
      });
    },
    handleSharePoster() {
      if (!this.posterTempPath) return;
      // 尝试调用微信原生分享菜单
      uni.showShareImageMenu({
        path: this.posterTempPath,
        success: () => {
          console.log('分享菜单呼起成功');
        },
        fail: (err) => {
          // 关键：识别企业微信或不支持的环境
          console.log('分享菜单呼起失败', err);
          if (err.errMsg.includes('no permission') || err.errMsg.includes('fail')) {
            uni.showModal({
              title: '提示',
              content: '当前环境暂不支持直接转发，已为您自动保存到相册，请手动发送。',
              showCancel: false,
              success: () => {
                this.handleSaveToAlbum();
              }
            });
          }
        }
      });
    },
  },
};
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 50px;
}
.poster-canvas {
  position: fixed;
  left: -9999px;
  top: 0;
}

/* ================== 预览弹窗 (Flex 布局滚动修复) ================== */
.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
}
.preview-container {
  position: relative;
  z-index: 1000;
  width: 80%;
  height: 80%; /* 限制弹窗高度 */
  background-color: #fff;
  display: flex;
  flex-direction: column; /* 纵向排列 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
}
.preview-header {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  border-bottom: 1px solid #eee;
  background-color: #fff;
  flex-shrink: 0;
}
.close-icon {
  position: absolute;
  right: 15px;
  font-size: 24px;
  color: #999;
  padding: 0 10px;
}

/* 【关键 CSS 修改】 */
.preview-scroll {
  flex: 1; /* 占据剩余空间 */
  height: 0; /* 强制在 Flex 容器中生效，避免被子元素撑大 */
  width: 100%;
  background-color: #f5f5f5;
}

.preview-image {
  width: 100%;
  display: block;
}
.preview-footer {
  padding: 15px;
  background-color: #fff;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}
.save-btn {
  width: 100%;
  height: 44px;
  line-height: 44px;
  border-radius: 22px;
  font-size: 16px;
}
</style>
