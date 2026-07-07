import type { DocumentRecord } from '../../core/types'
import type { SkinDefinition } from '../types'
import { articleBody, clockLabel, extractOutline, minutesAgo } from '../../core/content'
import { getAlias, aliasInitial } from '../../core/alias'
import { MarkdownContent, SkinSwitcher } from '../shared'
import { lang } from '../../i18n'
import {
  PanelLeftClose,
  House,
  ChevronRight,
  Pin,
  Globe,
  Bell,
  MoreHorizontal,
  Search,
  Plus,
  ChevronsLeft,
  Bookmark,
  Sparkles,
} from 'lucide-react'

// Feishu (China) vs Lark (international) — the app is literally rebranded by
// region, so the chrome text follows the language. Non-zh falls back to Lark/EN.
const STR = {
  zh: {
    space: '知识库',
    external: '外部',
    share: '分享',
    outline: '目录',
    saved: '已保存',
    shortcut: '添加快捷方式',
    ai: 'AI 速览',
    trial: '试用',
  },
  en: {
    space: 'Wiki',
    external: 'External',
    share: 'Share',
    outline: 'Outline',
    saved: 'Saved',
    shortcut: 'Add shortcut',
    ai: 'AI Summary',
    trial: 'Beta',
  },
}

// "Last edited …" derived from the real clock (a fixed fake time is the tell).
function editedLabel(zh: boolean) {
  const stamp = clockLabel(minutesAgo(37))
  return zh ? `最近修改：今天 ${stamp}` : `Last edited today at ${stamp}`
}

// Enterprise Feishu tiles the viewer's name across every doc — the single
// strongest "this is a real corporate doc" signal. Rendered only when the user
// set a display name (File ▸ Display name…), as a repeating SVG tile.
function watermarkTile(text: string) {
  const safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="170">` +
    `<text x="120" y="90" font-family="-apple-system,'PingFang SC','Segoe UI',sans-serif" ` +
    `font-size="14" fill="rgba(31,35,41,0.05)" text-anchor="middle" ` +
    `transform="rotate(-20 120 90)">${safe}</text></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

export function LarkDocsSkin({ doc }: { doc: DocumentRecord }) {
  const body = articleBody(doc)
  const t = lang === 'zh' ? STR.zh : STR.en
  const title = doc.title
  const workspace = doc.projectName || t.space
  const outline = extractOutline(body)
  const alias = getAlias()

  return (
    <div className="lark-docs">
      {alias && (
        <div
          className="ld-watermark"
          aria-hidden="true"
          style={{ backgroundImage: watermarkTile(alias) }}
        />
      )}
      <header className="ld-topbar">
        <div className="ld-top-left">
          <button type="button" className="ld-ic" aria-label="Menu">
            <PanelLeftClose size={18} />
          </button>
          <button type="button" className="ld-ic" aria-label="Home">
            <House size={18} />
          </button>
          <div className="ld-title-block">
            <div className="ld-crumbs">
              <span className="ld-crumb">{t.space}</span>
              <ChevronRight size={13} className="ld-crumb-sep" aria-hidden="true" />
              <span className="ld-crumb">{workspace}</span>
              <ChevronRight size={13} className="ld-crumb-sep" aria-hidden="true" />
              <span className="ld-crumb ld-crumb-cur">{title}</span>
              <span className="ld-badge">{t.external}</span>
              <span className="ld-pin" aria-hidden="true">
                <Pin size={13} />
              </span>
            </div>
            <div className="ld-meta">
              <span className="ld-shortcut">
                <Bookmark size={13} />
                {t.shortcut}
              </span>
              <span className="ld-meta-edited">{editedLabel(lang === 'zh')}</span>
            </div>
          </div>
        </div>
        <div className="ld-top-right">
          <button type="button" className="ld-share">
            <Globe size={15} />
            {t.share}
          </button>
          <button type="button" className="ld-ic" aria-label="Notifications">
            <Bell size={18} />
          </button>
          <button type="button" className="ld-ic" data-appmenu="file" aria-label="More">
            <MoreHorizontal size={18} />
          </button>
          <span className="ld-sep" aria-hidden="true" />
          <button type="button" className="ld-ic" aria-label="Search">
            <Search size={18} />
          </button>
          <button type="button" className="ld-ic" aria-label="New">
            <Plus size={18} />
          </button>
          <span className="ld-avatar">{aliasInitial()}</span>
        </div>
      </header>

      <div className="ld-body">
        {outline.length > 0 && (
          <aside className="ld-outline" aria-label={t.outline}>
            <div className="ld-outline-head">
              <span className="ld-outline-name">{title}</span>
              <ChevronsLeft size={16} className="ld-outline-collapse" aria-hidden="true" />
            </div>
            <div className="ld-outline-list">
              {outline.map((h, i) => (
                <div
                  key={`${h.text}-${i}`}
                  className={i === 0 ? 'ld-outline-item is-active' : 'ld-outline-item'}
                  data-level={h.level}
                >
                  {h.text}
                </div>
              ))}
            </div>
          </aside>
        )}

        <div className="ld-canvas">
          <article className="ld-page markdown-body">
            <SkinSwitcher className="ld-switch" />
            <h1 className="ld-doc-title">{title}</h1>
            <button type="button" className="ld-ai">
              <Sparkles size={15} className="ld-ai-spark" />
              {t.ai}
              <span className="ld-ai-trial">{t.trial}</span>
            </button>
            <MarkdownContent markdown={body} baseUrl={doc.sourceUrl} />
          </article>
        </div>
      </div>
    </div>
  )
}

const larkDocs: SkinDefinition = {
  id: 'lark-docs',
  label: 'Lark Docs',
  appName: 'Lark Docs',
  fileExtension: 'docx',
  accent: '#3370ff',
  faviconGlyph: 'L',
  i18nNames: {
    zh: { label: '飞书文档', appName: '飞书文档' },
  },
  Surface: LarkDocsSkin,
}
export default larkDocs
