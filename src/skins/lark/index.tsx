import type { LucideIcon } from 'lucide-react'
import type { DocumentRecord } from '../../core/types'
import type { SkinDefinition } from '../types'
import { articleBody, clockLabel, daysAgoLabel, minutesAgo } from '../../core/content'
import { aliasInitial } from '../../core/alias'
import { MarkdownContent, SkinSwitcher, splitMarkdownForChat } from '../shared'
import { LarkLogo } from '../../logos'
import { lang } from '../../i18n'
import {
  MessageSquare,
  Calendar,
  Mail,
  SquareCheckBig,
  Grid3x3,
  FileText,
  Video,
  Rocket,
  LayoutGrid,
  AppWindow,
  Contact,
  ChevronDown,
  Star,
  BookText,
  Search,
  UserPlus,
  PanelRight,
  MoreHorizontal,
  Pin,
  Folder,
  Plus,
  Smile,
  AtSign,
  Scissors,
  Maximize2,
  SendHorizontal,
  CaseSensitive,
  Users,
  ListFilter,
  Check,
} from 'lucide-react'

type Ico = LucideIcon

const STR = {
  zh: {
    search: '搜索 (⌘+K)',
    messages: '消息',
    send: '发送给',
    official: '官方',
    today: '今天',
    more: '更多',
    fav: '收藏',
    wiki: '知识库',
    reply: '收到，这篇挺有价值，转给团队看看',
  },
  en: {
    search: 'Search (⌘K)',
    messages: 'Messages',
    send: 'Message',
    official: 'Official',
    today: 'Today',
    more: 'More',
    fav: 'Favorites',
    wiki: 'Wiki',
    reply: 'Nice read — sharing this with the team',
  },
}

const NAV: { zh: string; en: string; Icon: Ico; badge?: number; active?: boolean }[] = [
  { zh: '消息', en: 'Messages', Icon: MessageSquare, badge: 60, active: true },
  { zh: '日历', en: 'Calendar', Icon: Calendar },
  { zh: '邮箱', en: 'Mail', Icon: Mail, badge: 916 },
  { zh: '任务', en: 'Tasks', Icon: SquareCheckBig, badge: 9 },
  { zh: '多维表格', en: 'Base', Icon: Grid3x3 },
  { zh: '云文档', en: 'Docs', Icon: FileText },
  { zh: '视频会议', en: 'Meetings', Icon: Video },
  { zh: '飞行社', en: 'Community', Icon: Rocket },
  { zh: '工作台', en: 'Workplace', Icon: LayoutGrid },
  { zh: '应用中心', en: 'App Center', Icon: AppWindow },
  { zh: '通讯录', en: 'Contacts', Icon: Contact },
]
const SHORTCUTS = {
  zh: ['季度规划 - 云文档', '产品需求文档 - 云文档', '团队周报 - 云文档', '竞品分析 - 云文档', '会议纪要 - 云文档', '新人上手指南 - 云文档'],
  en: ['Quarterly plan — Doc', 'Product spec — Doc', 'Team weekly — Doc', 'Competitor analysis — Doc', 'Meeting notes — Doc', 'Onboarding guide — Doc'],
}
// All invented, generic team/bot names — never a real person or the user's data.
const STRIP = [
  { name: { zh: '项目群', en: 'Project' }, hue: 222, group: true },
  { name: { zh: '设计组', en: 'Design' }, hue: 150, group: true },
  { name: { zh: '运营组', en: 'Ops' }, hue: 14, group: true },
  { name: { zh: '研发组', en: 'Eng' }, hue: 280, group: true },
  { name: { zh: '产品组', en: 'Product' }, hue: 200, group: true },
  { name: { zh: '全员', en: 'All' }, hue: 330, group: true },
]
// `days` = how many days back the conversation was last active; the label is
// derived from the real clock at render time so nothing ever sits in the future.
const CHATS = {
  zh: [
    { name: '季度规划文档', tag: '外部', tagKind: 'ext', preview: '一份文档已共享给你', days: 1, doc: true },
    { name: '审批中心', tag: '机器人', tagKind: 'bot', preview: '一条审批待你处理', days: 1, hue: 200 },
    { name: '安全中心', tag: '机器人', tagKind: 'bot', preview: '新设备登录提醒', days: 2, hue: 150, badge: 2 },
    { name: '工作台助手', tag: '官方', tagKind: 'gov', preview: '本周待办已为你整理好', days: 4, hue: 222, badge: 7 },
    { name: '邮件助手', tag: '机器人', tagKind: 'bot', preview: '你有 3 封未读邮件', days: 10, hue: 268 },
    { name: '日程助手', tag: '机器人', tagKind: 'bot', preview: '明天 10:00 产品评审会', days: 13, hue: 205 },
    { name: '周报机器人', tag: '机器人', tagKind: 'bot', preview: '记得提交本周周报', days: 14, hue: 24 },
  ],
  en: [
    { name: 'Quarterly plan', tag: 'External', tagKind: 'ext', preview: 'A doc was shared with you', days: 1, doc: true },
    { name: 'Approvals', tag: 'Bot', tagKind: 'bot', preview: 'One approval awaits you', days: 1, hue: 200 },
    { name: 'Security Center', tag: 'Bot', tagKind: 'bot', preview: 'New device sign-in alert', days: 2, hue: 150, badge: 2 },
    { name: 'Workplace Assistant', tag: 'Official', tagKind: 'gov', preview: 'Your to-dos for the week are ready', days: 4, hue: 222, badge: 7 },
    { name: 'Mail Assistant', tag: 'Bot', tagKind: 'bot', preview: 'You have 3 unread emails', days: 10, hue: 268 },
    { name: 'Calendar Assistant', tag: 'Bot', tagKind: 'bot', preview: 'Tomorrow 10:00 product review', days: 13, hue: 205 },
    { name: 'Weekly-report Bot', tag: 'Bot', tagKind: 'bot', preview: 'Remember to submit this week’s report', days: 14, hue: 24 },
  ],
}

