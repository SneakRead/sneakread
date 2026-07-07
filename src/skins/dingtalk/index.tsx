// DingTalk (钉钉) desktop-client disguise — the article arrives as a feed of
// messages shared by a subscription bot into a work group chat, complete with
// DingTalk's signature read receipts. All seeded names/chats are INVENTED and
// bilingual — never a real person or the user's data.
import './style.css'
import type { LucideIcon } from 'lucide-react'
import type { DocumentRecord } from '../../core/types'
import type { SkinDefinition } from '../types'
import { articleBody } from '../../core/content'
import { MarkdownContent, SkinSwitcher, splitMarkdownForChat } from '../shared'
import { lang } from '../../i18n'
import {
  MessageCircle,
  Calendar,
  SquareCheckBig,
  FileText,
  Video,
  Contact,
  LayoutGrid,
  Grid3x3,
  Search,
  Plus,
  Users,
  BellOff,
  Phone,
  MoreHorizontal,
  PanelRight,
  Smile,
  Scissors,
  Folder,
  Image as ImageIcon,
  Zap,
} from 'lucide-react'

type Ico = LucideIcon

// The DingTalk brand mark: blue circle, white "wing + lightning" glyph.
export function DingTalkLogo({ size = 26, className }: { size?: number; className?: string }) {
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
        <linearGradient id="dt-logo-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f9dff" />
          <stop offset="1" stopColor="#007fff" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill="url(#dt-logo-grad)" />
      <path
        fill="#fff"
        transform="translate(-2 -0.5)"
        d="M36.9 20.9c-.4 1.6-1.3 3.6-2.5 6-1.5 2.9-3.3 5.9-4.8 8.3l-3 4.7-1.3-5.1 2.2-4.1c-1.7.3-3.5.2-4.8-.5-1.6-.9-2.4-2.6-2.7-3.4l7.1-1.2c.4-.1.4-.6 0-.7-2.2-.6-4.9-1.5-6.7-2.6-2-1.2-3-3.2-3.3-4.1l10.2 1.7c.4.1.6-.5.2-.7-2.8-1.2-6.4-2.9-8.6-4.5-2.6-1.9-3.6-4.6-3.9-5.6 0 0 9.8 2.7 14.6 4.7 4.9 2 7.3 7.1 7.3 7.1z"
      />
    </svg>
  )
}

const STR = {
  zh: {
    search: '搜索',
    group: '项目沟通群',
    members: '(23人)',
    today: '今天',
    official: '官方',
    bot: '机器人',
    sender: '行业情报站',
    reply: '收到，这篇分析得挺全面',
    readOwn: '已读 5',
    send: '发送',
    enterHint: '按 Enter 发送',
    read: (n: number) => `已读 ${n}/23`,
  },
  en: {
    search: 'Search',
    group: 'Project Group',
    members: '(23)',
    today: 'Today',
    official: 'Official',
    bot: 'Bot',
    sender: 'Industry Digest',
    reply: 'Got it, solid analysis',
    readOwn: 'Read 5',
    send: 'Send',
    enterHint: 'Press Enter to send',
    read: (n: number) => `Read ${n}/23`,
  },
}

const NAV: { zh: string; en: string; Icon: Ico; badge?: number; active?: boolean }[] = [
  { zh: '消息', en: 'Messages', Icon: MessageCircle, badge: 26, active: true },
  { zh: '日历', en: 'Calendar', Icon: Calendar },
  { zh: '待办', en: 'To-Do', Icon: SquareCheckBig, badge: 3 },
  { zh: '文档', en: 'Docs', Icon: FileText },
  { zh: '会议', en: 'Meetings', Icon: Video },
  { zh: '通讯录', en: 'Contacts', Icon: Contact },
  { zh: '工作台', en: 'Workbench', Icon: LayoutGrid },
]

