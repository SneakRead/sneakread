# SneakRead · 摸鱼

**在工位上读整个互联网，伪装成你本来就开着的那个软件。**

[![GitHub Repo stars](https://img.shields.io/github/stars/SneakRead/sneakread?style=flat&logo=github)](https://github.com/SneakRead/sneakread) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE) · [sneakread.com](https://sneakread.com) · 纯前端、无后端、无账号 · [English](README.md)

粘贴任意公开网址，SneakRead 通过阅读器把它抓成正文，然后**全屏渲染成一个真实的桌面软件** —— VS Code、Claude Code、Word、WPS、Google Docs、Notion、Slack、飞书、钉钉、Teams、Gmail、Excel 或 Outlook —— 让「看网页」看起来像「在工作」。品牌：全球叫 **SneakRead**，中文叫 **摸鱼**。

设计目标是**以假乱真**（和最新版的真软件像素级一致），对标 [remoteok.com/vscode](https://remoteok.com/vscode)：

- **一个软件占满整个视口**（`/` 就是阅读器，`/app` 只是旧链接别名）。没有多余外壳 —— 只有目标软件自己的标题栏（带真实品牌 logo）、功能区/活动栏、状态栏。
- **所有控制都藏在伪装的真实 File 菜单**和命令面板（`⌘K` / `⌘P`）里：打开网址、切换软件、切语言、刷新、全屏、一键老板键。
- **老板键**：按 `Esc`（或开启失焦自动隐藏后切走窗口）瞬间翻成一张像模像样的 `Q3 Budget Review.xlsx`（真·财务模型，带公式和图表）。再按 `Esc` 还原。
- **连续浏览**：每个皮肤里的链接都可点，点一下就用**当前伪装**继续加载下一篇。
- 浏览器标签页的标题和 favicon 也跟着伪装走，绝不暴露品牌。

## 皮肤

| 皮肤 | 伪装成 | 内容形态 |
| --- | --- | --- |
| Word | 标题栏、Colorful 功能区、标尺、画布上的纸张、状态栏 | 干净的文章 |
| VS Code | 完整工作台：活动栏、资源管理器、**真 Monaco 编辑器**、终端、minimap | 源码 markdown |
| Claude Code | 跑着 AI 编码助手的 macOS 终端：工具调用、流式回答、context 余量 | 文章当成 AI 的回答 |
| Google Docs | 文档顶栏、菜单、药丸工具栏、页面 | 干净的文章 |
| Notion | 侧栏、List view 数据库、右侧 peek 面板与属性区 | 文章当成一个页面 |
| 飞书文档 | 面包屑、目录栏、AI 速览、分享按钮、可选署名水印 | 干净的云文档 |
| Slack | 深紫侧栏、频道列表、消息流、输入框 | 文章拆成一串消息 |
| 飞书 | 导航侧栏、会话列表、群聊（带已读回执） | 文章拆成群消息 |
| 钉钉 | 图标导航、会话列表、群聊（已读 n/23 + DING） | 文章拆成群消息 |
| WPS 文字 | 多标签页、全中文功能区、A4 纸、会员皇冠 | 干净的文章（中文界面） |
| Excel | 功能区、公式栏、真实网格、工作表标签 | 有表格就渲染表格，否则渲染审计表 |
| Outlook | 应用轨、文件夹、邮件列表、阅读窗格 | 文章当成一封邮件 |
| Teams | 紫色应用轨、频道 Posts、回复链 | 文章当成频道帖子 |
| Gmail | Material 顶栏、标签侧栏、打开的会话、智能回复 | 文章当成一封 newsletter |

在 **文件 ▸ 伪装署名** 里填上你的名字，所有伪装都会「穿上」它——头像、Notion
工作区名，以及飞书文档的企业风平铺水印。

## 隐私（说实话版）

无后端、无账号、无自家 Cookie。你读的内容由你的浏览器直接抓取、只存在你的
浏览器里（localStorage）。官网加载了 Microsoft Clarity 和 Google Analytics
做匿名使用分析——只看产品功能的使用情况（皮肤、老板键、示例），绝不涉及你读
的文章：不传完整网址（只有域名和分桶计数）、不传标题、不传你输入的任何内容。
两者都在首屏渲染完成后才懒加载、只在 sneakread.com 上启用；屏蔽它们不影响任
何功能。自部署版本不发送任何数据。

## 技术栈

- **Vite + React + TypeScript**，无后端，全部跑在浏览器里。
- **前端阅读器兜底**：Jina（`r.jinaai.cn` → `r.jina.ai`）→ Firecrawl（免 key）。按网络自适应排序、记住上次可用的源、各自超时 + 失败冷却。**前端绝不放 API key。**
- **真·厂商素材**做像素级保真：[Monaco](https://microsoft.github.io/monaco-editor/)（VS Code 的真编辑器内核，懒加载）、[Codicons](https://github.com/microsoft/vscode-codicons)、[Fluent 图标](https://github.com/microsoft/fluentui-system-icons)、[Material Symbols](https://fonts.google.com/icons)，以及自托管的度量兼容字体（Inter/Carlito/Roboto/Cascadia Code）。
- 10 种语言的零依赖 i18n；落地页用小脚本预渲染（SSG）。

## 开发

```bash
pnpm install
pnpm dev        # http://localhost:5173  → / 就是阅读器
pnpm build      # 打成 dist/ 静态站点
```

## 贡献一个皮肤

SneakRead 就是为「被扩展」而设计的 —— **新皮肤是最受欢迎的贡献**。每个皮肤都是 [`src/skins/`](src/skins/) 下一个自包含模块：一份定义（id、名称、logo、主色）加一个把 `DocumentRecord` 渲染成那个软件的 React 组件。复制模板、把它做得像真的、提 PR 即可。接口和清单见 **[CONTRIBUTING.md](CONTRIBUTING.md)**。

## 作者

由 **刘小排（Liu Xiaopai）** 开发 —— 一个做小而有用产品的独立开发者。

- 微信公众号：**刘小排r**
- X / Twitter：[@bourneliu66](https://twitter.com/bourneliu66)
- 我的另一个产品：**[Raphael AI](https://raphael.app)** —— 免费 AI 生图。

如果 SneakRead 帮你熬过了一场无聊的会，给个 ⭐ 我会很开心 —— 真·开源的这类产品，真的不多。

## 协议

[MIT](LICENSE) © 2026 SneakRead · 刘小排（Liu Xiaopai）
