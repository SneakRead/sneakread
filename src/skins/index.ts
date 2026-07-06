import type { SkinDefinition } from './types'
import type { SkinId } from '../core/types'

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

export const skinDefinitions: SkinDefinition[] = Array.from(byId.values())

export function getSkin(id: SkinId): SkinDefinition | undefined {
  return byId.get(id)
}