// Seeded sidebar conversations — invented bots/groups only. `m` = minutes ago
// (renders as HH:mm), `d` = days ago (renders as 昨天 / 周五 / 7月3日 style).
type ChatSeed = {
  zh: string
  en: string
  tag?: 'gov' | 'bot'
  pzh: string
  pen: string
  m?: number
  d?: number
  hue?: number
  badge?: number
  muted?: boolean
  logo?: boolean
  group?: boolean
}
const CHATS: ChatSeed[] = [
  { zh: '审批', en: 'Approvals', tag: 'bot', pzh: '你有一条审批待处理', pen: 'You have one approval pending', m: 76, hue: 210 },
  { zh: '部门群', en: 'Team Group', pzh: '下周一例会改到 10:30', pen: 'Monday standup moved to 10:30', m: 158, hue: 152, group: true, badge: 5 },
  { zh: '钉钉小秘书', en: 'DingTalk Assistant', tag: 'gov', pzh: '新版本功能上线，点击查看', pen: 'New features are live — take a look', d: 1, logo: true },
  { zh: '公告', en: 'Announcements', pzh: '全员会议安排', pen: 'All-hands meeting schedule', d: 1, hue: 24 },
  { zh: 'HR 小助手', en: 'HR Helper', tag: 'bot', pzh: '本月工资条已发送，请查收', pen: 'Your payslip for this month is out', d: 4, hue: 336 },
  { zh: 'IT 服务台', en: 'IT Helpdesk', tag: 'bot', pzh: 'VPN 证书本周到期，请及时更新', pen: 'VPN certificate expires this week', d: 5, hue: 262 },
  { zh: '下午茶闲聊群', en: 'Coffee & Chat', pzh: '今天的奶茶拼单来了', pen: 'Bubble tea group order is up', d: 8, hue: 32, group: true, muted: true },
]

