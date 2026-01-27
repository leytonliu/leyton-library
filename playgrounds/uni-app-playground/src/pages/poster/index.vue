<template>
  <view class="content">
    <button type="primary" @click="startGeneratePoster" style="margin: 20px">
      生成订单海报
    </button>
    <view style="text-align: center; color: #999; font-size: 14px"
      >点击按钮，海报将在后台生成并自动保存到相册</view
    >

    <canvas
      type="2d"
      id="posterCanvas"
      class="poster-canvas"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
    ></canvas>
  </view>
</template>

<script>
// ================== 模拟数据和工具函数区域 ==================

// 1. 模拟订单数据 (实际开发中请替换为接口返回的数据)
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
          // 使用占位图，实际请换成你的图片链接 (需配置小程序 download 域名白名单)
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
  // 使用占位二维码
  qrCode:
    'https://osschina.hongsheart.com/20260126/854ae15b-6de0-4e08-b25f-8ca7b904a0a9.jpg?x-oss-process=style/middle',
  orderInfo: {
    orderNo: 'MALL20251031000006',
    guide: '11960020 张辰',
    store: '导购门店',
    time: '2025/10/24 18:15',
  },
};

// 2. 工具函数：下载网络图片到本地临时路径
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    // 如果是空或本地路径，直接返回
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

// 3. 工具函数：绘制圆角矩形路径 (用于裁切或填充背景)
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
  ctx.save(); // 保存当前画布状态
  drawRoundedRectPath(ctx, x, y, width, height, radius); // 创建圆角路径
  ctx.clip(); // 裁切
  ctx.drawImage(img, x, y, width, height); // 绘制图片
  ctx.restore(); // 恢复画布状态
}

// 5. 工具函数：绘制自动换行的文本
// 返回绘制完成后的新 Y 坐标
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
      // 需要换行
      if (maxLines > 0 && lineCount >= maxLines - 1) {
        // 超出最大行数，显示省略号并结束
        line = line.substring(0, line.length - 1) + '...';
        ctx.fillText(line, x, currentY);
        return currentY + lineHeight;
      }
      ctx.fillText(line, x, currentY); // 绘制当前行
      line = words[i]; // 新的一行从当前字开始
      currentY += lineHeight;
      lineCount++;
    } else {
      line = testLine; // 继续追加字符
    }
  }
  ctx.fillText(line, x, currentY); // 绘制最后一行
  return currentY + lineHeight;
}

// ================== Vue 组件逻辑区域 ==================

