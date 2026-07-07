// WeCom / 企业微信 desktop-client disguise. The article is shared into a
// believable work group by an invented assistant account. Seeded conversations
// are fictional and localized; no real people, companies, or customer data.
import './style.css'
import type { LucideIcon } from 'lucide-react'
import type { DocumentRecord } from '../../core/types'
import type { SkinDefinition } from '../types'
import { aliasInitial } from '../../core/alias'
import { articleBody, clockLabel, daysAgoLabel, minutesAgo } from '../../core/content'
import { lang } from '../../i18n'
import { MarkdownContent, SkinSwitcher, splitMarkdownForChat } from '../shared'
import {
  AtSign,
  Calendar,
  Contact,
  FileText,
  Folder,
  Image as ImageIcon,
  LayoutGrid,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Plus,
  Scissors,
  Search,
  Smile,
  SquareCheckBig,
  Users,
  Video,
} from 'lucide-react'

type Ico = LucideIcon

export function WeComLogo({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="wecom-logo-blue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#35a9ff" />
          <stop offset="1" stopColor="#1688e8" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="11" fill="#fff" />
      <path
        fill="url(#wecom-logo-blue)"
        d="M23.7 9.7c-8.5 0-15.4 5.8-15.4 13 0 3.9 2.1 7.5 5.4 9.8l-1.4 5.3 6.1-3.1c1.7.6 3.5.9 5.3.9 8.5 0 15.4-5.8 15.4-12.9 0-7.2-6.9-13-15.4-13Zm-4.9 10.5a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4Zm9.8 0a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4Z"
      />
      <circle cx="36.5" cy="25" r="3.4" fill="#4bd23e" />
      <circle cx="31.6" cy="31.6" r="3.4" fill="#ffd12a" />
      <circle cx="38.1" cy="34.6" r="3.4" fill="#ff6b1f" />
      <circle cx="42.1" cy="29.2" r="3.4" fill="#29a8ff" />
    </svg>
  )
}

const STR = {
  zh: {
    search: '搜索',
    group: '项目协作群',
    members: '18人',
    today: '今天',
    assistant: '信息同步助手',
    bot: '机器人',
    official: '官方',
    ownReply: '收到，我同步到周会里',
    input: '输入消息...',
    send: '发送',
    nav: {
      messages: '消息',
      contacts: '通讯录',
      docs: '文档',
      meetings: '会议',
      schedule: '日程',
      workbench: '工作台',
    },
  },
  en: {
    search: 'Search',
    group: 'Project Sync',
    members: '18 members',
    today: 'Today',
    assistant: 'Digest Assistant',
    bot: 'Bot',
    official: 'Official',
    ownReply: "Got it, I'll bring this to sync.",
    input: 'Type a message...',
    send: 'Send',
    nav: {
      messages: 'Messages',
      contacts: 'Contacts',
      docs: 'Docs',
      meetings: 'Meetings',
      schedule: 'Calendar',
      workbench: 'Workbench',
    },
  },
}

const navItems: { key: keyof typeof STR.zh.nav; Icon: Ico; active?: boolean; badge?: number }[] = [
  { key: 'messages', Icon: MessageCircle, active: true, badge: 12 },
  { key: 'contacts', Icon: Contact },
  { key: 'docs', Icon: FileText },
  { key: 'meetings', Icon: Video },
  { key: 'schedule', Icon: Calendar },
  { key: 'workbench', Icon: LayoutGrid },
]

type ChatSeed = {
  zh: string
  en: string
  pzh: string
  pen: string
  tag?: 'bot' | 'official'
  days?: number
  mins?: number
  hue?: number
  badge?: number
  group?: boolean
}

