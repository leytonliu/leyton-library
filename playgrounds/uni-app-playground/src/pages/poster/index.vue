<template>
  <view class="content">
    <button type="primary" @click="startGeneratePoster" style="margin: 20px">
      生成订单海报
    </button>
    <view style="text-align: center; color: #999; font-size: 14px">
      点击按钮，海报生成后将弹出预览
    </view>

    <canvas
      type="2d"
      id="posterCanvas"
      class="poster-canvas"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
    ></canvas>

    <view class="preview-modal" v-if="showPreview" @touchmove.stop.prevent>
      <view class="preview-mask" @click="closePreview"></view>

      <view class="preview-container">
        <scroll-view scroll-y class="preview-scroll">
          <image
            :src="posterTempPath"
            mode="widthFix"
            class="preview-image"
            @click="previewBigImage"
          />
        </scroll-view>

        <view class="preview-footer">
          <button class="save-btn" type="primary" @click="handleSaveToAlbum">
            保存到相册
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// ================== 模拟数据和工具函数区域 ==================

// 1. 模拟订单数据
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
          title: '2025年冬季100%绵羊毛浅黄色落肩中厚宽松外套',
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
          title: '2025年冬季H型直筒落地红色连衣裙',
          spec: '艳红色 / XS',
          price: '749.5',
          originalPrice: '1499',
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

// 2. 工具函数：下载网络图片
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    if (!url || !url.startsWith('http')) {
      resolve(url);
      return;
    }
    uni.downloadFile({
      url: url,
      success: (res) => {
        if (res.statusCode === 200) resolve(res.tempFilePath);
        else reject(new Error(`Image download failed: ${url}`));
      },
      fail: (err) => reject(err),
    });
  });
}

// 3. 工具函数：绘制圆角矩形路径
function drawRoundedRectPath(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

// 4. 工具函数：绘制圆角图片
function drawRoundedImage(ctx, img, x, y, width, height, radius) {
  ctx.save();
  drawRoundedRectPath(ctx, x, y, width, height, radius);
  ctx.clip();
  ctx.drawImage(img, x, y, width, height);
  ctx.restore();
}

// 5. 工具函数：绘制自动换行文本
function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 0) {
  const words = text.split('');
  let line = '';
  let currentY = y;
  let lineCount = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i];
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && i > 0) {
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
}

// ================== Vue 组件逻辑区域 ==================