export function LarkSkin({ doc }: { doc: DocumentRecord }) {
  const body = articleBody(doc)
  const t = lang === 'zh' ? STR.zh : STR.en
  const zh = lang === 'zh'
  const shortcuts = zh ? SHORTCUTS.zh : SHORTCUTS.en
  const chats = zh ? CHATS.zh : CHATS.en
  const sender = doc.projectName || (zh ? '行业资讯' : 'Daily Digest')
  const group = zh ? '项目协作群' : 'Project Team'
  // A real chat never carries a 5000-word single message — split the article
  // into a believable run of messages. Stamp = a few minutes ago, never future.
  const chunks = splitMarkdownForChat(body, { targetChars: 700, maxChunks: 10 })
  const stamp = clockLabel(minutesAgo(4))
  const TABS = [
    { label: zh ? '消息' : 'Messages', Icon: MessageSquare, active: true },
    { label: zh ? '云文档' : 'Docs', Icon: FileText },
    { label: zh ? '文件' : 'Files', Icon: Folder },
    { label: 'Pin', Icon: Pin },
  ]

  return (
    <div className="lark">
      {/* Zone 1 — wide labeled nav sidebar */}
      <nav className="lk-nav">
        <div className="lk-nav-top">
          <span className="lk-nav-me">{aliasInitial()}</span>
          <button type="button" className="lk-nav-add" aria-label="New">
            <Plus size={18} />
          </button>
        </div>
        <div className="lk-nav-search">
          <Search size={15} />
          <span>{t.search}</span>
        </div>
        <div className="lk-nav-scroll">
          {NAV.map((n) => (
            <button
              key={n.zh}
              type="button"
              className={n.active ? 'lk-nav-item is-active' : 'lk-nav-item'}
            >
              <n.Icon size={18} />
              <span className="lk-nav-label">{zh ? n.zh : n.en}</span>
              {n.badge ? <em className="lk-nav-badge">{n.badge}</em> : null}
            </button>
          ))}
          <button type="button" className="lk-nav-item">
            <ChevronDown size={18} />
            <span className="lk-nav-label">{t.more}</span>
          </button>
          <button type="button" className="lk-nav-item lk-nav-sub">
            <Star size={16} />
            <span className="lk-nav-label">{t.fav}</span>
          </button>
          <button type="button" className="lk-nav-item lk-nav-sub">
            <BookText size={16} />
            <span className="lk-nav-label">{t.wiki}</span>
          </button>
          <div className="lk-nav-divider" />
          {shortcuts.map((s) => (
            <button key={s} type="button" className="lk-nav-doc">
              <FileText size={15} className="lk-nav-doc-ic" />
              <span className="lk-nav-label">{s}</span>
            </button>
          ))}
        </div>
        <div className="lk-nav-foot">
          <span className="lk-foot-app">S</span>
          <span className="lk-foot-cat">🐱</span>
          <span className="lk-foot-plus">
            <Plus size={14} />
          </span>
        </div>
      </nav>

      {/* Zone 2 — message list */}
      <aside className="lk-list">
        <div className="lk-list-title">
          <ListFilter size={18} />
          <b>{t.messages}</b>
        </div>
        <div className="lk-strip">
          {STRIP.map((s) => (
            <span key={s.name.zh} className="lk-strip-cell">
              <span
                className={s.group ? 'lk-strip-av lk-strip-group' : 'lk-strip-av'}
                style={{ background: `hsl(${s.hue} 55% 55%)` }}
              >
                {s.group ? <Users size={18} /> : (zh ? s.name.zh : s.name.en).charAt(0)}
              </span>
              <span className="lk-strip-name">{zh ? s.name.zh : s.name.en}</span>
            </span>
          ))}
        </div>
        <div className="lk-list-scroll">
          {/* live conversation = the shared reading, selected */}
          <button type="button" className="lk-chat is-active">
            <span className="lk-chat-av lk-chat-group" style={{ background: '#7b6cf0' }}>
              <Users size={20} />
            </span>
            <div className="lk-chat-main">
              <div className="lk-chat-top">
                <span className="lk-chat-name">{group}</span>
                <span className="lk-chat-time">{stamp}</span>
              </div>
              <div className="lk-chat-preview">
                <span>{sender}: {doc.title}</span>
              </div>
            </div>
          </button>
          {chats.map((c) => (
            <button key={c.name} type="button" className="lk-chat">
              <span
                className={c.doc ? 'lk-chat-av lk-chat-doc' : 'lk-chat-av'}
                style={c.doc ? undefined : { background: `hsl(${c.hue ?? 210} 55% 52%)` }}
              >
                {c.doc ? <FileText size={20} /> : c.name.charAt(0)}
                {c.badge ? <em className="lk-av-badge">{c.badge}</em> : null}
              </span>
              <div className="lk-chat-main">
                <div className="lk-chat-top">
                  <span className="lk-chat-name">{c.name}</span>
                  {c.tag ? <span className={`lk-tag lk-tag-${c.tagKind}`}>{c.tag}</span> : null}
                  <span className="lk-chat-time">{daysAgoLabel(c.days, zh)}</span>
                </div>
                <div className="lk-chat-preview">
                  <span>{c.preview}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Zone 3 — group conversation */}
      <main className="lk-convo">
        <header className="lk-convo-head">
          <div className="lk-convo-id">
            <span className="lk-convo-av" style={{ background: '#7b6cf0' }}>
              <Users size={18} />
            </span>
            <b className="lk-convo-name">{group}</b>
            <span className="lk-convo-count"><Users size={14} /> 5</span>
            <span className="lk-convo-count"><Pin size={13} /> 3</span>
          </div>
          <div className="lk-convo-actions">
            <span className="lk-convo-ic"><Search size={18} /></span>
            <span className="lk-convo-ic"><Video size={18} /></span>
            <span className="lk-convo-ic"><UserPlus size={18} /></span>
            <span className="lk-convo-ic" data-appmenu="file"><MoreHorizontal size={18} /></span>
            <span className="lk-convo-ic"><PanelRight size={18} /></span>
          </div>
        </header>

        <div className="lk-tabs">
          {TABS.map((tab) => (
            <span key={tab.label} className={tab.active ? 'lk-tab is-active' : 'lk-tab'}>
              <tab.Icon size={14} />
              {tab.label}
            </span>
          ))}
          <span className="lk-tab lk-tab-add">
            <Plus size={15} />
          </span>
        </div>

        <div className="lk-thread">
          <SkinSwitcher className="lk-switch" />
          <div className="lk-date">{t.today} {stamp}</div>

          {/* the article, shared into the group as a believable run of messages */}
          {chunks.map((chunk, index) => (
            <div key={index} className="lk-msg">
              {index === 0 ? (
                <span className="lk-msg-av" style={{ background: '#eef3ff' }}>
                  <LarkLogo size={30} />
                </span>
              ) : (
                <span className="lk-msg-av lk-msg-av-ghost" aria-hidden="true" />
              )}
              <div className="lk-msg-col">
                {index === 0 && (
                  <div className="lk-msg-sender">
                    <span className="lk-msg-name">{sender}</span>
                    <span className="lk-tag lk-tag-gov">{t.official}</span>
                    <span className="lk-msg-time">{stamp}</span>
                  </div>
                )}
                <div className="lk-bubble lk-bubble-in">
                  <article className="lk-post markdown-body">
                    {index === 0 && <h1 className="lk-post-title">{doc.title}</h1>}
                    <MarkdownContent markdown={chunk} baseUrl={doc.sourceUrl} />
                  </article>
                </div>
              </div>
            </div>
          ))}

          {/* one short own reply, for authenticity */}
          <div className="lk-msg lk-msg-own">
            <div className="lk-msg-col">
              <div className="lk-bubble-row">
                <span className="lk-receipt" aria-hidden="true">
                  <Check size={11} />
                </span>
                <div className="lk-bubble lk-bubble-out">{t.reply}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lk-composer">
          <div className="lk-composer-input">
            {t.send} {group}
          </div>
          <div className="lk-composer-bar">
            <span className="lk-composer-tools">
              <CaseSensitive size={19} />
              <Smile size={18} />
              <AtSign size={18} />
              <Scissors size={18} />
              <Plus size={18} />
              <Maximize2 size={16} />
            </span>
            <button type="button" className="lk-send-btn" aria-label="Send">
              <SendHorizontal size={16} />
              <ChevronDown size={13} />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

const lark: SkinDefinition = {
  id: 'lark',
  label: 'Lark',
  appName: 'Lark',
  fileExtension: 'lark',
  accent: '#3370ff',
  // 'L' works for the international "Lark" brand; the blue tile is the main cue
  // for 飞书 too (a CJK glyph won't render in the favicon's Arial stack).
  faviconGlyph: 'L',
  i18nNames: {
    zh: { label: '飞书', appName: '飞书' },
  },
  Surface: LarkSkin,
}
export default lark
