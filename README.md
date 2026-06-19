# 🔑 API 余额

一个查看和管理 API 密钥余额的手机 PWA 应用。

- 支持 OpenAI、Anthropic、DeepSeek、OpenRouter、Groq、Google AI 等
- 实时查看余额、使用量、速率限制
- PIN 码保护密钥安全
- 数据全部保存在本机
- 可添加到手机主屏幕，像原生 App 一样使用

## 📱 安装到手机

### 方法一：GitHub Pages（推荐，免费）

1. Fork 或上传此文件夹到 GitHub 仓库
2. 在仓库 Settings → Pages → Source 选择 `main` 分支，保存
3. 等几分钟，获得 `https://你的用户名.github.io/仓库名` 地址
4. 用手机浏览器打开这个地址
5. **Android**: Chrome 菜单 → 添加到主屏幕
6. **iPhone**: Safari → 分享 → 添加到主屏幕

### 方法二：同 WiFi 本地访问

```bash
# 进入目录
cd api-balance-app

# 启动代理服务器（解决浏览器 CORS 限制）
node server.js

# 或者用 Python
python3 -m http.server 8000
```

然后在手机上打开 `http://电脑IP:端口`

### 方法三：部署到 Vercel（免费）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

点击上方按钮一键部署，获得 HTTPS 地址。

## ⚠️ CORS 说明

大多数 API 服务商（OpenAI、Anthropic 等）不允许浏览器直接调用。解决方案：

1. **使用 `server.js` 代理**（本地或部署到服务器）
2. **使用 OpenRouter** 作为中转（支持 CORS 更好）
3. **部署到 Vercel/Cloudflare Workers** 配合代理

在应用中可配置 Base URL 指向你的代理地址。

## 🛠 本地开发

```bash
node server.js
# 访问 http://localhost:3456/index.html
```
