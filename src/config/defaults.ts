import type { SkinId } from '../core/types'

// The one place the default disguise lives. The home/landing, empty-app state,
// new documents, prerender, and share/sample links all read this — change it
// here and everything (including the SEO landing) follows.
export const DEFAULT_SKIN_ID: SkinId = 'word'
