import { Component, lazy, Suspense, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { DocumentRecord } from '../../core/types'
import type { SkinDefinition } from '../types'
import { articleBody, getSiteLabel } from '../../core/content'
import { Codicon, MarkdownContent, CodeEditor, SkinSwitcher } from '../shared'
import { VscodeLogo } from '../../logos'
import { lang } from '../../i18n'
import { ChevronDown, ChevronRight } from 'lucide-react'

// Monaco (the real VS Code editor) is lazy-loaded so its ~1MB only downloads
// when the VS Code skin actually shows a document; the static CodeEditor is the
// fallback while it loads or if the chunk/worker fails.
const MonacoCode = lazy(() => import('../../monacoCode'))

class MonacoBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) return this.props.fallback
    return <Suspense fallback={this.props.fallback}>{this.props.children}</Suspense>
  }
}

// ===== BLOCK APPENDED BELOW =====
const vscMenus = ['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help']

export function VscMenuBar() {
  return (
    <div className="vsc-menubar">
      <span className="vsc-menubar-brand">
        <VscodeLogo size={17} />
      </span>
      {vscMenus.map((item) => (
        <span
          key={item}
          className={item === 'File' ? 'is-clickable' : undefined}
          data-appmenu={item === 'File' ? 'file' : undefined}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

export function ActivityBar() {
  return (
    <div className="vsc-activity">
      <button type="button" className="vsc-act is-active" aria-label="Explorer">
        <Codicon name="files" size={24} />
      </button>
      <button type="button" className="vsc-act" aria-label="Search">
        <Codicon name="search" size={24} />
      </button>
      <button type="button" className="vsc-act" aria-label="Source Control">
        <Codicon name="source-control" size={24} />
        <span className="vsc-act-badge">1</span>
      </button>
      <button type="button" className="vsc-act" aria-label="Run and Debug">
        <Codicon name="debug-alt" size={24} />
      </button>
      <button type="button" className="vsc-act" aria-label="Extensions">
        <Codicon name="extensions" size={24} />
      </button>
      <button type="button" className="vsc-act vsc-act-bottom" aria-label="Accounts">
        <Codicon name="account" size={24} />
      </button>
      <button type="button" className="vsc-act" aria-label="Settings">
        <Codicon name="settings-gear" size={24} />
      </button>
    </div>
  )
}

// Easter-egg files a curious user can click in the Explorer. They open in the
// code editor just like a real source file — in-character dev humor that also
// teaches the app's hidden controls. Localized: a Chinese reader finding
// English-only jokes is its own disguise break.
const vscodeEggsZh: Record<string, string> = {
  'README.md': `# SneakRead · 摸鱼

在工位上读完整个互联网，伪装成你本来就开着的那些软件。

## 为什么
因为"我在看文档"这句话，应该更经常是真的。

## 怎么用
1. 粘贴一个网址。
2. 挑一个伪装——VS Code、Word、飞书、Notion、钉钉、Excel……
3. 有人走过来的瞬间，按 \`Esc\`。

## 说明
- 100% 本地运行，没有服务器知道你读了什么。
- 阅读源自动切换：Jina -> Firecrawl，哪个通用哪个。

MIT 开源。现在，去读点什么吧。`,
  'FAQ.md': `# 摸鱼 — 常见问题

## 这算摸鱼吗？
这算*阅读*。你已经盯着同一个工单发呆 40 分钟了——读点东西反而更诚实。

## 老板能看出来吗？
除非他有凑近读 Markdown 源码的爱好。他走近时按 **Esc**，屏幕瞬间变成 Q3 预算表。

## 会上传我的数据吗？
没有后端。一切都在你的浏览器里。你的阅读清单只属于你。

## 开大会用哪个伪装最好？
Excel。没人敢打断一个对着表格皱眉的人。`,
  'TODO.md': `# TODO

- [x] 打开电脑
- [x] 摆出专注的表情
- [x] 再读一篇（就一篇）
- [ ] 回复那封邮件
- [ ] 正经工作
- [x] 续杯咖啡
- [ ] 别再刷世界杯了   <- 世界杯而已，不怪我`,
  '.secrets.md': `# 你发现了秘密文件

直觉不错。这里是没人告诉你的：

- **Esc** —— 一键切成预算表，再按一次切回来。
- **Cmd/Ctrl + K** —— 不碰鼠标就能打开任何网址。
- 文章里的每个链接都能点，边读边逛，全程不脱伪装。
- **文件**菜单是真的：语言、分享链接、失焦自动隐藏，都在里面。

好了，装作无事发生。

---

_SneakRead 是真开源（MIT）——这年头不多了。点个 star：_
_https://github.com/SneakRead/sneakread_

_作者：刘小排 · 公众号 刘小排r · X @bourneliu66_
_我还做了 Raphael AI —— 免费 AI 生图 —— https://raphael.app_`,
}

const vscodeEggsEn: Record<string, string> = {
  'README.md': `# SneakRead

Read the entire web at your desk, disguised as the tools you already have open.

## Why
Because "I'm reading the docs" should be true more often.

## How
1. Paste a URL.
2. Pick a disguise — VS Code, Word, Google Docs, Notion, Slack, Lark, Excel, Outlook.
3. Press \`Esc\` the instant someone walks by.

## Notes
- 100% client-side. No server ever sees your reading list.
- Reader fallback: Jina -> Firecrawl, whichever your network allows.

MIT licensed. Now go read something.`,
  'FAQ.md': `# SneakRead — FAQ

## Is this cheating?
It's *reading*. You've been staring at the same ticket for 40 minutes — this is
more honest.

## Can my boss tell?
Only if they read Markdown source for fun. Press **Esc** if they approach and the
screen flips to a Q3 budget spreadsheet instantly.

## Does it phone home?
No backend. Everything runs in your browser. Your reading list stays yours.

## Best disguise for a big meeting?
Excel. Nobody interrupts someone frowning at a spreadsheet.`,
  'TODO.md': `# TODO

- [x] Open laptop
- [x] Look focused
- [x] Read one (1) more article
- [ ] Reply to that email
- [ ] Actual work
- [x] Refill coffee
- [ ] Stop refreshing r/soccer   <- World Cup, not my fault`,
  '.secrets.md': `# You found the secrets file

Nice instinct. Here's what nobody tells you:

- **Esc** — panic button. Instant budget spreadsheet.
- **Cmd/Ctrl + K** — paste any URL without touching the mouse.
- Every link in the article is clickable. Keep browsing, never leave the disguise.
- The **File** menu is real: language, share link, boss auto-hide — all in there.

Now act natural.

---

_SneakRead is open source (MIT) — genuinely, which is rare. Star it:_
_https://github.com/SneakRead/sneakread_

_Built by 刘小排 (Liu Xiaopai) · WeChat 刘小排r · X @bourneliu66_
_Also by me: Raphael AI — free AI image generation — https://raphael.app_`,
}

const vscodeEggs = lang === 'zh' ? vscodeEggsZh : vscodeEggsEn

// Approximate VS Code's default (Seti) file-icon theme: a per-extension glyph
// with the theme's signature colors, so the tree reads like the real Explorer.
function treeIconName(name: string) {
  if (/\.tsx?$/.test(name)) return 'file-code'
  if (/\.json$/.test(name)) return 'json'
  if (/\.md$/.test(name)) return 'markdown'
  return 'file'
}
function treeIconColor(name: string) {
  if (/\.tsx?$/.test(name)) return '#4d9fd6'
  if (/\.json$/.test(name)) return '#e0c53d'
  if (/\.md$/.test(name)) return '#6a9fb5'
  return '#9aa0a6'
}

function buildVscodeFiles(doc: DocumentRecord) {
  const sourceFile = doc.fileName.endsWith('.md') ? doc.fileName : 'source.md'
  return [
    { name: 'README.md', level: 0, egg: 'README.md' },
    { name: 'FAQ.md', level: 0, egg: 'FAQ.md' },
    { name: 'src', level: 0, folder: true },
    { name: sourceFile, level: 1, active: true },
    { name: 'index.ts', level: 1 },
    { name: 'reader.ts', level: 1 },
    { name: 'data', level: 0, folder: true },
    { name: 'links.json', level: 1 },
    { name: 'meta.json', level: 1 },
    { name: 'TODO.md', level: 0, egg: 'TODO.md' },
    { name: '.secrets.md', level: 0, egg: '.secrets.md' },
    { name: 'package.json', level: 0 },
    { name: 'tsconfig.json', level: 0 },
  ] as { name: string; level: number; active?: boolean; folder?: boolean; egg?: string }[]
}

export function VscodeSkin({ doc }: { doc: DocumentRecord }) {
  const sourceFile = doc.fileName.endsWith('.md') ? doc.fileName : 'source.md'
  const body = articleBody(doc)
  // Default to the code view (the disguise); the Preview tab flips to rendered.
  // Links are clickable in both views.
  const [view, setView] = useState<'code' | 'preview'>('code')
  // An open easter-egg file (README/FAQ/TODO/secrets) shown in the editor
  // instead of the article; null = the article itself.
  const [openEgg, setOpenEgg] = useState<string | null>(null)
  const files = buildVscodeFiles(doc)
  const eggBody = openEgg ? vscodeEggs[openEgg] : null
  const openSource = () => setOpenEgg(null)
  const outline = useMemo(() => {
    const matches = Array.from(body.matchAll(/^(#{1,4})\s+(.+)$/gm))
    if (!matches.length) return [{ title: 'Overview', line: 1, level: 1 }]
    return matches.slice(0, 60).map((match) => ({
      title: match[2].replace(/\s+#+$/, '').trim(),
      line: body.slice(0, match.index ?? 0).split('\n').length,
      level: match[1].length,
    }))
  }, [body])
  const terminal = [
    `$ jina read ${getSiteLabel(doc.sourceUrl)}`,
    `✓ fetched via r.jina.ai reader cache`,
    `✓ parsed ${doc.summary.words} words · ${doc.summary.links} links · ${doc.summary.images} images`,
    `$ npm run dev`,
    `  VITE ready in 214 ms  ➜  http://localhost:5173/`,
  ]

  return (
    <div className="vsc">
      <VscMenuBar />
      <div className="vsc-body">
        <ActivityBar />
        <aside className="vsc-side">
          <div className="vsc-side-title">
            EXPLORER
            <span>⋯</span>
          </div>
          <div className="vsc-tree-group">
            <div className="vsc-tree-head">
              <ChevronDown size={13} aria-hidden="true" /> OPEN EDITORS
            </div>
            <button type="button" className="vsc-file is-active" style={{ paddingLeft: 24 }}>
              <Codicon name="markdown" size={16} />
              <span>{sourceFile}</span>
              <em className="dot" />
            </button>
          </div>
          <div className="vsc-tree-group">
            <div className="vsc-tree-head">
              <Codicon name="chevron-down" size={16} /> {doc.projectName.toUpperCase()}
            </div>
            {files.map((file) => {
              const isActive = file.egg ? openEgg === file.egg : file.active && !openEgg
              return (
              <button
                key={`${file.level}-${file.name}`}
                type="button"
                className={isActive ? 'vsc-file is-active' : 'vsc-file'}
                style={{ paddingLeft: 16 + file.level * 14 }}
                onClick={
                  file.egg
                    ? () => {
                        setOpenEgg(file.egg as string)
                        setView('code')
                      }
                    : file.active
                      ? openSource
                      : undefined
                }
              >
                {file.folder ? (
                  <Codicon name="chevron-right" size={16} />
                ) : (
                  <span className="vsc-ficon" style={{ color: treeIconColor(file.name) }}>
                    <Codicon name={treeIconName(file.name)} size={16} />
                  </span>
                )}
                <span>{file.name}</span>
                {isActive && <em className="dot" />}
              </button>
              )
            })}
          </div>
          <div className="vsc-tree-group">
            <div className="vsc-tree-head">
              <ChevronDown size={13} aria-hidden="true" /> OUTLINE
            </div>
            {outline.slice(0, 24).map((item) => (
              <button
                key={`${item.line}-${item.title}`}
                type="button"
                className="vsc-outline"
                style={{ paddingLeft: 20 + (item.level - 1) * 12 }}
              >
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="vsc-editor">
          <div className="vsc-tabs">
            <button
              type="button"
              className={view === 'code' && !openEgg ? 'vsc-tab is-active' : 'vsc-tab'}
              onClick={() => {
                openSource()
                setView('code')
              }}
            >
              <Codicon name="markdown" size={16} />
              {sourceFile}
              <em className="dot" />
            </button>
            <button
              type="button"
              className={view === 'preview' && !openEgg ? 'vsc-tab is-active' : 'vsc-tab'}
              onClick={() => {
                openSource()
                setView('preview')
              }}
            >
              <Codicon name="preview" size={16} />
              Preview {sourceFile}
            </button>
            {openEgg && (
              <button type="button" className="vsc-tab is-active">
                <Codicon name="markdown" size={16} />
                {openEgg}
                <em
                  className="vsc-tab-close"
                  role="button"
                  aria-label="Close"
                  onClick={(event) => {
                    event.stopPropagation()
                    openSource()
                  }}
                >
                  ×
                </em>
              </button>
            )}
            <div className="vsc-tab-actions">
              <button type="button" aria-label="Run">
                <Codicon name="play" size={16} />
              </button>
              <button
                type="button"
                aria-label="Toggle preview"
                onClick={() => setView((v) => (v === 'code' ? 'preview' : 'code'))}
              >
                <Codicon name="split-horizontal" size={16} />
              </button>
              <span aria-hidden="true">⋯</span>
            </div>
          </div>
          <div className="vsc-breadcrumb">
            <span>{doc.projectName}</span>
            <ChevronRight size={12} aria-hidden="true" />
            {openEgg ? (
              <span>{openEgg}</span>
            ) : (
              <>
                <span>src</span>
                <ChevronRight size={12} aria-hidden="true" />
                <span>{sourceFile}</span>
              </>
            )}
          </div>
          <div className={view === 'code' ? 'vsc-editor-scroll is-monaco' : 'vsc-editor-scroll'}>
            {view === 'code' ? (
              <MonacoBoundary fallback={<CodeEditor text={eggBody ?? body} baseUrl={openEgg ? undefined : doc.sourceUrl} />}>
                <MonacoCode text={eggBody ?? body} />
              </MonacoBoundary>
            ) : (
              <div className="vsc-render markdown-body">
                {!openEgg && <SkinSwitcher className="vsc-switch" />}
                {!openEgg && <h1>{doc.title}</h1>}
                <MarkdownContent markdown={eggBody ?? body} baseUrl={openEgg ? undefined : doc.sourceUrl} />
              </div>
            )}
          </div>
          <div className="vsc-panel">
            <div className="vsc-panel-tabs">
              <button type="button">PROBLEMS</button>
              <button type="button">OUTPUT</button>
              <button type="button" className="is-active">
                <Codicon name="terminal" size={14} /> TERMINAL
              </button>
              <button type="button">PORTS</button>
            </div>
            <pre className="vsc-terminal">{terminal.join('\n')}</pre>
          </div>
        </section>
      </div>

      <div className="vsc-status">
        <span className="vsc-status-remote">
          <Codicon name="remote" size={14} />
        </span>
        <span className="vsc-status-accent">
          <Codicon name="git-branch" size={13} /> main
        </span>
        <span>
          <Codicon name="sync" size={13} /> 0↓ 0↑
        </span>
        <span>
          <Codicon name="error" size={13} /> 0 <Codicon name="warning" size={13} /> 0
        </span>
        <span className="vsc-status-right">Ln 1, Col 1</span>
        <span>Spaces: 2</span>
        <span>UTF-8</span>
        <span>LF</span>
        <span>
          Markdown <Codicon name="check" size={13} />
        </span>
        <span>
          <Codicon name="bell" size={13} />
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Word
 * ------------------------------------------------------------------ */



/* ------------------------------------------------------------------ *
 * Google Docs
 * ------------------------------------------------------------------ */


const vscode: SkinDefinition = {
  id: 'vscode',
  label: 'VS Code',
  appName: 'Visual Studio Code',
  fileExtension: 'md',
  accent: '#007acc',
  faviconGlyph: '<>',
  Surface: VscodeSkin,
}
export default vscode
