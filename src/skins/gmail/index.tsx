import './style.css'
import { useMemo } from 'react'
import type { DocumentRecord } from '../../core/types'
import type { SkinDefinition } from '../types'
import { articleBody, getSiteLabel } from '../../core/content'
import { MSym, MarkdownContent, SkinSwitcher } from '../shared'

// Official Gmail envelope "M" (2020 rebrand), drawn in a square viewBox so it
// sits centered in the home gallery / menus like the other brand marks.
function GmailLogo({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="52 31 88 88"
      aria-hidden="true"
      focusable="false"
    >
      <path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6" />
      <path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15" />
      <path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2" />
      <path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92" />
      <path fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2" />
    </svg>
  )
}

// The multicolor Compose pencil (Google-colors pencil pointing bottom-left).
function ComposeGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g transform="rotate(-45 12 12)">
        <path fill="#fbbc04" d="M2.6 12 7 9.4v5.2z" />
        <path fill="#4285f4" d="M7 9.4h4.6v5.2H7z" />
        <path fill="#34a853" d="M11.6 9.4h4.6v5.2h-4.6z" />
        <path
          fill="#ea4335"
          d="M16.2 9.4h3.2a1.9 1.9 0 0 1 1.9 1.9v1.4a1.9 1.9 0 0 1-1.9 1.9h-3.2z"
        />
      </g>
    </svg>
  )
}

// Deterministic avatar hue from a string (same trick as the Slack skin).
function hueOf(seed: string) {
  let h = 0
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h % 360
}

// Dynamic timestamp: "10:24 AM (2 hours ago)" — derived from now, never hardcoded.
function receivedStamp() {
  const now = new Date()
  const received = new Date(now.getTime() - (2 * 60 + 13) * 60_000)
  const hours = Math.max(1, Math.floor((now.getTime() - received.getTime()) / 3_600_000))
  const time = received.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const sameDay = received.toDateString() === now.toDateString()
  const day = received.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  const stamp = sameDay ? time : `${day}, ${time}`
  return `${stamp} (${hours} ${hours === 1 ? 'hour' : 'hours'} ago)`
}

const gmNav: { icon: string; label: string; count?: string; active?: boolean }[] = [
  { icon: 'inbox', label: 'Inbox', count: '12', active: true },
  { icon: 'star', label: 'Starred' },
  { icon: 'schedule', label: 'Snoozed' },
  { icon: 'send', label: 'Sent' },
  { icon: 'draft', label: 'Drafts', count: '2' },
  { icon: 'expand_more', label: 'More' },
]

// Fictional labels — bilingual-safe, no real names/projects.
const gmLabels = [
  { label: 'Work', color: '#4285f4' },
  { label: 'Newsletters', color: '#34a853' },
  { label: 'Receipts', color: '#f9ab00' },
]

const gmTools: { icon: string; label: string }[] = [
  { icon: 'archive', label: 'Archive' },
  { icon: 'report', label: 'Report spam' },
  { icon: 'delete', label: 'Delete' },
]
const gmTools2: { icon: string; label: string }[] = [
  { icon: 'mark_email_unread', label: 'Mark as unread' },
  { icon: 'schedule', label: 'Snooze' },
  { icon: 'drive_file_move', label: 'Move to' },
  { icon: 'label', label: 'Labels' },
]

const gmSidePanel = [
  { icon: 'calendar_month', label: 'Calendar', color: '#4285f4' },
  { icon: 'lightbulb', label: 'Keep', color: '#f9ab00' },
  { icon: 'task_alt', label: 'Tasks', color: '#1a73e8' },
  { icon: 'contacts', label: 'Contacts', color: '#4285f4' },
]

const gmSmartReplies = ['Thanks for sharing!', 'Interesting read', 'Got it']

