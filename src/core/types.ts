// Shared domain types + the skin registry metadata. Imported by the app core,
// every skin module, and config — but this file imports nothing app-specific, so
// there are no cycles.

export type SkinId = 'vscode' | 'word' | 'docs' | 'excel' | 'outlook'
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

export type Skin = {
  id: SkinId
  label: string
  appName: string
  extension: string
}

// NOTE: the `skins` metadata array + `skinById` are DERIVED from the registered
// skin modules in src/skins/index.ts — a new skin needs only its SkinId union
// entry above plus its own folder. Nothing to add here.

export const storageKey = 'sneakread-documents-v1'
export const onboardKey = 'sneakread-onboarded-v1'
export const coachKey = 'sneakread-filecoach-v1'
export const panicDocumentId = 'panic-budget-review'
