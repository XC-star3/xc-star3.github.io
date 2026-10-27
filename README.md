# XC's Homepage

XC-star3(XC)的作品集。正式网址：[https://xc-star3.github.io/](https://xc-star3.github.io/)。

原生 HTML / CSS / JavaScript，无后端、无运行时框架。支持中英切换、明暗主题、项目展示和首页开场导览。HTML 包含预生成的中文正文，禁用 JavaScript 时也可阅读。Node.js 仅用于生成和验证，发布时直接托管静态文件。

## 本地预览与检查

```bash
python scripts/serve.py
```

打开 `http://localhost:8080`。开发需要 Node.js 24+ 和 Python 3：

```bash
npm ci --include=dev
npm run generate
npm run check
npm test
npx playwright install chromium
npm run test:browser
```

修改内容后运行 `generate`，将生成结果一并提交。`check` 检查翻译、资源、锚点、SEO、公开作者名称和脚本语法；`test` 检查生成结果与源文件一致；浏览器测试覆盖主题、语言故障与竞态、无 JS 阅读、博客跳转、开场键盘操作和移动布局。GitHub Actions 在 push / pull request 时执行检查；main 分支检查通过后自动部署。

Windows 可通过 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 指向已有的 Chromium；未设置时使用 Playwright 安装的浏览器。

## 博客入口

博客暂未开放，导航和首页按钮会显示“博客网站还在开发”。只保留 `pages/posts/index.html` 一个提示页，不进入搜索索引或 sitemap。

收到正式博客地址后，在 `site.config.json.blogUrl` 中填写 HTTP(S) 网址，运行 `npm run generate` 并发布。按钮将直接链接到博客网站，提示页通过脚本及 meta refresh 自动跳转。留空则保留提示页。提示页模板位于 `templates/blog-placeholder.html`。

## 文件与修改位置

| 文件 | 用途 |
|---|---|
| `index.html`、`pages/projects/` | 首页与项目详情的页面结构 |
| `pages/posts/` | 唯一的博客提示页 `index.html`，由生成器更新 |
| `assets/js/site-data.js` | 项目、开源仓库、时间线、奖项、技术栈、联系方式 |
| `assets/js/render.js` | 首页内容渲染，供浏览器和静态生成共用 |
| `assets/js/main.js` | 主题、语言按钮、博客跳转、开场及动效 |
| `assets/js/opening-data.js` | 首页开场文案 |
| `assets/js/shared.js` | 路径、选择器、安全存储与翻译工具 |
| `assets/js/i18n.js` | 语言加载、缓存、超时和并发保护 |
| `lang/zh.json`、`lang/en.json` | 页面文案与项目详情正文，两种语言需保持相同键 |
| `assets/css/style.css` | 主题变量、布局和组件样式 |
| `site.config.json` | 正式域名、作者、分享图片、博客网址 |
| `scripts/`、`tests/` | 生成、静态检查与浏览器验证 |

`fallback-zh.js`、`site-config.js`、HTML 动态容器、SEO、sitemap.xml 和 robots.txt 均由 `npm run generate` 更新，请编辑对应源数据。项目详情可编辑 HTML 布局；其 `data-i18n` 文案修改两份语言 JSON。

## 维护约定

- 保留页面 head 中的内联主题脚本，避免首屏闪烁；未保存偏好时跟随系统主题。
- 中文兜底包随页面加载；英文请求超时或失败时回到中文。存储被禁用时交互仍可用，但偏好不跨页保存。
- 首页在标签页会话首次访问时显示单页开场，展示 4 秒后自动关闭，可随时跳过；时长在 `opening-data.js` 的 `durationMs` 配置。减少动效偏好会跳过。`?intro=1` 强制播放，`?nointro=1&noreveal=1` 跳过。增强脚本失败时 6 秒后解除页面遮挡。
- 保留 `data-i18n`、`data-title-i18n` 及首页渲染容器的选择器；语言更新通过 `i18nLoaded` 触发。
- 翻译内容允许可信 HTML，不要拼接未经处理的外部输入。头像路径区分大小写：`assets/images/Avatar.jpg`。
- 项目图片使用 `assets/images/projects/` 下的压缩图。Font Awesome 6 通过 BootCDN 加载，网络不可用时装饰图标可能缺失。
- 公开联系方式为 `209358371@qq.com` 和 `github.com/XC-star3`，不公开手机号。
- 页面、翻译、图片替代文本及作者元数据统一使用 XC 或 XC-star3，不填写真实姓名。提交作者使用 GitHub 名称和 noreply 邮箱。

## 发布

仓库为 [XC-star3/xc-star3.github.io](https://github.com/XC-star3/xc-star3.github.io)，正式站点为 [xc-star3.github.io](https://xc-star3.github.io/)。GitHub Pages 的发布来源使用 GitHub Actions。

`.github/workflows/deploy.yml` 在 main 分支推送时安装依赖，执行静态检查、生成一致性检查和浏览器测试，再运行 `npm run build`。通过后上传 `_site/` 并部署；pull request 只验证，不部署。也可在 Actions 页面手动运行工作流。

`_site/` 仅包含页面、资源、语言文件、站点地图和 robots.txt；README、测试和开发脚本不进入网站发布包。服务器无需安装 Node.js，`.nojekyll` 避免额外模板处理。更换域名或部署子路径时，更新 `site.config.json.url`（末尾保留 `/`），重新生成并发布。搜索与分享元数据使用中文静态版本。
