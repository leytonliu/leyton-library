## 更新 iconfont

第一步：下载字体文件
在 iconfont.cn 的项目页面。

1. 点击 “下载至本地”。

2. 解压下载的压缩包，找到 iconfont.ttf 这个文件（它是体积最小、兼容性最好的源文件）。

第二步：在线转换 (推荐使用 Transfonter)
这是前端开发最常用的字体转换工具，免费且好用。

1. 打开网站：https://transfonter.org/

2. 点击 "Add fonts" -> 上传刚才的 iconfont.ttf。

3. 关键设置（必看）：

   - Formats: 勾选 WOFF2 (体积最小) 和 WOFF (兼容性好)。

   - Base64 encode: 必须开启 (ON) —— 这就是你要找的开关！

4. 点击 "Convert"。

5. 点击 "Download"。

第三步：替换 CSS

1. 下载并解压 Transfonter 生成的包。

2. 打开里面的 stylesheet.css。

3. 你会看到一段很长的代码，以 data:application/font-woff2;base64,... 开头。

4. 复制这段 @font-face 代码。

5. 粘贴并覆盖你项目中 src/static/styles/iconfont.css 里的 @font-face 部分。
