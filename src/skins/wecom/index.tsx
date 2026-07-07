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
        <linearGradient id="wecom-logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0fbf83" />
          <stop offset="1" stopColor="#05a85d" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#wecom-logo-grad)" />
      <path
        fill="#fff"
        d="M22.8 12.2c-7 0-12.7 4.9-12.7 10.9 0 3.3 1.8 6.3 4.6 8.3l-1.1 4 4.6-2.4c1.4.5 2.9.8 4.6.8 7 0 12.7-4.9 12.7-10.8 0-6-5.7-10.8-12.7-10.8Zm-4.4 8.9a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4Zm8.6 0a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4Z"
      />
      <path
        fill="#dff8ec"
        d="M34.8 24.4c4 1.2 6.8 4.3 6.8 8 0 2.5-1.3 4.7-3.4 6.2l.8 3-3.5-1.8c-1.1.4-2.3.6-3.5.6-4.5 0-8.2-2.8-9.3-6.5 6.3 0 11.4-4 12.1-9.5Z"
      />
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
  accent: '#07c160',
  faviconGlyph: 'W',
  i18nNames: {
    zh: { label: '企业微信', appName: '企业微信' },
  },
  Surface: WeComSkin,
  Logo: WeComLogo,
}

export default wecom
