// Shared domain types + the skin registry metadata. Imported by the app core,
// every skin module, and config — but this file imports nothing app-specific, so
// there are no cycles.

export type SkinId =
  | 'vscode'
  | 'word'
  | 'docs'
  | 'excel'
  | 'outlook'
  | 'lark-docs'
  | 'slack'
  | 'lark'
  | 'notion'
export type LoadState = 'idle' | 'loading' | 'ready' | 'error'
export type PageKind = 'home' | 'list' | 'article' | 'unknown'

export type Summary = {
  words: number
  headings: number
  links: number
  images: number
  tables: number
}

export type ReaderDoc = {
  title: string
  sourceUrl: string
  markdown: string
  fetchedAt: string
  raw: string
  summary: Summary
}

export type DocumentRecord = ReaderDoc & {
  id: string
  fileName: string
  skin: SkinId
  pageKind: PageKind
  lastOpenedAt: string
  projectName: string
  sizeBytes: number
  openCount: number
  lastSyncedAt: string
}

// A locale override for a skin's user-facing name. Only Feishu/Lark needs this
// (飞书/飞书文档 in zh, Lark/Lark Docs in en) — every other app is named the
// same worldwide, so `i18nNames` stays undefined for them.
export type SkinLocaleName = { label: string; appName: string }

export type Skin = {
  id: SkinId
  label: string
  appName: string
  extension: string
  /** Brand accent (hex) — drives the derived favicon so there's no central list. */
  accent: string
  /** 1–2 char glyph drawn on the favicon tile (e.g. 'W', '<>', '#'). */
  faviconGlyph: string
  /** Locale overrides for label/appName, keyed by Lang. Undefined = same everywhere. */
  i18nNames?: Record<string, SkinLocaleName>
}

// NOTE: the `skins` metadata array + `skinById` are DERIVED from the registered
// skin modules in src/skins/index.ts — a new skin needs only its SkinId union
// entry above plus its own folder. Nothing to add here.

export const storageKey = 'sneakread-documents-v1'
export const onboardKey = 'sneakread-onboarded-v1'
export const coachKey = 'sneakread-filecoach-v1'
export const panicDocumentId = 'panic-budget-review'
