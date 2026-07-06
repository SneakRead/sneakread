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

export const skins: Skin[] = [
  { id: 'vscode', label: 'VS Code', appName: 'Visual Studio Code', extension: 'md' },
  { id: 'word', label: 'Word', appName: 'Word', extension: 'docx' },
  { id: 'docs', label: 'Google Docs', appName: 'Google Docs', extension: 'gdoc' },
  { id: 'excel', label: 'Excel', appName: 'Excel', extension: 'xlsx' },
  { id: 'outlook', label: 'Outlook', appName: 'Outlook', extension: 'msg' },
]

export const skinById = (id: SkinId) => skins.find((skin) => skin.id === id) ?? skins[0]

export const storageKey = 'moyu-docx-documents-v3'
export const onboardKey = 'moyu-docx-onboarded-v1'
export const coachKey = 'moyu-docx-filecoach-v1'
export const panicDocumentId = 'panic-budget-review'
