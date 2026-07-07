import './style.css'
import type { DocumentRecord } from '../../core/types'
import type { SkinDefinition } from '../types'
import { articleBody } from '../../core/content'
import { MarkdownContent, SkinSwitcher, WindowButtons } from '../shared'
import { lang } from '../../i18n'
import {
  House,
  Plus,
  X,
  Crown,
  Bell,
  ChevronDown,
  Search,
  CloudCheck,
  Share2,
  ClipboardPaste,
  Scissors,
  Copy,
  Paintbrush,
  AArrowUp,
  AArrowDown,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Superscript,
  Eraser,
  Highlighter,
  Baseline,
  IndentDecrease,
  IndentIncrease,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  MousePointer,
  History,
  MessageSquarePlus,
  Volume2,
  Moon,
  Smartphone,
  MoreHorizontal,
  SpellCheck,
  Check,
  Minus,
  FileText,
  BookOpen,
} from 'lucide-react'

// WPS 的原生语言是中文（国际版才是英文）——chrome 词表跟随 App 语言，
// 布局两种语言保持一致。参考 2025 桌面版 WPS Office「WPS 文字」浅色皮肤。
const STR = {
  zh: {
    home: '首页',
    newTab: '新建标签',
    menus: ['文件', '开始', '插入', '页面', '引用', '审阅', '视图', '工具', '会员专享'],
    search: '查找命令、搜索模板',
    synced: '已同步到云文档',
    share: '分享',
    vip: '开通会员',
    message: '消息中心',
    paste: '粘贴',
    cut: '剪切',
    copy: '复制',
    painter: '格式刷',
    fontName: '宋体',
    fontSize: '五号',
    styles: ['正文', '标题 1', '标题 2', '标题 3'],
    find: '查找替换',
    select: '选择',
    spell: '拼写检查',
    saved: '文档已保存',
    pageLabel: (pages: number) => `页面：1/${pages}`,
    wordsLabel: (words: number) => `字数：${words}`,
    tools: ['历史版本', '批注', '全文朗读', '护眼模式', '手机查看', '更多工具'],
  },
  en: {
    home: 'Home',
    newTab: 'New tab',
    menus: ['Menu', 'Home', 'Insert', 'Page', 'References', 'Review', 'View', 'Tools', 'Premium'],
    search: 'Search commands, templates',
    synced: 'Synced to cloud',
    share: 'Share',
    vip: 'Go Premium',
    message: 'Messages',
    paste: 'Paste',
    cut: 'Cut',
    copy: 'Copy',
    painter: 'Painter',
    fontName: 'Calibri',
    fontSize: '11',
    styles: ['Normal', 'Heading 1', 'Heading 2', 'Heading 3'],
    find: 'Find & Replace',
    select: 'Select',
    spell: 'Spell Check',
    saved: 'Saved',
    pageLabel: (pages: number) => `Page: 1/${pages}`,
    wordsLabel: (words: number) => `Words: ${words}`,
    tools: ['History', 'Comment', 'Read Aloud', 'Eye Protection', 'View on Phone', 'More'],
  },
}

// WPS 新版品牌标：红色圆角方块 + 几何粗体白 W。
export function WpsLogo({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="1.5" y="1.5" width="45" height="45" rx="10.5" fill="#e33e38" />
      <path
        fill="#ffffff"
        d="M8 16h5.6l3.7 10.9L21.2 16h5.6l3.9 10.9L34.4 16H40l-6.8 17h-5.1L24 21.9 19.9 33h-5.1L8 16z"
      />
    </svg>
  )
}

// 文档标签页上的「WPS 文字」蓝色文档图标。
function WpsDocGlyph({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <rect x="1.5" y="1.5" width="45" height="45" rx="10.5" fill="#4a7af5" />
      <path
        fill="#ffffff"
        d="M8 16h5.6l3.7 10.9L21.2 16h5.6l3.9 10.9L34.4 16H40l-6.8 17h-5.1L24 21.9 19.9 33h-5.1L8 16z"
      />
    </svg>
  )
}