export default {
  data() {
    return {
      canvasWidth: 375, // 默认宽度
      canvasHeight: 1300, // 初始给一个足够大的高度，后面会动态计算
      dpr: 1, // 设备像素比
      orderData: mockOrderData, // 数据源
    };
  },
  onReady() {
    // 获取系统信息，设置画布基准宽度和像素比
    const sysInfo = uni.getSystemInfoSync();
    this.canvasWidth = sysInfo.screenWidth;
    this.dpr = sysInfo.pixelRatio;
  },
  methods: {
    // 主流程：开始生成海报
    async startGeneratePoster() {
      uni.showLoading({ title: '准备资源中...', mask: true });
      try {
        // 1. 并发下载所有需要的图片资源
        const downloadTasks = [];
        // 下载商品图片
        this.orderData.shops.forEach((shop) => {
          shop.items.forEach((item) => {
            downloadTasks.push(
              downloadImage(item.img).then(
                (path) => (item.localImgPath = path),
              ),
            );
          });
        });
        // 下载二维码
        downloadTasks.push(
          downloadImage(this.orderData.qrCode).then(
            (path) => (this.orderData.localQrCodePath = path),
          ),
        );

        await Promise.all(downloadTasks);

        uni.showLoading({ title: '正在绘制...', mask: true });

        // 2. 获取 Canvas 2D 节点和上下文
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

            // 3. 动态计算海报总高度并设置
            this.canvasHeight = this.calculatePosterHeight();
            // 等待 Vue 更新 DOM 样式中的 height
            await this.$nextTick();

            // 4. 适配高清屏 (DPR)
            canvas.width = this.canvasWidth * this.dpr;
            canvas.height = this.canvasHeight * this.dpr;
            ctx.scale(this.dpr, this.dpr);

            // 5. 执行核心绘制逻辑
            await this.drawPosterContent(canvas, ctx);

            // 6. 导出图片并保存到相册
            this.savePosterToAlbum(canvas);
          });
      } catch (error) {
        console.error('海报生成失败:', error);
        uni.hideLoading();
        uni.showToast({ title: '海报生成失败，请检查网络', icon: 'none' });
      }
    },

    // 估算海报总高度 (用于设置 Canvas 高度)
    calculatePosterHeight() {
      let h = 120; // 头部高度
      h += 20; // 头部与卡片间距
      h += 120; // 地址区域估算
      // 商品区域估算
      this.orderData.shops.forEach((shop) => {
        h += 40; // 店铺标题
        shop.items.forEach(() => {
          h += 110; // 商品项高度 + 间距
        });
      });
      h += 80; // 订单备注估算
      h += 180; // 结算区域估算
      h += 380; // 二维码区域估算
      h += 180; // 底部信息区域估算
      h += 30; // 底部留白
      return h;
    },

    // 核心绘制逻辑
    async drawPosterContent(canvas, ctx) {
      const CW = this.canvasWidth;
      const PADDING = 0; // 页面左右边距
      let currentY = 0; // Y轴游标，控制绘制位置

      // --- 绘制背景 ---
      ctx.fillStyle = '#F5F5F5';
      ctx.fillRect(0, 0, CW, this.canvasHeight);

      // --- 1. 头部区域 ---
      const headerHeight = 120;
      ctx.fillStyle = '#C5A678'; // 原型图的金色
      ctx.fillRect(0, currentY, CW, headerHeight);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(this.orderData.status, PADDING + 5, currentY + 50);
      ctx.font = '14px sans-serif';
      ctx.fillText(this.orderData.userPhone, PADDING + 5, currentY + 85);

      currentY += headerHeight;

      // --- 2. 绘制白色卡片背景 ---
      const cardStartY = currentY + 10;
      const cardWidth = CW - PADDING * 2;
      // 卡片高度延伸到底部留一些空隙
      const cardHeight = this.canvasHeight - cardStartY - 20;

      ctx.fillStyle = '#FFFFFF';
      drawRoundedRectPath(ctx, PADDING, cardStartY, cardWidth, cardHeight, 8);
      ctx.fill(); // 填充白色背景

      // --- 卡片内部内容绘制 ---
      currentY = cardStartY + 20; // 更新游标到卡片内部起始位置
      const contentX = PADDING + 15; // 内部内容左边距
      const contentMaxWidth = cardWidth - 30; // 内部内容最大宽度

      // [收货地址]
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('收货地址', contentX, currentY + 10);
      currentY += 35;
      ctx.font = '14px sans-serif';
      ctx.fillText(
        `${this.orderData.address.userName} ${this.orderData.address.phone}`,
        contentX,
        currentY + 10,
      );
      currentY += 25;
      ctx.fillStyle = '#666666';
      ctx.font = '13px sans-serif';
      // 地址支持多行换行
      currentY = drawWrappedText(
        ctx,
        this.orderData.address.detail,
        contentX,
        currentY + 10,
        contentMaxWidth,
        20,
      );
      currentY += 15;

      // [商品列表循环]
      for (const shop of this.orderData.shops) {
        // 店铺标题
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(shop.name, contentX, currentY + 15);
        // 店铺商品总数 (右对齐)
        ctx.fillStyle = '#666666';
        ctx.font = '13px sans-serif';
        const countText = `${shop.count} 件`;
        const countTextWidth = ctx.measureText(countText).width;
        ctx.fillText(
          countText,
          CW - PADDING - 15 - countTextWidth,
          currentY + 15,
        );

        currentY += 45;
        
        // 店铺分割线
        ctx.beginPath();
        ctx.moveTo(contentX, currentY);
        ctx.lineTo(CW - PADDING - 15, currentY);
        ctx.strokeStyle = '#EEEEEE';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        currentY += 20;

        // 商品项循环
        for (const item of shop.items) {
          const itemStartY = currentY;
          // a. 绘制圆角商品图 (需要先创建 image 对象)
          const img = canvas.createImage();
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // 失败也继续，避免卡死
            img.src = item.localImgPath;
          });
          drawRoundedImage(ctx, img, contentX, itemStartY, 80, 80, 6);

          // b. 商品文字信息
          const textX = contentX + 95;
          const textMaxWidthForGoods = contentMaxWidth - 95;

          // 标题 (最多2行)
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

          // 原价 (带删除线)
          ctx.fillStyle = '#999999';
          ctx.font = '11px sans-serif';
          const originalPriceStr = `¥${item.originalPrice}`;
          const originX = textX + priceWidth + 10;
          ctx.fillText(originalPriceStr, originX, priceY);
          // 画删除线
          const originalWidth = ctx.measureText(originalPriceStr).width;
          ctx.beginPath();
          ctx.moveTo(originX, priceY - 4);
          ctx.lineTo(originX + originalWidth, priceY - 4);
          ctx.strokeStyle = '#999999';
          ctx.lineWidth = 1;
          ctx.stroke();

          // 数量 (右对齐)
          ctx.font = '12px sans-serif';
          const itemCountText = `x ${item.count}`;
          const itemCountWidth = ctx.measureText(itemCountText).width;
          ctx.fillText(
            itemCountText,
            CW - PADDING - 15 - itemCountWidth,
            itemStartY + 12,
          );

          currentY += 110; // 商品高度 + 间距
        }
      }

      // [订单备注]
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

      // [结算区域]
      // 分割线
      ctx.beginPath();
      ctx.moveTo(contentX, currentY);
      ctx.lineTo(CW - PADDING - 15, currentY);
      ctx.strokeStyle = '#EEEEEE';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      currentY += 20;

      ctx.fillStyle = '#333333';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('结算', contentX, currentY + 15);
      currentY += 40;

      // 绘制结算行的辅助函数
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

      // [二维码区域]
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

      // [底部订单信息]
      // 分割线
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

      // 绘制完成
    },

    // 导出 Canvas 内容并保存到相册
    savePosterToAlbum(canvas) {
      uni.canvasToTempFilePath({
        canvas: canvas, // Canvas 2D 必须传入 canvas 实例
        success: (res) => {
          uni.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              uni.hideLoading();
              uni.showToast({ title: '已保存到相册', icon: 'success' });
            },
            fail: (err) => {
              uni.hideLoading();
              console.error('保存相册失败', err);
              // 处理用户未授权的情况
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
        fail: (err) => {
          uni.hideLoading();
          console.error('导出图片失败', err);
          uni.showToast({ title: '海报导出失败', icon: 'none' });
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
  /* 将 canvas 移出屏幕可视区域，但不要使用 display:none */
  position: fixed;
  left: 9000px;
  top: 0;
  /* 宽高通过 JS 动态设置 style */
}
</style>
