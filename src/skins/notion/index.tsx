import type { ReactNode } from 'react'
import type { DocumentRecord } from '../../core/types'
import type { SkinDefinition } from '../types'
import { articleBody, getSiteLabel } from '../../core/content'
import { MarkdownContent, SkinSwitcher } from '../shared'
import { NotionLogo } from '../../logos'
import { lang } from '../../i18n'
import {
  House,
  MessageSquare,
  Sparkles,
  Inbox,
  Search,
  Calendar,
  Plus,
  ChevronRight,
  ChevronDown,
  ChevronsRight,
  FileText,
  ListFilter,
  ArrowUpDown,
  Zap,
  Star,
  SlidersHorizontal,
  Link as LinkIcon,
  MoreHorizontal,
  Maximize2,
  Clock,
  Tag,
  PenLine,
  List,
  Lock,
  Image as ImageIcon,
  AlignLeft,
  Languages,
  Smile,
} from 'lucide-react'

// Recents / Favorites page trees — an empty sidebar screams "fake", so seed a
// lived-in workspace. All titles are INVENTED generic placeholders (never a real
// user's notes) and localized zh/en.
const RECENTS = {
  zh: [
    { icon: '📄', name: '本周速记', views: false },
    { icon: '📚', name: '读书笔记', views: true },
    { icon: '🧭', name: '季度规划' },
    { icon: '🧠', name: '灵感收集' },
    { icon: '📦', name: '需求池' },
    { icon: '📝', name: '会议纪要' },
  ],
  en: [
    { icon: '📄', name: 'This week’s notes', views: false },
    { icon: '📚', name: 'Reading notes', views: true },
    { icon: '🧭', name: 'Quarterly plan' },
    { icon: '🧠', name: 'Idea inbox' },
    { icon: '📦', name: 'Backlog' },
    { icon: '📝', name: 'Meeting notes' },
  ],
}
const FAVORITES = {
  zh: [
    { icon: '📌', name: '团队主页', views: false },
    { icon: '📚', name: '读书笔记', views: true },
    { icon: '🎯', name: '目标与 OKR' },
    { icon: '💡', name: '灵感库' },
    { icon: '🗒️', name: '周报' },
  ],
  en: [
    { icon: '📌', name: 'Team home', views: false },
    { icon: '📚', name: 'Reading notes', views: true },
    { icon: '🎯', name: 'Goals & OKR' },
    { icon: '💡', name: 'Idea vault' },
    { icon: '🗒️', name: 'Weekly report' },
  ],
}
// Middle "List view" database rows — invented generic reading-list titles. The
// live article is spliced in as the selected row.
const DB_ROWS = {
  zh: [
    '一个周末验证产品点子的流程',
    '远程团队协作的几个习惯',
    '__ARTICLE__',
    '增长的本质：留存比拉新更重要',
    '一份可复用的竞品分析模板',
    '关于定价的一些思考',
    '本周精读 · 5 篇好文',
    '从零搭建个人知识库',
    'New page',
    '会议纪要 · 模板',
    '用户访谈提纲',
    '值得收藏的设计资源',
    '读书笔记 · 增长实战手记',
    '个人年度复盘框架',
    '本季度目标拆解',
    '随手记 · 灵感碎片',
  ],
  en: [
    'Validate an idea in one weekend',
    'Habits of remote teams',
    '__ARTICLE__',
    'Growth: retention beats acquisition',
    'A reusable competitor-analysis template',
    'Some thoughts on pricing',
    'Weekly reads · 5 good ones',
    'Build a personal wiki from scratch',
    'New page',
    'Meeting notes · template',
    'User interview guide',
    'Design resources worth saving',
    'Book notes · a growth playbook',
    'Annual review framework',
    'This quarter’s goals',
    'Scratch · stray ideas',
  ],
}

function NavIcon({ children }: { children: ReactNode }) {
  return <span className="nt-nav-ic">{children}</span>
}

function PageRow({ icon, name, views, indent }: { icon: string; name: string; views?: boolean; indent?: boolean }) {
  return (
    <>
      <button type="button" className="nt-page-row" style={indent ? { paddingLeft: 26 } : undefined}>
        <span className="nt-page-caret" aria-hidden="true">
          <ChevronRight size={14} />
        </span>
        <span className="nt-page-emoji" aria-hidden="true">
          {icon}
        </span>
        <span className="nt-page-name">{name}</span>
        <span className="nt-page-add" aria-hidden="true">
          <Plus size={14} />
        </span>
      </button>
      {views && (
        <>
          <div className="nt-page-view">List view</div>
          <div className="nt-page-view">Gallery view</div>
        </>
      )}
    </>
  )
}