export function WpsSkin({ doc }: { doc: DocumentRecord }) {
  const body = articleBody(doc)
  const t = lang === 'zh' ? STR.zh : STR.en
  const pages = Math.max(1, Math.ceil((doc.summary.words || 1) / 550))
  const toolIcons = [History, MessageSquarePlus, Volume2, Moon, Smartphone, MoreHorizontal]

  return (
    <div className="wps">
      {/* 顶部多标签栏 —— WPS 最标志性的特征 */}
      <div className="wps-tabbar">
        <button type="button" className="wps-logo" aria-label="WPS Office">
          <WpsLogo size={22} />
        </button>
        <div className="wps-tabs">
          <button type="button" className="wps-tab wps-tab-home">
            <House size={14} strokeWidth={1.8} />
            <span>{t.home}</span>
          </button>
          <div className="wps-tab is-active" title={doc.fileName}>
            <WpsDocGlyph size={15} />
            <span className="wps-tab-name">{doc.fileName}</span>
            <span className="wps-tab-x" aria-hidden="true">
              <X size={13} strokeWidth={1.8} />
            </span>
          </div>
          <button type="button" className="wps-tab-add" aria-label={t.newTab}>
            <Plus size={15} strokeWidth={1.8} />
          </button>
        </div>
        <div className="wps-tabbar-right">
          <button type="button" className="wps-crown" title={t.vip} aria-label={t.vip}>
            <Crown size={16} strokeWidth={1.8} />
          </button>
          <button type="button" className="wps-bell" title={t.message} aria-label={t.message}>
            <Bell size={15} strokeWidth={1.8} />
          </button>
          <WindowButtons />
        </div>
      </div>

      {/* 菜单 / 工具行 */}
      <div className="wps-menurow">
        <nav className="wps-menus" aria-label="Menus">
          <span className="wps-menu wps-menu-file" data-appmenu="file">
            {t.menus[0]}
            <ChevronDown size={11} className="wps-menu-caret" aria-hidden="true" />
          </span>
          {t.menus.slice(1).map((m, i) => (
            <span
              key={m}
              className={
                i === 0
                  ? 'wps-menu is-active'
                  : i === t.menus.length - 2
                    ? 'wps-menu wps-menu-vip'
                    : 'wps-menu'
              }
            >
              {m}
            </span>
          ))}
        </nav>
        <div className="wps-menurow-right">
          <div className="wps-searchbox">
            <Search size={13} strokeWidth={1.8} aria-hidden="true" />
            <span>{t.search}</span>
          </div>
          <button type="button" className="wps-cloud" title={t.synced} aria-label={t.synced}>
            <CloudCheck size={16} strokeWidth={1.7} />
          </button>
          <button type="button" className="wps-sharebtn">
            <Share2 size={12} strokeWidth={2} />
            {t.share}
          </button>
        </div>
      </div>

      {/* Ribbon 工具区 —— WPS 的紧凑排布 */}
      <div className="wps-ribbon">
        <div className="wps-group">
          <button type="button" className="wps-btn-big">
            <ClipboardPaste size={22} strokeWidth={1.5} />
            <span className="wps-btn-big-label">
              {t.paste}
              <ChevronDown size={10} aria-hidden="true" />
            </span>
          </button>
          <div className="wps-minicol">
            <button type="button" className="wps-mini">
              <Scissors size={13} strokeWidth={1.7} />
              {t.cut}
            </button>
            <button type="button" className="wps-mini">
              <Copy size={13} strokeWidth={1.7} />
              {t.copy}
            </button>
            <button type="button" className="wps-mini">
              <Paintbrush size={13} strokeWidth={1.7} />
              {t.painter}
            </button>
          </div>
        </div>

        <div className="wps-group">
          <div className="wps-col">
            <div className="wps-row">
              <span className="wps-fontbox">
                {t.fontName}
                <ChevronDown size={11} aria-hidden="true" />
              </span>
              <span className="wps-sizebox">
                {t.fontSize}
                <ChevronDown size={11} aria-hidden="true" />
              </span>
              <button type="button" className="wps-ic" aria-label="Increase font size">
                <AArrowUp size={17} strokeWidth={1.7} />
              </button>
              <button type="button" className="wps-ic" aria-label="Decrease font size">
                <AArrowDown size={16} strokeWidth={1.7} />
              </button>
            </div>
            <div className="wps-row">
              <button type="button" className="wps-ic" aria-label="Bold">
                <Bold size={15} strokeWidth={2} />
              </button>
              <button type="button" className="wps-ic" aria-label="Italic">
                <Italic size={15} strokeWidth={1.7} />
              </button>
              <button type="button" className="wps-ic" aria-label="Underline">
                <Underline size={15} strokeWidth={1.7} />
              </button>
              <button type="button" className="wps-ic" aria-label="Strikethrough">
                <Strikethrough size={15} strokeWidth={1.7} />
              </button>
              <button type="button" className="wps-ic" aria-label="Superscript">
                <Superscript size={15} strokeWidth={1.7} />
              </button>
              <button type="button" className="wps-ic" aria-label="Clear formatting">
                <Eraser size={15} strokeWidth={1.7} />
              </button>
              <button type="button" className="wps-ic wps-ic-hl" aria-label="Highlight">
                <Highlighter size={15} strokeWidth={1.7} />
                <i aria-hidden="true" />
              </button>
              <button type="button" className="wps-ic wps-ic-color" aria-label="Font color">
                <Baseline size={15} strokeWidth={1.7} />
                <i aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="wps-group">
          <div className="wps-col">
            <div className="wps-row">
              <button type="button" className="wps-ic" aria-label="Bullets">
                <List size={15} strokeWidth={1.7} />
              </button>
              <button type="button" className="wps-ic" aria-label="Numbering">
                <ListOrdered size={15} strokeWidth={1.7} />
              </button>
              <button type="button" className="wps-ic" aria-label="Decrease indent">
                <IndentDecrease size={15} strokeWidth={1.7} />
              </button>
              <button type="button" className="wps-ic" aria-label="Increase indent">
                <IndentIncrease size={15} strokeWidth={1.7} />
              </button>
            </div>
            <div className="wps-row">
              <button type="button" className="wps-ic is-on" aria-label="Align left">
                <AlignLeft size={15} strokeWidth={1.7} />
              </button>
              <button type="button" className="wps-ic" aria-label="Align center">
                <AlignCenter size={15} strokeWidth={1.7} />
              </button>
              <button type="button" className="wps-ic" aria-label="Align right">
                <AlignRight size={15} strokeWidth={1.7} />
              </button>
              <button type="button" className="wps-ic" aria-label="Justify">
                <AlignJustify size={15} strokeWidth={1.7} />
              </button>
            </div>
          </div>
        </div>

        <div className="wps-group wps-group-styles">
          {t.styles.map((s, i) => (
            <span key={s} className={`wps-style wps-style-${i}${i === 0 ? ' is-active' : ''}`}>
              {s}
            </span>
          ))}
          <span className="wps-style-more" aria-hidden="true">
            <ChevronDown size={12} />
          </span>
        </div>

        <div className="wps-group">
          <div className="wps-minicol">
            <button type="button" className="wps-mini">
              <Search size={13} strokeWidth={1.7} />
              {t.find}
              <ChevronDown size={10} aria-hidden="true" />
            </button>
            <button type="button" className="wps-mini">
              <MousePointer size={13} strokeWidth={1.7} />
              {t.select}
              <ChevronDown size={10} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* 标尺 */}
      <div className="wps-ruler" aria-hidden="true">
        <div className="wps-ruler-inner" />
      </div>

      {/* 纸面画布 + 右侧悬浮工具条 */}
      <div className="wps-canvaswrap">
        <div className="wps-canvas">
          <article className="wps-paper markdown-body">
            <SkinSwitcher className="wps-switch" />
            <h1 className="wps-doc-title">{doc.title}</h1>
            <MarkdownContent markdown={body} baseUrl={doc.sourceUrl} />
          </article>
        </div>
        <div className="wps-sidetools">
          {toolIcons.map((Icon, i) => (
            <button key={t.tools[i]} type="button" title={t.tools[i]} aria-label={t.tools[i]}>
              <Icon size={16} strokeWidth={1.6} />
            </button>
          ))}
        </div>
      </div>

      {/* 底部状态栏 */}
      <div className="wps-status">
        <span>{t.pageLabel(pages)}</span>
        <span>{t.wordsLabel(doc.summary.words)}</span>
        <span className="wps-status-item">
          <SpellCheck size={13} strokeWidth={1.7} aria-hidden="true" />
          {t.spell}
        </span>
        <span className="wps-status-item">
          <Check size={13} strokeWidth={2} aria-hidden="true" />
          {t.saved}
        </span>
        <div className="wps-status-right">
          <button type="button" className="wps-view is-on" aria-label="Page view">
            <FileText size={14} strokeWidth={1.7} />
          </button>
          <button type="button" className="wps-view" aria-label="Read view">
            <BookOpen size={14} strokeWidth={1.7} />
          </button>
          <button type="button" className="wps-zoombtn" aria-label="Zoom out">
            <Minus size={12} strokeWidth={2} />
          </button>
          <span className="wps-zoomtrack" aria-hidden="true">
            <i />
          </span>
          <button type="button" className="wps-zoombtn" aria-label="Zoom in">
            <Plus size={12} strokeWidth={2} />
          </button>
          <span className="wps-zoompct">100%</span>
        </div>
      </div>
    </div>
  )
}

const wps: SkinDefinition = {
  id: 'wps',
  label: 'WPS',
  appName: 'WPS Office',
  fileExtension: 'docx',
  accent: '#e33e38',
  faviconGlyph: 'W',
  i18nNames: {
    zh: { label: 'WPS 文字', appName: 'WPS Office' },
  },
  Surface: WpsSkin,
  Logo: WpsLogo,
}
export default wps
