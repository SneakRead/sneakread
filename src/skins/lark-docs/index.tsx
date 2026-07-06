import type { DocumentRecord } from '../../core/types'
import type { SkinDefinition } from '../types'
import { articleBody, extractOutline } from '../../core/content'
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
    edited: '最近修改：昨天 14:35',
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
    edited: 'Last edited yesterday 14:35',
    share: 'Share',
    outline: 'Outline',
    saved: 'Saved',
    shortcut: 'Add shortcut',
    ai: 'AI Summary',
    trial: 'Beta',
  },
}

export function LarkDocsSkin({ doc }: { doc: DocumentRecord }) {
  const body = articleBody(doc)
  const t = lang === 'zh' ? STR.zh : STR.en
  const title = doc.title
  const workspace = doc.projectName || t.space
  const outline = extractOutline(body)

  return (
    <div className="lark-docs">
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
              <span className="ld-meta-edited">{t.edited}</span>
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
          <span className="ld-avatar">M</span>
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
