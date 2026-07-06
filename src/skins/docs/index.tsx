import type { DocumentRecord } from '../../core/types'
import type { SkinDefinition } from '../types'
import { articleBody } from '../../core/content'
import { MSym, MarkdownContent } from '../shared'
import { DocsLogo } from '../../logos'

// ===== BLOCK APPENDED BELOW =====
const gdMenus = ['File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Extensions', 'Help']

export function DocsSkin({ doc }: { doc: DocumentRecord }) {
  const body = articleBody(doc)
  return (
    <div className="gdocs">
      <div className="gdocs-topbar">
        <span className="gdocs-icon">
          <DocsLogo size={40} />
        </span>
        <div className="gdocs-title-block">
          <div className="gdocs-title-row">
            <div className="gdocs-title">{doc.fileName.replace(/\.[^.]+$/, '')}</div>
            <MSym name="star" className="gd-title-ic" />
            <MSym name="drive_file_move" className="gd-title-ic" />
            <MSym name="cloud_done" className="gd-title-ic" />
          </div>
          <div className="gdocs-menu">
            {gdMenus.map((item) => (
              <span
                key={item}
                className={item === 'File' ? 'is-clickable' : undefined}
                data-appmenu={item === 'File' ? 'file' : undefined}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="gdocs-actions">
          <button type="button" className="gd-topic" aria-label="History">
            <MSym name="history" />
          </button>
          <button type="button" className="gd-topic" aria-label="Comment history">
            <MSym name="chat_bubble_outline" />
          </button>
          <button type="button" className="gd-topic gd-video" aria-label="Call">
            <MSym name="videocam" />
          </button>
          <button type="button" className="gdocs-share">
            <MSym name="lock" /> Share
          </button>
          <span className="gdocs-avatar">M</span>
        </div>
      </div>
      <div className="gdocs-toolbar">
        <span className="gd-pill">
          <MSym name="search" />
        </span>
        <span className="gd-tool" aria-label="Undo">
          <MSym name="undo" />
        </span>
        <span className="gd-tool" aria-label="Redo">
          <MSym name="redo" />
        </span>
        <span className="gd-tool" aria-label="Print">
          <MSym name="print" />
        </span>
        <span className="gd-tool" aria-label="Spellcheck">
          <MSym name="spellcheck" />
        </span>
        <span className="gd-tool" aria-label="Paint format">
          <MSym name="format_paint" />
        </span>
        <span className="gd-tool gd-zoom">100%</span>
        <span className="gd-sep" />
        <span className="gd-tool gd-wide">Normal text <MSym name="arrow_drop_down" /></span>
        <span className="gd-sep" />
        <span className="gd-tool gd-wide">Arial <MSym name="arrow_drop_down" /></span>
        <span className="gd-sep" />
        <span className="gd-tool gd-mini" aria-label="Decrease font">
          <MSym name="remove" />
        </span>
        <span className="gd-tool gd-size">11</span>
        <span className="gd-tool gd-mini" aria-label="Increase font">
          <MSym name="add" />
        </span>
        <span className="gd-sep" />
        <span className="gd-tool" aria-label="Bold">
          <MSym name="format_bold" />
        </span>
        <span className="gd-tool" aria-label="Italic">
          <MSym name="format_italic" />
        </span>
        <span className="gd-tool" aria-label="Underline">
          <MSym name="format_underlined" />
        </span>
        <span className="gd-tool" aria-label="Text color">
          <MSym name="format_color_text" />
        </span>
        <span className="gd-tool" aria-label="Highlight">
          <MSym name="border_color" />
        </span>
        <span className="gd-sep" />
        <span className="gd-tool" aria-label="Insert link">
          <MSym name="add_link" />
        </span>
        <span className="gd-tool" aria-label="Add comment">
          <MSym name="add_comment" />
        </span>
        <span className="gd-tool" aria-label="Insert image">
          <MSym name="image" />
        </span>
        <span className="gd-sep" />
        <span className="gd-tool" aria-label="Align">
          <MSym name="format_align_left" />
        </span>
        <span className="gd-tool" aria-label="Line spacing">
          <MSym name="format_line_spacing" />
        </span>
        <span className="gd-tool" aria-label="Checklist">
          <MSym name="checklist" />
        </span>
        <span className="gd-tool" aria-label="Bulleted list">
          <MSym name="format_list_bulleted" />
        </span>
        <span className="gd-tool" aria-label="Numbered list">
          <MSym name="format_list_numbered" />
        </span>
        <span className="gd-toolbar-right">
          <span className="gdocs-mode">
            <MSym name="edit" /> Editing <MSym name="arrow_drop_down" />
          </span>
          <span className="gd-tool" aria-label="Hide toolbar">
            <MSym name="expand_less" />
          </span>
        </span>
      </div>
      <div className="paper-canvas gdocs-canvas">
        <article className="paper gdocs-page markdown-body">
          <h1>{doc.title}</h1>
          <MarkdownContent markdown={body} baseUrl={doc.sourceUrl} />
        </article>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Excel
 * ------------------------------------------------------------------ */


const docs: SkinDefinition = {
  id: 'docs',
  label: 'Google Docs',
  appName: 'Google Docs',
  fileExtension: 'gdoc',
  accent: '#4285f4',
  Surface: DocsSkin,
}
export default docs