function fmtHM(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
function minutesAgo(mins: number) {
  return new Date(Date.now() - mins * 60000)
}
// Relative day label computed from the REAL current date — never hardcoded.
function relDay(daysAgo: number, zh: boolean) {
  const date = new Date(Date.now() - daysAgo * 86400000)
  if (daysAgo <= 1) return zh ? '昨天' : 'Yesterday'
  if (daysAgo < 7) {
    const zhWeek = ['日', '一', '二', '三', '四', '五', '六']
    const enWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return zh ? `周${zhWeek[date.getDay()]}` : enWeek[date.getDay()]
  }
  if (zh) return `${date.getMonth() + 1}月${date.getDate()}日`
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[date.getMonth()]} ${date.getDate()}`
}

export function DingTalkSkin({ doc }: { doc: DocumentRecord }) {
  const zh = lang === 'zh'
  const t = zh ? STR.zh : STR.en
  const body = articleBody(doc)
  const chunks = splitMarkdownForChat(body)
  const avChar = t.sender.charAt(0)

  // Dynamic clock: the bot posted a few minutes apart, ending moments ago.
  const startMins = chunks.length * 2 + 4
  const stampFor = (i: number) => fmtHM(minutesAgo(startMins - i * 2))
  // DingTalk's signature read receipt, decaying as later messages get read
  // less. A hand-tuned monotonic curve — a flat run of identical numbers at
  // the tail would read as fake.
  const READS = [18, 17, 15, 14, 12, 11, 9, 8, 7, 6, 6, 5, 5, 4]
  const readAt = (i: number) => READS[i] ?? 4
  const replyAfter = Math.floor((Math.max(chunks.length, 1) - 1) / 2)

  const ownReply = (
    <div className="dt-msg dt-msg-own">
      <div className="dt-msg-col">
        <div className="dt-bubble dt-bubble-own">{t.reply}</div>
        <div className="dt-receipt dt-receipt-own">{t.readOwn}</div>
      </div>
      <span className="dt-msg-av dt-av-me">M</span>
    </div>
  )

  return (
    <div className="dingtalk">
      {/* Zone 1 — narrow icon rail */}
      <nav className="dt-rail">
        <span className="dt-rail-me">M</span>
        <div className="dt-rail-items">
          {NAV.map((n) => (
            <button
              key={n.en}
              type="button"
              className={n.active ? 'dt-rail-item is-active' : 'dt-rail-item'}
            >
              <span className="dt-rail-ic">
                <n.Icon size={21} />
                {n.badge ? <em className="dt-rail-badge">{n.badge}</em> : null}
              </span>
              <span className="dt-rail-label">{zh ? n.zh : n.en}</span>
            </button>
          ))}
        </div>
        <div className="dt-rail-foot">
          <button type="button" className="dt-rail-item" aria-label={zh ? '应用中心' : 'App Center'}>
            <span className="dt-rail-ic">
              <Grid3x3 size={21} />
            </span>
          </button>
        </div>
      </nav>

      {/* Zone 2 — conversation list */}
      <aside className="dt-list">
        <div className="dt-search-row">
          <div className="dt-search">
            <Search size={14} />
            <span>{t.search}</span>
          </div>
          <button type="button" className="dt-add" aria-label="New">
            <Plus size={17} />
          </button>
        </div>
        <div className="dt-list-scroll">
          {/* live conversation = the group where the article was shared, selected */}
          <button type="button" className="dt-chat is-active">
            <span className="dt-chat-av dt-av-group">
              <Users size={20} />
            </span>
            <div className="dt-chat-main">
              <div className="dt-chat-top">
                <span className="dt-chat-name">{t.group}</span>
                <span className="dt-chat-time">{fmtHM(minutesAgo(4))}</span>
              </div>
              <div className="dt-chat-preview">
                <span>{t.sender}: {doc.title}</span>
              </div>
            </div>
          </button>
          {CHATS.map((c) => (
            <button key={c.en} type="button" className="dt-chat">
              <span
                className={c.logo ? 'dt-chat-av dt-av-logo' : c.group ? 'dt-chat-av dt-av-group2' : 'dt-chat-av'}
                style={c.logo ? undefined : { background: `hsl(${c.hue ?? 210} 60% 52%)` }}
              >
                {c.logo ? <DingTalkLogo size={40} /> : c.group ? <Users size={19} /> : (zh ? c.zh : c.en).charAt(0)}
                {c.badge ? <em className="dt-av-badge">{c.badge}</em> : null}
              </span>
              <div className="dt-chat-main">
                <div className="dt-chat-top">
                  <span className="dt-chat-name">{zh ? c.zh : c.en}</span>
                  {c.tag ? (
                    <span className={`dt-tag dt-tag-${c.tag}`}>{c.tag === 'gov' ? t.official : t.bot}</span>
                  ) : null}
                  {c.muted ? <BellOff size={12} className="dt-mute" /> : null}
                  <span className="dt-chat-time">
                    {c.m != null ? fmtHM(minutesAgo(c.m)) : relDay(c.d ?? 1, zh)}
                  </span>
                </div>
                <div className="dt-chat-preview">
                  <span>{zh ? c.pzh : c.pen}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Zone 3 — group conversation */}
      <main className="dt-convo">
        <header className="dt-head">
          <div className="dt-head-id">
            <b className="dt-head-name">{t.group}</b>
            <span className="dt-head-count">{t.members}</span>
          </div>
          <div className="dt-head-actions">
            <span className="dt-head-ic"><Search size={17} /></span>
            <span className="dt-head-ic"><Phone size={16} /></span>
            <span className="dt-head-ic"><Video size={17} /></span>
            <span className="dt-head-ding" title="DING">
              <Zap size={15} />
              DING
            </span>
            <span className="dt-head-ic" data-appmenu="file"><MoreHorizontal size={18} /></span>
            <span className="dt-head-ic"><PanelRight size={17} /></span>
          </div>
        </header>

        <div className="dt-thread">
          <SkinSwitcher className="dt-switch" />
          <div className="dt-date">{t.today} {fmtHM(minutesAgo(startMins))}</div>

          {/* the article, shared by a subscription bot as a run of messages */}
          <div className="dt-msg">
            <span className="dt-msg-av">{avChar}</span>
            <div className="dt-msg-col">
              <div className="dt-msg-sender">
                <span className="dt-msg-name">{t.sender}</span>
                <span className="dt-tag dt-tag-bot">{t.bot}</span>
                <span className="dt-msg-time">{stampFor(0)}</span>
              </div>
              <div className="dt-bubble">
                <div className="dt-msg-title">{doc.title}</div>
                <div className="dt-md markdown-body">
                  <MarkdownContent markdown={chunks[0] ?? ''} baseUrl={doc.sourceUrl} />
                </div>
              </div>
              <div className="dt-receipt">{t.read(readAt(0))}</div>
            </div>
          </div>
          {replyAfter === 0 && ownReply}

          {chunks.slice(1).map((chunk, i) => (
            <div key={i} className="dt-msg-run">
              <div className="dt-msg">
                <span className="dt-msg-av">{avChar}</span>
                <div className="dt-msg-col">
                  <div className="dt-bubble">
                    <div className="dt-md markdown-body">
                      <MarkdownContent markdown={chunk} baseUrl={doc.sourceUrl} />
                    </div>
                  </div>
                  <div className="dt-receipt">{t.read(readAt(i + 1))}</div>
                </div>
              </div>
              {replyAfter === i + 1 && ownReply}
            </div>
          ))}
        </div>

        <div className="dt-composer">
          <div className="dt-composer-tools">
            <Smile size={19} />
            <Scissors size={18} />
            <Folder size={18} />
            <ImageIcon size={18} />
            <Zap size={18} />
            <Video size={19} />
          </div>
          <div className="dt-composer-input" />
          <div className="dt-composer-foot">
            <span className="dt-enter-hint">{t.enterHint}</span>
            <button type="button" className="dt-send">{t.send}</button>
          </div>
        </div>
      </main>
    </div>
  )
}

const dingtalk: SkinDefinition = {
  id: 'dingtalk',
  label: 'DingTalk',
  appName: 'DingTalk',
  fileExtension: 'txt',
  accent: '#007fff',
  faviconGlyph: 'D',
  i18nNames: {
    zh: { label: '钉钉', appName: '钉钉' },
  },
  Surface: DingTalkSkin,
  Logo: DingTalkLogo,
}
export default dingtalk