const chats: ChatSeed[] = [
  {
    zh: '审批通知',
    en: 'Approvals',
    pzh: '有 1 条请假审批待处理',
    pen: 'One leave request needs review',
    tag: 'bot',
    mins: 38,
    hue: 206,
  },
  {
    zh: '客户群助手',
    en: 'Customer Group Helper',
    pzh: '3 个客户群今日有新消息',
    pen: 'Three customer groups have updates',
    tag: 'official',
    mins: 92,
    hue: 151,
    badge: 3,
  },
  {
    zh: '日报提醒',
    en: 'Daily Report',
    pzh: '今天的日报还没有提交',
    pen: 'Today’s report is still pending',
    tag: 'bot',
    days: 1,
    hue: 38,
  },
  {
    zh: 'IT 服务台',
    en: 'IT Helpdesk',
    pzh: 'VPN 证书将在本周到期',
    pen: 'VPN certificate expires this week',
    tag: 'bot',
    days: 2,
    hue: 252,
  },
  {
    zh: '产品评审会',
    en: 'Product Review',
    pzh: '会议纪要已生成，可查看',
    pen: 'Meeting notes are ready',
    days: 4,
    hue: 190,
    group: true,
  },
  {
    zh: '财务共享中心',
    en: 'Finance Shared Services',
    pzh: '报销单据已通过初审',
    pen: 'Expense documents passed first review',
    days: 7,
    hue: 22,
  },
]

function chatTime(seed: ChatSeed, zh: boolean) {
  if (seed.mins != null) return clockLabel(minutesAgo(seed.mins))
  return daysAgoLabel(seed.days ?? 1, zh)
}

