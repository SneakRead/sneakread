// Chrome + content primitives shared across skins: icon helpers, MarkdownContent,
// the static code editor, Windows caption buttons, and the Microsoft-365 title
// bar / ribbon frame. Imports only libs + logos — never the app shell — so there
// are no cycles.
import { useMemo } from 'react'
import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { WordLogo, ExcelLogo } from '../../logos'
import {
  Save20Regular,
  ArrowUndo20Regular,
  ArrowRedo20Regular,
  ClipboardPaste24Regular,
  Cut20Regular,
  Copy20Regular,
  TextBold20Regular,
  TextItalic20Regular,
  TextUnderline20Regular,
  TextStrikethrough20Regular,
  Highlight20Regular,
  TextColor20Regular,
  TextBulletList20Regular,
  TextNumberListLtr20Regular,
  TextAlignLeft20Regular,
  TextAlignCenter20Regular,
  TextAlignRight20Regular,
  TextAlignJustify20Regular,
  Search20Regular,
} from '@fluentui/react-icons'

// ===== EXTRACTED BLOCKS APPENDED BELOW =====
export function MSym({ name, className }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-rounded${className ? ` ${className}` : ''}`} aria-hidden="true">
      {name}
    </span>
  )
}

// VS Code's real icon font (Codicons) — pixel-accurate to the editor.
export function Codicon({ name, size }: { name: string; size?: number }) {
  return (
    <i
      className={`codicon codicon-${name}`}
      style={size ? { fontSize: size } : undefined}
      aria-hidden="true"
    />
  )
}

export function MarkdownContent({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ children, href }) => (
          <a href={href} rel="noreferrer">
            {children}
          </a>
        ),
        img: ({ alt, src }) => <img alt={alt || ''} loading="lazy" src={src || ''} />,
      }}
    >
      {markdown}
    </ReactMarkdown>
  )
}

export function escapeHtml(value: string) {
  // Escapes quotes too: highlightMarkdownLine interpolates URLs into href="…"
  // and this output is fed to dangerouslySetInnerHTML, so attribute-breaking
  // quotes from arbitrary scraped markdown must not survive.
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function highlightMarkdownLine(line: string) {
  if (line.trim() === '') return ' '
  const escaped = escapeHtml(line)
  if (/^\s*#{1,6}\s/.test(line)) return `<span class="tok-heading">${escaped}</span>`
  if (/^\s*>/.test(line)) return `<span class="tok-quote">${escaped}</span>`
  if (/^\s*\|/.test(line)) return `<span class="tok-table">${escaped}</span>`
  let html = escaped
  // Links become real anchors so you can click through in the editor too —
  // the stage delegation turns the click into in-app disguised navigation.
  // The (?<!!) skips image syntax ![alt](url) so image alts aren't linked.
  html = html.replace(
    /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, text: string, url: string) =>
      `<a href="${url}" rel="noreferrer" class="tok-link">[${text}]</a><span class="tok-link-url">(${url})</span>`,
  )
  html = html.replace(/\*\*([^*]+)\*\*/g, '<span class="tok-strong">**$1**</span>')
  html = html.replace(/`([^`]+)`/g, '<span class="tok-code">`$1`</span>')
  html = html.replace(/^(\s*[-*+]\s)/, '<span class="tok-punct">$1</span>')
  return html
}

export function CodeEditor({ text }: { text: string }) {
  const lines = useMemo(() => text.split('\n'), [text])
  return (
    <div className="code-editor">
      <div className="code-gutter" aria-hidden="true">
        {lines.map((_, i) => (
          <span key={i}>{i + 1}</span>
        ))}
      </div>
      <pre className="code-lines">
        {lines.map((line, i) => (
          <code key={i} dangerouslySetInnerHTML={{ __html: highlightMarkdownLine(line) }} />
        ))}
      </pre>
    </div>
  )
}

export function WindowButtons() {
  return (
    <div className="win-buttons" aria-hidden="true">
      <span className="win-btn">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <line x1="0" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1" />
        </svg>
      </span>
      <span className="win-btn">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <rect x="0.5" y="0.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </span>
      <span className="win-btn win-close">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <line x1="0.5" y1="0.5" x2="9.5" y2="9.5" stroke="currentColor" strokeWidth="1" />
          <line x1="9.5" y1="0.5" x2="0.5" y2="9.5" stroke="currentColor" strokeWidth="1" />
        </svg>
      </span>
    </div>
  )
}

export const wordTabs = [
  'File',
  'Home',
  'Insert',
  'Draw',
  'Design',
  'Layout',
  'References',
  'Mailings',
  'Review',
  'View',
  'Help',
]

export function MsTitleBar({ fileName, app, accent }: { fileName: string; app: string; accent: string }) {
  const logo =
    app === 'Word' ? <WordLogo size={18} /> : app === 'Excel' ? <ExcelLogo size={18} /> : null
  return (
    <div className="ms-titlebar" style={{ background: accent }}>
      <div className="ms-qat">
        {logo}
        <span className="ms-autosave" title="AutoSave">
          <span className="ms-autosave-track">
            <span className="ms-autosave-knob" />
          </span>
          AutoSave
        </span>
        <button type="button" aria-label="Save">
          <Save20Regular />
        </button>
        <button type="button" aria-label="Undo">
          <ArrowUndo20Regular />
        </button>
        <button type="button" aria-label="Redo">
          <ArrowRedo20Regular />
        </button>
      </div>
      <div className="ms-doctitle">
        <span className="ms-doctitle-name">{fileName}</span>
        <span className="ms-doctitle-sub">Saved to OneDrive</span>
      </div>
      <div className="ms-search">
        <Search20Regular />
        <span>Search</span>
        <span className="ms-search-kbd">Alt+Q</span>
      </div>
      <div className="ms-titlebar-right">
        <span className="ms-account">M</span>
        <WindowButtons />
      </div>
    </div>
  )
}

// The Comments / Share cluster pinned to the right edge of the ribbon tab strip.
export function MsRibbonRight() {
  return (
    <>
      <span className="ms-tabs-cmd">Comments</span>
      <span className="ms-tabs-share">Share ▾</span>
    </>
  )
}

export function MsRibbonTabs({
  tabs,
  active,
  accent,
  right,
}: {
  tabs: string[]
  active: number
  accent: string
  right?: ReactNode
}) {
  return (
    <div className="ms-ribbon-tabs" style={{ background: accent }}>
      {tabs.map((tab, i) => (
        <span
          key={tab}
          className={i === active ? 'is-active' : i === 0 ? 'ms-file-tab' : undefined}
          data-appmenu={i === 0 ? 'file' : undefined}
        >
          {tab}
        </span>
      ))}
      {right && <div className="ms-tabs-right">{right}</div>}
    </div>
  )
}

// The full Word window (title bar + ribbon + ruler + status), reused by both the
// article skin and the Word home so they share one chrome.
export function WordFrame({
  fileName,
  statusWords,
  children,
}: {
  fileName: string
  statusWords?: number
  children: ReactNode
}) {
  return (
    <div className="msapp word">
      <MsTitleBar fileName={fileName} app="Word" accent="#2b579a" />
      <MsRibbonTabs tabs={wordTabs} active={1} accent="#2b579a" right={<MsRibbonRight />} />
      <div className="ms-ribbon word-ribbon">
        <div className="ms-group">
          <div className="ms-row">
            <button type="button" className="ms-btn-lg">
              <ClipboardPaste24Regular />
              <span>Paste</span>
            </button>
            <div className="ms-col">
              <button type="button" className="ms-btn-row">
                <Cut20Regular /> Cut
              </button>
              <button type="button" className="ms-btn-row">
                <Copy20Regular /> Copy
              </button>
            </div>
          </div>
          <div className="ms-group-name">Clipboard</div>
        </div>

        <div className="ms-group">
          <div className="ms-col">
            <div className="ms-row ms-font-row">
              <span className="ms-fontbox">Aptos (Body)</span>
              <span className="ms-sizebox">11</span>
            </div>
            <div className="ms-row">
              <button type="button" className="ms-btn-sm">
                <TextBold20Regular />
              </button>
              <button type="button" className="ms-btn-sm">
                <TextItalic20Regular />
              </button>
              <button type="button" className="ms-btn-sm">
                <TextUnderline20Regular />
              </button>
              <button type="button" className="ms-btn-sm">
                <TextStrikethrough20Regular />
              </button>
              <button type="button" className="ms-btn-sm ms-btn-hl">
                <Highlight20Regular />
              </button>
              <button type="button" className="ms-btn-sm ms-btn-color">
                <TextColor20Regular />
              </button>
            </div>
          </div>
          <div className="ms-group-name">Font</div>
        </div>

        <div className="ms-group">
          <div className="ms-col">
            <div className="ms-row">
              <button type="button" className="ms-btn-sm">
                <TextBulletList20Regular />
              </button>
              <button type="button" className="ms-btn-sm">
                <TextNumberListLtr20Regular />
              </button>
            </div>
            <div className="ms-row">
              <button type="button" className="ms-btn-sm">
                <TextAlignLeft20Regular />
              </button>
              <button type="button" className="ms-btn-sm">
                <TextAlignCenter20Regular />
              </button>
              <button type="button" className="ms-btn-sm">
                <TextAlignRight20Regular />
              </button>
              <button type="button" className="ms-btn-sm">
                <TextAlignJustify20Regular />
              </button>
            </div>
          </div>
          <div className="ms-group-name">Paragraph</div>
        </div>

        <div className="ms-group ms-group-grow">
          <div className="ms-styles">
            {['Normal', 'No Spacing', 'Heading 1', 'Heading 2', 'Title'].map((s, i) => (
              <span key={s} className={i === 0 ? 'ms-style is-active' : 'ms-style'}>
                {s}
              </span>
            ))}
          </div>
          <div className="ms-group-name">Styles</div>
        </div>

        <div className="ms-group">
          <div className="ms-col">
            <button type="button" className="ms-btn-row">
              <Search20Regular /> Find
            </button>
            <button type="button" className="ms-btn-row">
              Replace
            </button>
            <button type="button" className="ms-btn-row">
              Select
            </button>
          </div>
          <div className="ms-group-name">Editing</div>
        </div>
      </div>
      <div className="word-ruler" aria-hidden="true" />
      <div className="paper-canvas">{children}</div>
      <div className="ms-status word-status">
        <span>Page 1 of 4</span>
        <span>{statusWords ?? 0} words</span>
        <span>English (US)</span>
        <span className="ms-status-right">100%</span>
      </div>
    </div>
  )
}