export function GmailSkin({ doc }: { doc: DocumentRecord }) {
  const body = articleBody(doc)
  const site = getSiteLabel(doc.sourceUrl)
  const sender = doc.projectName || site
  const initial = (sender.trim().charAt(0) || 'N').toUpperCase()
  const hue = hueOf(site)
  const mailTime = useMemo(receivedStamp, [])

  return (
    <div className="gmail">
      <header className="gm-topbar">
        <div className="gm-top-left">
          {/* The hamburger IS the menu affordance in Gmail — mount the real
              control menu here where users instinctively click. */}
          <button
            type="button"
            className="gm-iconbtn gm-burger"
            data-appmenu="file"
            aria-label="Main menu"
          >
            <MSym name="menu" className="gm-ic24" />
          </button>
          <span className="gm-logo">
            <GmailLogo size={40} className="gm-logo-mark" />
            <span className="gm-logo-text">Gmail</span>
          </span>
        </div>
        <div className="gm-search">
          <button type="button" className="gm-iconbtn gm-search-btn" aria-label="Search">
            <MSym name="search" className="gm-ic24" />
          </button>
          <span className="gm-search-hint">Search mail</span>
          <button
            type="button"
            className="gm-iconbtn gm-search-btn"
            aria-label="Show search options"
          >
            <MSym name="tune" className="gm-ic24" />
          </button>
        </div>
        <div className="gm-top-right">
          <button type="button" className="gm-iconbtn" aria-label="Support">
            <MSym name="help" className="gm-ic24" />
          </button>
          <button type="button" className="gm-iconbtn" aria-label="Settings">
            <MSym name="settings" className="gm-ic24" />
          </button>
          <button type="button" className="gm-iconbtn" aria-label="Google apps">
            <MSym name="apps" className="gm-ic24" />
          </button>
          <button type="button" className="gm-me" aria-label="Google Account">
            M
          </button>
        </div>
      </header>

      <nav className="gm-nav">
        <button type="button" className="gm-compose">
          <ComposeGlyph />
          Compose
        </button>
        <div className="gm-nav-list">
          {gmNav.map((item) => (
            <button
              key={item.label}
              type="button"
              className={item.active ? 'gm-nav-item is-active' : 'gm-nav-item'}
            >
              <MSym name={item.icon} />
              <span className="gm-nav-label">{item.label}</span>
              {item.count ? <em className="gm-nav-count">{item.count}</em> : null}
            </button>
          ))}
        </div>
        <div className="gm-labels-head">
          <span>Labels</span>
          <button type="button" className="gm-iconbtn gm-labels-add" aria-label="Create new label">
            <MSym name="add" />
          </button>
        </div>
        <div className="gm-nav-list">
          {gmLabels.map((item) => (
            <button key={item.label} type="button" className="gm-nav-item gm-label-item">
              <span className="gm-label-dot" style={{ background: item.color }} />
              <span className="gm-nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="gm-main">
        <div className="gm-card">
          <div className="gm-toolbar">
            <button type="button" className="gm-iconbtn gm-tool" aria-label="Back to Inbox">
              <MSym name="arrow_back" />
            </button>
            <span className="gm-tool-sep" />
            {gmTools.map((tool) => (
              <button
                key={tool.label}
                type="button"
                className="gm-iconbtn gm-tool"
                aria-label={tool.label}
                title={tool.label}
              >
                <MSym name={tool.icon} />
              </button>
            ))}
            <span className="gm-tool-sep" />
            {gmTools2.map((tool) => (
              <button
                key={tool.label}
                type="button"
                className="gm-iconbtn gm-tool"
                aria-label={tool.label}
                title={tool.label}
              >
                <MSym name={tool.icon} />
              </button>
            ))}
            <button
              type="button"
              className="gm-iconbtn gm-tool is-clickable"
              aria-label="More"
              title="More"
            >
              <MSym name="more_vert" />
            </button>
            <div className="gm-toolbar-right">
              <span className="gm-pager">1 of 1,024</span>
              <button
                type="button"
                className="gm-iconbtn gm-tool"
                aria-label="Newer"
                disabled
              >
                <MSym name="chevron_left" />
              </button>
              <button type="button" className="gm-iconbtn gm-tool" aria-label="Older">
                <MSym name="chevron_right" />
              </button>
            </div>
          </div>

          <div className="gm-mail">
            <SkinSwitcher className="gm-switch" />
            <div className="gm-subjectrow">
              <h1 className="gm-subject">{doc.title}</h1>
              <span className="gm-chip">
                Inbox
                <MSym name="close" />
              </span>
              <span className="gm-subject-actions">
                <button type="button" className="gm-iconbtn gm-tool" aria-label="Print all">
                  <MSym name="print" />
                </button>
                <button
                  type="button"
                  className="gm-iconbtn gm-tool"
                  aria-label="In new window"
                >
                  <MSym name="open_in_new" />
                </button>
              </span>
            </div>

            <div className="gm-senderrow">
              <span className="gm-avatar" style={{ background: `hsl(${hue} 46% 44%)` }}>
                {initial}
              </span>
              <div className="gm-sender-main">
                <div className="gm-sender-name">
                  <b>{sender}</b>
                  <span className="gm-sender-addr">&lt;newsletter@{site}&gt;</span>
                </div>
                <button type="button" className="gm-tome">
                  to me
                  <MSym name="arrow_drop_down" />
                </button>
              </div>
              <div className="gm-sender-meta">
                <span className="gm-time">{mailTime}</span>
                <button type="button" className="gm-iconbtn gm-tool" aria-label="Not starred">
                  <MSym name="star" />
                </button>
                <button type="button" className="gm-iconbtn gm-tool" aria-label="Reply">
                  <MSym name="reply" />
                </button>
                <button type="button" className="gm-iconbtn gm-tool" aria-label="More">
                  <MSym name="more_vert" />
                </button>
              </div>
            </div>

            <div className="gm-mailbody markdown-body">
              <MarkdownContent markdown={body} baseUrl={doc.sourceUrl} />
            </div>

            <div className="gm-replies">
              <button type="button" className="gm-replybtn">
                <MSym name="reply" />
                Reply
              </button>
              <button type="button" className="gm-replybtn">
                <MSym name="forward" />
                Forward
              </button>
            </div>
            <div className="gm-smart">
              {gmSmartReplies.map((text) => (
                <button key={text} type="button" className="gm-smart-chip">
                  {text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <aside className="gm-panel">
        {gmSidePanel.map((item) => (
          <button
            key={item.label}
            type="button"
            className="gm-iconbtn gm-panel-btn"
            style={{ color: item.color }}
            aria-label={item.label}
            title={item.label}
          >
            <MSym name={item.icon} className="gm-panel-ic" />
          </button>
        ))}
        <span className="gm-panel-sep" />
        <button type="button" className="gm-iconbtn gm-panel-btn" aria-label="Get add-ons">
          <MSym name="add" className="gm-panel-plus" />
        </button>
      </aside>
    </div>
  )
}

const gmail: SkinDefinition = {
  id: 'gmail',
  label: 'Gmail',
  appName: 'Gmail',
  fileExtension: 'eml',
  accent: '#ea4335',
  faviconGlyph: 'M',
  Surface: GmailSkin,
  Logo: GmailLogo,
}
export default gmail
