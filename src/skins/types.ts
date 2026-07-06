import type { ComponentType } from 'react'
import type { DocumentRecord, SkinId } from '../core/types'

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
  /** The disguise. Receives the document to render as that app. */
  Surface: ComponentType<{ doc: DocumentRecord }>
}

export type SkinModule = { default: SkinDefinition }
