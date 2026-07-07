import type { ComponentType } from 'react'
import type { DocumentRecord, SkinId, SkinLocaleName } from '../core/types'
import type { Lang } from '../i18n'

// A skin is a self-contained disguise. Drop a folder under src/skins/, export a
// SkinDefinition as the module default, and the registry (src/skins/index.ts)
// auto-discovers it via import.meta.glob — no central switch to edit.
export type SkinDefinition = {
  /** kebab-case, unique, stable — used in URLs (#skin=<id>) and storage. */
  id: SkinId
  /** Menu label, e.g. "Word". */
  label: string
  /** The real app's name, e.g. "Microsoft Word" (used in the tab title). */
  appName: string
  /** Fake file extension for the document name, e.g. "docx". */
  fileExtension: string
  /** Brand accent (hex) for the title bar / favicon. */
  accent: string
  /** 1–2 char glyph for the favicon tile. Defaults to the first letter of `label`. */
  faviconGlyph?: string
  /**
   * Locale overrides for `label`/`appName`. Only Feishu/Lark needs it — the app is
   * literally rebranded by region (飞书/飞书文档 in zh, Lark/Lark Docs in en). Every
   * other disguise is named the same worldwide, so leave this undefined.
   */
  i18nNames?: Partial<Record<Lang, SkinLocaleName>>
  /** The disguise. Receives the document to render as that app. */
  Surface: ComponentType<{ doc: DocumentRecord }>
  /**
   * The real app's brand mark, for the home gallery / menus. Optional — the
   * built-in skins keep theirs in src/logos.tsx; a contributed skin ships its
   * own so it never edits shared files.
   */
  Logo?: ComponentType<{ size?: number; className?: string }>
}

export type SkinModule = { default: SkinDefinition }
