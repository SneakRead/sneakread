import type { SkinDefinition } from './types'
import type { Skin, SkinId } from '../core/types'

// Auto-discover every skin: any src/skins/<name>/index.tsx that default-exports a
// SkinDefinition is registered. Drop in a folder — no central list to edit.
// `[a-z]*` skips underscore-prefixed scaffolding (e.g. _template) at build time.
const modules = import.meta.glob('./[a-z]*/index.tsx', { eager: true }) as Record<
  string,
  { default?: SkinDefinition }
>

const byId = new Map<SkinId, SkinDefinition>()
for (const mod of Object.values(modules)) {
  const def = mod.default
  if (!def) continue // e.g. skins/shared has no default export
  if (byId.has(def.id)) throw new Error(`Duplicate skin id: ${def.id}`)
  byId.set(def.id, def)
}

// Menu order (Word first — it's the default). Unknown/new skins sort to the end,
// so a contributed skin still shows up without editing anything here.
const ORDER: SkinId[] = [
  'word',
  'vscode',
  'docs',
  'notion',
  'lark-docs',
  'slack',
  'lark',
  'excel',
  'outlook',
]
const rank = (id: SkinId) => {
  const i = ORDER.indexOf(id)
  return i === -1 ? ORDER.length : i
}

export const skinDefinitions: SkinDefinition[] = Array.from(byId.values()).sort(
  (a, b) => rank(a.id) - rank(b.id),
)

// The menu metadata is derived from the registered skins — no central list to
// keep in sync. Contributors only add their id to the SkinId union (for types).
export const skins: Skin[] = skinDefinitions.map((d) => ({
  id: d.id,
  label: d.label,
  appName: d.appName,
  extension: d.fileExtension,
  accent: d.accent,
  faviconGlyph: d.faviconGlyph ?? d.label.slice(0, 1).toUpperCase(),
  i18nNames: d.i18nNames,
}))

export const skinById = (id: SkinId): Skin => skins.find((s) => s.id === id) ?? skins[0]

export function getSkin(id: SkinId): SkinDefinition | undefined {
  return byId.get(id)
}