export function NotionSkin({ doc }: { doc: DocumentRecord }) {
  const body = articleBody(doc)
  const zh = lang === 'zh'
  const recents = zh ? RECENTS.zh : RECENTS.en
  const favorites = zh ? FAVORITES.zh : FAVORITES.en
  const dbRows = zh ? DB_ROWS.zh : DB_ROWS.en
  const workspace = 'My Notion'
  const dbName = zh ? '阅读记事' : 'Reading log'

  return (
    <div className="notion">
      {/* Zone 1 — sidebar */}
      <aside className="nt-side">
        <div className="nt-ws">
          <span className="nt-ws-icon">
            <NotionLogo size={20} />
          </span>
          <span className="nt-ws-name">{workspace}</span>
          <ChevronDown size={14} className="nt-ws-chev" aria-hidden="true" />
        </div>
        <div className="nt-home">
          <button type="button" className="nt-nav nt-nav-home">
            <NavIcon>
              <House size={17} />
            </NavIcon>
            Home
          </button>
          <span className="nt-home-icons">
            <MessageSquare size={16} />
            <Sparkles size={16} />
            <Inbox size={16} />
            <Search size={16} />
          </span>
        </div>

        <div className="nt-tree">
          <div className="nt-mtg">
            <div className="nt-mtg-card">
              <Calendar size={16} />
              <div>
                <b>Connect your calendar</b>
                <span>See all your events and start meeting notes.</span>
              </div>
            </div>
            <button type="button" className="nt-nav">
              <NavIcon>
                <PenLine size={16} />
              </NavIcon>
              New AI meeting note
            </button>
          </div>

          <div className="nt-section">Recents</div>
          <PageRow icon="📖" name={doc.title} />
          {recents.map((p) => (
            <PageRow key={p.name} icon={p.icon} name={p.name} views={p.views} />
          ))}

          <div className="nt-section">Favorites</div>
          {favorites.map((p) => (
            <PageRow key={`f-${p.name}`} icon={p.icon} name={p.name} views={p.views} />
          ))}
        </div>

        <div className="nt-side-foot">
          <button type="button" className="nt-newchat">
            <Sparkles size={15} /> New chat
            <span className="nt-kbd">⌘O</span>
          </button>
          <button type="button" className="nt-side-compose" aria-label="New page">
            <PenLine size={16} />
          </button>
        </div>
      </aside>

      {/* Zone 2 — List view database */}
      <section className="nt-db">
        <div className="nt-db-topbar">
          <span className="nt-crumb">{dbName}</span>
          <span className="nt-crumb-sep">·</span>
          <span className="nt-crumb nt-crumb-muted">
            <Lock size={12} /> Private
          </span>
          <ChevronDown size={13} className="nt-crumb-muted" aria-hidden="true" />
        </div>
        <div className="nt-db-scroll">
          <div className="nt-db-adds">
            <span><Smiley /> Add icon</span>
            <span><ImageIcon size={15} /> Add cover</span>
            <span><AlignLeft size={15} /> Add description</span>
          </div>
          <h1 className="nt-db-title">{dbName}</h1>
          <div className="nt-viewbar">
            <span className="nt-view is-active">
              <List size={15} /> List view <ChevronDown size={13} />
            </span>
            <span className="nt-view-tools">
              <ListFilter size={16} />
              <ArrowUpDown size={16} />
              <Zap size={16} />
              <Sparkles size={16} />
              <Search size={16} />
              <SlidersHorizontal size={16} />
            </span>
            <span className="nt-new-btn">
              New <ChevronDown size={13} />
            </span>
          </div>
          <div className="nt-db-list">
            {dbRows.map((row, i) =>
              row === '__ARTICLE__' ? (
                <div key="article" className="nt-row is-selected">
                  <FileText size={17} className="nt-row-ic" />
                  <span className="nt-row-name">{doc.title}</span>
                </div>
              ) : (
                <div key={i} className={row === 'New page' ? 'nt-row nt-row-faint' : 'nt-row'}>
                  <FileText size={17} className="nt-row-ic" />
                  <span className="nt-row-name">{row}</span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Zone 3 — peek panel (the opened page) */}
      <section className="nt-peek">
        <div className="nt-peek-bar">
          <span className="nt-peek-left">
            <ChevronsRight size={18} />
            <Maximize2 size={15} />
          </span>
          <span className="nt-peek-right">
            <span className="nt-peek-translate">
              <Languages size={16} />
            </span>
            <span className="nt-share">
              <Lock size={13} /> Share <ChevronDown size={12} />
            </span>
            <LinkIcon size={16} />
            <Star size={16} />
            <span className="nt-peek-more" data-appmenu="file">
              <MoreHorizontal size={16} />
            </span>
          </span>
        </div>
        <div className="nt-peek-scroll">
          <div className="nt-peek-page">
            <SkinSwitcher className="nt-switch" />
            <h1 className="nt-title">{doc.title}</h1>
            <div className="nt-props">
              <div className="nt-prop">
                <span className="nt-prop-k">
                  <Tag size={15} /> Tags
                </span>
                <span className="nt-prop-v nt-prop-empty">Empty</span>
              </div>
              <div className="nt-prop">
                <span className="nt-prop-k">
                  <Clock size={15} /> Created
                </span>
                <span className="nt-prop-v">{doc.fetchedAt}</span>
              </div>
              <div className="nt-prop">
                <span className="nt-prop-k">
                  <Clock size={15} /> Updated
                </span>
                <span className="nt-prop-v">{doc.lastSyncedAt || doc.fetchedAt}</span>
              </div>
              <div className="nt-prop">
                <span className="nt-prop-k">
                  <LinkIcon size={15} /> URL
                </span>
                <span className="nt-prop-v nt-prop-link">{getSiteLabel(doc.sourceUrl)}</span>
              </div>
              <div className="nt-prop nt-prop-add">
                <Plus size={14} /> Add a property
              </div>
            </div>
            <div className="nt-comments">
              <span className="nt-comment-label">Comments</span>
              <div className="nt-comment-add">
                <span className="nt-comment-av" />
                <span className="nt-comment-ph">Add a comment…</span>
              </div>
            </div>
            <div className="nt-peek-divider" />
            <article className="markdown-body nt-body">
              <MarkdownContent markdown={body} baseUrl={doc.sourceUrl} />
            </article>
          </div>
        </div>
      </section>
    </div>
  )
}

function Smiley() {
  return <Smile size={15} />
}

const notion: SkinDefinition = {
  id: 'notion',
  label: 'Notion',
  appName: 'Notion',
  fileExtension: 'notion',
  accent: '#0f0f0f',
  faviconGlyph: 'N',
  Surface: NotionSkin,
}
export default notion