export default {
  data() {
    return {
      canvasWidth: 375, // 画布逻辑宽度
      canvasHeight: 1300, // 画布逻辑高度（会动态计算）
      dpr: 1, // 设备像素比
      orderData: mockOrderData,

      // --- 新增预览相关状态 ---
      showPreview: false, // 是否显示弹窗
      posterTempPath: '', // 绘制好的临时图片路径
    };
  },
  onReady() {
    const sysInfo = uni.getSystemInfoSync();
    this.canvasWidth = sysInfo.screenWidth;
    this.dpr = sysInfo.pixelRatio;
  },
  methods: {
    // 1. 主流程：开始准备资源并绘制
    async startGeneratePoster() {
      uni.showLoading({ title: '准备资源中...', mask: true });
      try {
        // 1.1 下载图片资源
        const downloadTasks = [];
        this.orderData.shops.forEach((shop) => {
          shop.items.forEach((item) => {
            downloadTasks.push(
              downloadImage(item.img).then(
                (path) => (item.localImgPath = path),
              ),
            );
          });
        });
        downloadTasks.push(
          downloadImage(this.orderData.qrCode).then(
            (path) => (this.orderData.localQrCodePath = path),
          ),
        );

        await Promise.all(downloadTasks);

        uni.showLoading({ title: '正在绘制...', mask: true });

        // 1.2 获取 Canvas 节点
        const query = uni.createSelectorQuery().in(this);
        query
          .select('#posterCanvas')
          .fields({ node: true, size: true })
          .exec(async (res) => {
            if (!res[0] || !res[0].node) {
              uni.hideLoading();
              uni.showToast({ title: 'Canvas 初始化失败', icon: 'none' });
              return;
            }
            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');

            // 1.3 动态设置高度
            this.canvasHeight = this.calculatePosterHeight();
            await this.$nextTick();

            // 1.4 适配高清屏
            canvas.width = this.canvasWidth * this.dpr;
            canvas.height = this.canvasHeight * this.dpr;
            ctx.scale(this.dpr, this.dpr);

            // 1.5 执行绘制
            await this.drawPosterContent(canvas, ctx);

            // 1.6 生成临时图片供预览 (不再直接保存到相册)
            this.generateTempImage(canvas);
          });
      } catch (error) {
        console.error('海报生成失败:', error);
        uni.hideLoading();
        uni.showToast({ title: '海报生成失败，请检查网络', icon: 'none' });
      }
    },

    // 计算海报高度
    calculatePosterHeight() {
      let h = 120; // 头部
      h += 20; // 间距
      h += 120; // 地址区域
      this.orderData.shops.forEach((shop) => {
        h += 40; // 店铺头
        shop.items.forEach(() => {
          h += 110; // 商品项
        });
      });
      h += 80; // 备注
      h += 180; // 结算
      h += 380; // 二维码
      h += 180; // 订单信息
      h += 30; // 底部留白
      return h;
    },

    // 核心绘制逻辑
    async drawPosterContent(canvas, ctx) {
      const CW = this.canvasWidth;
      const PADDING = 0;
      let currentY = 0;

      // 背景
      ctx.fillStyle = '#F5F5F5';
      ctx.fillRect(0, 0, CW, this.canvasHeight);

      // --- 头部 ---
      const headerHeight = 120;
      ctx.fillStyle = '#C5A678';
      ctx.fillRect(0, currentY, CW, headerHeight);
      // 订单状态
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(this.orderData.status, PADDING + 20, currentY + 50);
      // 用户电话
      ctx.font = '14px sans-serif';
      ctx.fillText(this.orderData.userPhone, PADDING + 20, currentY + 85);
      currentY += headerHeight;

      // --- 白色卡片背景 ---
      const cardStartY = currentY;
      const cardWidth = CW - PADDING * 2;
      const cardHeight = this.canvasHeight - cardStartY - 20;

      ctx.fillStyle = '#FFFFFF';
      drawRoundedRectPath(ctx, PADDING, cardStartY, cardWidth, cardHeight, 8);
      ctx.fill();

      // --- 卡片内容 ---
      currentY = cardStartY + 20;
      const contentX = PADDING + 15;
      const contentMaxWidth = cardWidth - 30;

      // 1. 收货地址
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('收货地址', contentX, currentY + 10);
      currentY += 35;
      // 姓名电话
      ctx.font = '14px sans-serif';
      ctx.fillText(
        `${this.orderData.address.userName} ${this.orderData.address.phone}`,
        contentX,
        currentY + 10,
      );
      currentY += 25;
      // 详细地址
      ctx.fillStyle = '#666666';
      ctx.font = '13px sans-serif';
      currentY = drawWrappedText(
        ctx,
        this.orderData.address.detail,
        contentX,
        currentY + 10,
        contentMaxWidth,
        20,
      );

      // 浅灰色分割间距
      ctx.fillStyle = '#f7f7f7';
      drawRoundedRectPath(ctx, PADDING, currentY, CW, 8, 0);
      ctx.fill();
      currentY += 25;

      // 2. 店铺和商品
      for (const shop of this.orderData.shops) {
        // 店铺名
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(shop.name, contentX, currentY + 15);

        ctx.fillStyle = '#666666';
        ctx.font = '13px sans-serif';
        const countText = `${shop.count} 件`;
        const countTextWidth = ctx.measureText(countText).width;
        ctx.fillText(
          countText,
          CW - PADDING - 15 - countTextWidth,
          currentY + 15,
        );
        currentY += 35;

        // 分割线
        ctx.beginPath();
        ctx.moveTo(0, currentY);
        ctx.lineTo(CW - PADDING, currentY);
        ctx.strokeStyle = '#EEEEEE';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        currentY += 20;



        // 商品项
        for (const item of shop.items) {
          const itemStartY = currentY;
          // 图片
          const img = canvas.createImage();
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
            img.src = item.localImgPath;
          });
          drawRoundedImage(ctx, img, contentX, itemStartY, 80, 80, 6);

          // 文字
          const textX = contentX + 95;
          const textMaxWidthForGoods = contentMaxWidth - 95;

          // 标题
          ctx.fillStyle = '#333333';
          ctx.font = '13px sans-serif';
          let textY = drawWrappedText(
            ctx,
            item.title,
            textX,
            itemStartY + 12,
            textMaxWidthForGoods - 30,
            18,
            2,
          );

          // 规格
          ctx.fillStyle = '#999999';
          ctx.font = '11px sans-serif';
          ctx.fillText(item.spec, textX, textY + 5);

          // 价格
          const priceY = itemStartY + 75;
          ctx.fillStyle = '#333333';
          ctx.font = 'bold 16px sans-serif';
          const priceStr = `¥${item.price}`;
          ctx.fillText(priceStr, textX, priceY);
          const priceWidth = ctx.measureText(priceStr).width;

          // 原价
          ctx.fillStyle = '#999999';
          ctx.font = '11px sans-serif';
          const originalPriceStr = `¥${item.originalPrice}`;
          const originX = textX + priceWidth + 10;
          ctx.fillText(originalPriceStr, originX, priceY);
          const originalWidth = ctx.measureText(originalPriceStr).width;
          ctx.beginPath();
          ctx.moveTo(originX, priceY - 4);
          ctx.lineTo(originX + originalWidth, priceY - 4);
          ctx.strokeStyle = '#999999';
          ctx.lineWidth = 1;
          ctx.stroke();

          // 数量
          ctx.font = '12px sans-serif';
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
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('订单备注', contentX, currentY + 15);
      currentY += 35;
      ctx.font = '13px sans-serif';
      currentY = drawWrappedText(
        ctx,
        this.orderData.remark,
        contentX,
        currentY + 10,
        contentMaxWidth,
        20,
      );
      currentY += 20;

      // 浅灰色分割间距
      ctx.fillStyle = '#f7f7f7';
      drawRoundedRectPath(ctx, PADDING, currentY, CW, 8, 0);
      ctx.fill();
      currentY += 25;

      // 4. 结算

      ctx.fillStyle = '#333333';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('结算', contentX, currentY + 15);
      currentY += 40;

      const drawSettlementRow = (
        label,
        value,
        isRed = false,
        isBold = false,
      ) => {
        ctx.fillStyle = '#333333';
        ctx.font = '13px sans-serif';
        ctx.fillText(label, contentX, currentY + 10);
        ctx.fillStyle = isRed ? '#FF0000' : '#333333';
        ctx.font = isBold ? 'bold 14px sans-serif' : '13px sans-serif';
        const valStr = isRed ? `- ¥${value}` : `¥ ${value}`;
        const valWidth = ctx.measureText(valStr).width;
        ctx.fillText(valStr, CW - PADDING - 15 - valWidth, currentY + 10);
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
      const qrImg = canvas.createImage();
      await new Promise((resolve) => {
        qrImg.onload = resolve;
        qrImg.onerror = resolve;
        qrImg.src = this.orderData.localQrCodePath;
      });
      ctx.drawImage(qrImg, qrX, currentY, qrSize, qrSize);
      currentY += qrSize + 25;

      ctx.fillStyle = '#999999';
      ctx.font = '12px sans-serif';
      const tipText = '长按图片扫码支付';
      const tipWidth = ctx.measureText(tipText).width;
      ctx.fillText(tipText, (CW - tipWidth) / 2, currentY);
      currentY += 40;

      // 6. 订单信息
      ctx.beginPath();
      ctx.moveTo(contentX, currentY);
      ctx.lineTo(CW - PADDING - 15, currentY);
      ctx.strokeStyle = '#EEEEEE';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      currentY += 25;

      ctx.fillStyle = '#333333';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('订单信息', contentX, currentY + 10);
      currentY += 40;

      const drawInfoRow = (label, value) => {
        ctx.fillStyle = '#666666';
        ctx.font = '12px sans-serif';
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

    // 导出 Canvas 图片临时路径并显示预览
    generateTempImage(canvas) {
      uni.canvasToTempFilePath({
        canvas: canvas,
        success: (res) => {
          uni.hideLoading();
          this.posterTempPath = res.tempFilePath;
          this.showPreview = true;
        },
        fail: (err) => {
          uni.hideLoading();
          console.error('生成图片失败', err);
          uni.showToast({ title: '生成预览失败', icon: 'none' });
        },
      });
    },

    // 关闭预览
    closePreview() {
      this.showPreview = false;
    },

    // 点击大图预览
    previewBigImage() {
      if (this.posterTempPath) {
        uni.previewImage({
          urls: [this.posterTempPath],
        });
      }
    },

    // 保存到相册
    handleSaveToAlbum() {
      if (!this.posterTempPath) return;
      uni.showLoading({ title: '保存中...' });

      uni.saveImageToPhotosAlbum({
        filePath: this.posterTempPath,
        success: () => {
          uni.hideLoading();
          uni.showToast({ title: '已保存到相册', icon: 'success' });
          // 保存成功后可以选择关闭弹窗，或者留着让用户自己关
          // this.showPreview = false;
        },
        fail: (err) => {
          uni.hideLoading();
          console.error('保存相册失败', err);
          if (
            err.errMsg.includes('auth deny') ||
            err.errMsg.includes('authorize:fail')
          ) {
            uni.showModal({
              title: '提示',
              content: '需要您授权保存图片到相册，请在设置中开启权限。',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  uni.openSetting();
                }
              },
            });
          } else {
            uni.showToast({ title: '保存失败，请重试', icon: 'none' });
          }
        },
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
  left: 9000px;
  top: 0;
}

/* ================== 预览弹窗样式 ================== */
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
  width: 80%; /* 弹窗占屏幕宽度的 80% */
  height: 80%; /* 弹窗占屏幕高度的 80% */
  background-color: #fff;

  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.preview-header {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  border-bottom: 1px solid #eee;
  position: relative;
  background-color: #fff;
  flex-shrink: 0; /* 防止头部被压缩 */
}

.close-btn {
  position: absolute;
  right: 15px;
  top: 0;
  height: 50px;
  line-height: 50px;
  font-size: 24px;
  color: #999;
  padding: 0 10px;
}

.preview-scroll {
  flex: 1; /* 占据中间剩余的所有空间 */
  background-color: #f5f5f5;
  width: 100%;
  height: 0; /* 配合 flex:1 使用，确保 scroll-view 高度生效 */
}

.preview-image {
  width: 100%;
  display: block;
  /* 高度自适应 */
}

.preview-footer {
  padding: 15px;
  background-color: #fff;
  border-top: 1px solid #eee;
  flex-shrink: 0; /* 防止底部被压缩 */
}

.save-btn {
  width: 100%;
  height: 44px;
  line-height: 44px;
  border-radius: 22px;
  font-size: 16px;
}
</style>
