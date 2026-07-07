# SneakRead · 摸鱼

**Read the web at your desk, disguised as the tool you already have open.**

[![GitHub Repo stars](https://img.shields.io/github/stars/SneakRead/sneakread?style=flat&logo=github)](https://github.com/SneakRead/sneakread) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE) · [sneakread.com](https://sneakread.com) · 100% client-side, no backend, no account · [中文](README.zh.md)

Paste any public URL. SneakRead reads it through `r.jina.ai`, then renders it **full-screen as a real desktop app** — VS Code, Claude Code, Word, WPS, Google Docs, Notion, Slack, Lark/Feishu, DingTalk, Teams, Gmail, Excel, or Outlook — so reading looks like working. Brand: **SneakRead** globally, **摸鱼** in Chinese.

![The BBC World Cup homepage, rendered as a Word document — live word count, real ribbon, real status bar](docs/screenshots/en-word.jpg)

<sup>↑ The BBC World Cup homepage, as a `.docx`. The word count in the status bar is real.</sup>

The design goal is 以假乱真 (indistinguishable from the real thing), modelled on
[remoteok.com/vscode](https://remoteok.com/vscode) / `/docx` / `/docs`:

- **One app fills the whole viewport** at `/` — the landing *is* the reader, defaulting to the Word disguise. No wrapper — only the target app's own title bar (with the real brand logo), ribbon/activity bar, and status bar. (`/app` is a legacy alias that redirects to `/`.)
- **Every control is hidden** behind the disguise's real **File menu** and a command palette (`⌘K` / `⌘P`): open URLs, switch apps, language, refresh, fullscreen, panic.
- **Boss key.** Press `Esc` (or lose window focus with Boss auto-hide on) to instantly flip to a plausible `Q3 Budget Review.xlsx`. `Esc` again restores.
- **Continuous browsing.** Every skin has clickable links; clicking one loads it through the reader in the *current* disguise.
- The browser tab title and favicon match the disguise, never the brand.

## Landing & SEO

The marketing pages are static, prerendered, and localized into 10 languages,
yet **themselves disguised** — the landing IS the reader's Word home (a
Getting-Started document with a live URL box and the 14-skin dock; every other
disguise is one click away as a full-screen live preview):

- `/`, `/zh`, `/es`, `/hi`, `/ar`, `/pt`, `/ru`, `/ja`, `/fr`, `/de` — each static HTML with localized `<title>`/description, canonical, `hreflang` (+ `x-default`), Open Graph, and `FAQPage` JSON-LD. `sitemap.xml` + `robots.txt` included.
- Features and FAQ are real, crawlable text rendered inside the disguise.
- The `/app` alias is `noindex`; opened documents live in the `#u=…` hash, never a crawlable path.

## Getting around

- **The File menu is real.** Every skin's `File` opens a working menu: Open URL, Home, Open as (each app), **Language**, Refresh, Fullscreen, Boss auto-hide, Panic, and "What is Moyu?".
- **Command menu** (`⌘K` / `⌘P`): the same actions for keyboard users; paste a URL to open it.
- **In-app browsing.** Click any link inside a document and it loads through the reader in the *current* skin, so you browse article to article without ever leaving the disguise. `⌘/Ctrl`-click opens the real page in a new tab.
- **First-run onboarding** explains the three controls, once, then never again.
- **Localized** into the browser's language across the top 10 (en, zh, es, hi, ar, pt, ru, ja, fr, de); switchable from File ▸ Language. Disguise chrome stays in its native app language.

## Skins

| Skin | Looks like | Content shape |
| --- | --- | --- |
| Word | title bar, ribbon, ruler, paper on canvas, status bar | clean article |
| VS Code | full workbench: activity bar, explorer, **real Monaco editor**, terminal, minimap | source markdown |
| Claude Code | macOS terminal running the AI coding agent: tool calls, streamed answer, context meter | article as an agent reply |
| Google Docs | doc top bar, menu, toolbar pill, page | clean article |
| Notion | sidebar, List-view database, right peek panel with properties | article as a page |
| Lark Docs / 飞书文档 | breadcrumbs, outline rail, AI summary chip, share button, optional name watermark | clean doc |
| Slack | aubergine rail, channel list, message stream, composer | article as a thread of messages |
| Lark / 飞书 | nav sidebar, chat list, group conversation with read receipts | article as group messages |
| DingTalk / 钉钉 | icon rail, chat list, group chat with 已读 receipts and DING | article as group messages |
| WPS 文字 | multi-tab strip, Chinese ribbon, A4 paper, member crown | clean article (Chinese chrome) |
| Excel | ribbon, formula bar, real grid, sheet tabs | data table if present, else audit sheet |
| Outlook | folders, message list, reading pane | article as an email |
| Teams | purple rail, channel Posts tab, reply chain | article as a channel post |
| Gmail | Material top bar, label sidebar, open conversation, smart replies | article as a newsletter |

New pages open as Word by default, and you can switch the disguise anytime from
the File menu, the command palette, or the hover-to-reveal switcher at the top of
any article. Set **File ▸ Display name** and every disguise wears *your* name —
avatars, the Notion workspace, and a Feishu-style tiled watermark.

### The same article, wearing different faces

| | |
| --- | --- |
| ![Claude Code skin](docs/screenshots/en-claude-code.jpg) **Claude Code** — the article arrives as an agent reply, tool calls and all | ![Notion skin](docs/screenshots/en-notion.jpg) **Notion** — a page inside a database, properties included |
| ![Slack skin](docs/screenshots/en-slack.jpg) **Slack** — split into a believable run of messages | ![Gmail skin](docs/screenshots/en-gmail.jpg) **Gmail** — a newsletter, smart replies included |
| ![Teams skin](docs/screenshots/en-teams.jpg) **Teams** — a channel post with replies | ![In-character loading](docs/screenshots/en-loading.jpg) **Even loading stays in character** — a document skeleton, never a spinner |

### The boss key

Press `Esc` (or let auto-hide trigger on window blur) and the screen flips to a
plausible quarterly budget — real formulas, a real chart, twelve months of cash
flow. Press `Esc` again to resume reading.

![The boss key: a believable Q3 budget spreadsheet with formulas and a chart](docs/screenshots/en-boss-key.jpg)

## Privacy, honestly

No backend, no account, no cookies of our own. What you read is fetched by your
browser and stays in your browser (localStorage). The public site loads
Microsoft Clarity and Google Analytics for anonymous usage analytics — which
*product* features are used (skins, boss key, samples), never the articles you
read, never full URLs (hostnames and bucketed counts only), never anything you
type. Both load lazily after first paint and only on sneakread.com; block them
freely, nothing breaks. The self-hosted build sends nothing.

## Stack

- **Vite + React + TypeScript**, no backend — everything runs in the browser.
- **Reader with front-end fallback**: Jina (`r.jinaai.cn` → `r.jina.ai`) → Firecrawl (keyless). Network-adaptive order, remembers the last-good provider, per-provider timeouts + cooldowns. No API key ever ships in the client.
- **Real vendor assets** for pixel fidelity: [Monaco](https://microsoft.github.io/monaco-editor/) (the actual VS Code editor, lazy-loaded) for the VS Code skin, [Codicons](https://github.com/microsoft/vscode-codicons), [Fluent UI icons](https://github.com/microsoft/fluentui-system-icons) for Office, [Material Symbols](https://fonts.google.com/icons) for Docs, and self-hosted metric-compatible fonts (Inter/Carlito/Roboto/Cascadia Code).
- React Markdown + GFM for rendered content; a modelled FY P&L (with formulas + chart) for the boss-key sheet.
- Dependency-free i18n across 10 languages; SSG landing pages via a small prerender script.

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:5173  (the landing IS the reader)
pnpm build      # static site into dist/ (client + prerendered landing pages)
```

## Contribute a skin

SneakRead is built to be extended — **new disguises are the most welcome kind of
contribution.** A skin is a [`SkinDefinition`](src/skins/types.ts) (id, label, app
name, accent, its own `Logo`) plus a React component that renders a
`DocumentRecord` as that app. Each of the fourteen built-in disguises lives in its
own [`src/skins/<name>/`](src/skins/) folder — component, `style.css`, and logo
together — and auto-registers via `import.meta.glob`; copy
[`src/skins/_template/`](src/skins/_template/) to start. See
**[CONTRIBUTING.md](CONTRIBUTING.md)** for the interface, the add-a-skin
walkthrough, and the 以假乱真 fidelity checklist.

## Author

Built by **刘小排 (Liu Xiaopai)** — an indie hacker shipping small, useful things.

- 微信公众号（WeChat）: **刘小排r**
- X / Twitter: [@bourneliu66](https://twitter.com/bourneliu66)
- Also by me: **[Raphael AI](https://raphael.app)** — free AI image generation.

If SneakRead saved you from a boring meeting, a ⭐ on GitHub means a lot — genuinely
open-source apps like this are rare.

## License

[MIT](LICENSE) © 2026 SneakRead · 刘小排 (Liu Xiaopai)

---

中文说明见 **[README.zh.md](README.zh.md)**。