export function WeComSkin({ doc }: { doc: DocumentRecord }) {
  const zh = lang === 'zh'
  const t = zh ? STR.zh : STR.en
  const body = articleBody(doc)
  const chunks = splitMarkdownForChat(body, { targetChars: 650, maxChunks: 12 })
  const assistant = t.assistant
  const postedStart = chunks.length * 3 + 6
  const stampFor = (index: number) => clockLabel(minutesAgo(postedStart - index * 3))
  const replyAfter = Math.floor((Math.max(chunks.length, 1) - 1) / 2)
  const me = aliasInitial()

  const ownReply = (
    <div className="wc-msg wc-msg-own">
      <div className="wc-msg-col">
        <div className="wc-bubble wc-bubble-own">{t.ownReply}</div>
      </div>
      <span className="wc-avatar wc-avatar-me">{me}</span>
    </div>
  )

  return (
    <div className="wecom">
      <nav className="wc-rail">
        <span className="wc-me">{me}</span>
        <div className="wc-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={item.active ? 'wc-nav-item is-active' : 'wc-nav-item'}
              aria-label={t.nav[item.key]}
            >
              <span className="wc-nav-ic">
                <item.Icon size={21} strokeWidth={1.8} />
                {item.badge ? <em className="wc-nav-badge">{item.badge}</em> : null}
              </span>
              <span className="wc-nav-label">{t.nav[item.key]}</span>
            </button>
          ))}
        </div>
        <button type="button" className="wc-rail-plus" aria-label="New">
          <Plus size={20} strokeWidth={1.8} />
        </button>
      </nav>

      <aside className="wc-list">
        <div className="wc-search-row">
          <div className="wc-search">
            <Search size={14} strokeWidth={1.8} />
            <span>{t.search}</span>
          </div>
          <button type="button" className="wc-add" aria-label="New conversation">
            <Plus size={17} strokeWidth={1.8} />
          </button>
        </div>
        <div className="wc-list-scroll">
          <button type="button" className="wc-chat is-active">
            <span className="wc-chat-av wc-chat-group">
              <Users size={20} strokeWidth={1.8} />
            </span>
            <span className="wc-chat-main">
              <span className="wc-chat-top">
                <b className="wc-chat-name">{t.group}</b>
                <span className="wc-chat-time">{clockLabel(minutesAgo(4))}</span>
              </span>
              <span className="wc-chat-preview">
                {assistant}: {doc.title}
              </span>
            </span>
          </button>
          {chats.map((chat) => (
            <button key={chat.en} type="button" className="wc-chat">
              <span
                className={chat.group ? 'wc-chat-av wc-chat-group-muted' : 'wc-chat-av'}
                style={{ background: `hsl(${chat.hue ?? 160} 48% 50%)` }}
              >
                {chat.group ? <Users size={19} strokeWidth={1.8} /> : (zh ? chat.zh : chat.en).charAt(0)}
                {chat.badge ? <em className="wc-chat-badge">{chat.badge}</em> : null}
              </span>
              <span className="wc-chat-main">
                <span className="wc-chat-top">
                  <span className="wc-chat-name">{zh ? chat.zh : chat.en}</span>
                  {chat.tag ? (
                    <span className={`wc-tag wc-tag-${chat.tag}`}>
                      {chat.tag === 'official' ? t.official : t.bot}
                    </span>
                  ) : null}
                  <span className="wc-chat-time">{chatTime(chat, zh)}</span>
                </span>
                <span className="wc-chat-preview">{zh ? chat.pzh : chat.pen}</span>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <main className="wc-panel">
        <header className="wc-head">
          <div className="wc-title">
            <b>{t.group}</b>
            <span>{t.members}</span>
          </div>
          <div className="wc-head-actions">
            <span className="wc-head-ic">
              <Search size={18} strokeWidth={1.8} />
            </span>
            <span className="wc-head-ic">
              <Phone size={17} strokeWidth={1.8} />
            </span>
            <span className="wc-head-ic">
              <Video size={18} strokeWidth={1.8} />
            </span>
            <span className="wc-head-ic" data-appmenu="file">
              <MoreHorizontal size={19} strokeWidth={1.8} />
            </span>
          </div>
        </header>

        <div className="wc-thread">
          <SkinSwitcher className="wc-switch" />
          <div className="wc-date">
            {t.today} {clockLabel(minutesAgo(postedStart))}
          </div>

          <div className="wc-msg">
            <span className="wc-avatar wc-avatar-assistant">
              <WeComLogo size={34} />
            </span>
            <div className="wc-msg-col">
              <div className="wc-msg-meta">
                <span className="wc-msg-name">{assistant}</span>
                <span className="wc-tag wc-tag-bot">{t.bot}</span>
                <span className="wc-msg-time">{stampFor(0)}</span>
              </div>
              <div className="wc-bubble wc-bubble-in">
                <article className="wc-md markdown-body">
                  <h1 className="wc-post-title">{doc.title}</h1>
                  <MarkdownContent markdown={chunks[0] ?? ''} baseUrl={doc.sourceUrl} />
                </article>
              </div>
            </div>
          </div>
          {replyAfter === 0 && ownReply}

          {chunks.slice(1).map((chunk, index) => {
            const chunkIndex = index + 1
            return (
              <div key={chunkIndex} className="wc-msg-run">
                <div className="wc-msg">
                  <span className="wc-avatar wc-avatar-ghost" aria-hidden="true" />
                  <div className="wc-msg-col">
                    <div className="wc-bubble wc-bubble-in">
                      <article className="wc-md markdown-body">
                        <MarkdownContent markdown={chunk} baseUrl={doc.sourceUrl} />
                      </article>
                    </div>
                  </div>
                </div>
                {replyAfter === chunkIndex && ownReply}
              </div>
            )
          })}
        </div>

        <footer className="wc-composer">
          <div className="wc-tools">
            <Smile size={20} strokeWidth={1.8} />
            <Scissors size={19} strokeWidth={1.8} />
            <ImageIcon size={19} strokeWidth={1.8} />
            <Folder size={19} strokeWidth={1.8} />
            <SquareCheckBig size={19} strokeWidth={1.8} />
            <Phone size={18} strokeWidth={1.8} />
            <Video size={19} strokeWidth={1.8} />
            <AtSign size={19} strokeWidth={1.8} />
            <MoreHorizontal size={20} strokeWidth={1.8} />
          </div>
          <div className="wc-input" aria-hidden="true">
            {t.input}
          </div>
          <div className="wc-compose-foot">
            <button type="button" className="wc-send">
              {t.send}
            </button>
          </div>
        </footer>
      </main>
    </div>
  )
}

const wecom: SkinDefinition = {
  id: 'wecom',
  label: 'WeCom',
  appName: 'WeCom',
  fileExtension: 'wecom',
  accent: '#1688e8',
  faviconGlyph: 'W',
  i18nNames: {
    zh: { label: '企业微信', appName: '企业微信' },
  },
  Surface: WeComSkin,
  Logo: WeComLogo,
}

export default wecom
