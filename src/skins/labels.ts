// Resolve a skin's user-facing name for the current language. Only Feishu/Lark
// carries locale overrides (飞书/飞书文档 ⇄ Lark/Lark Docs); every other skin
// returns its single worldwide name. Leaf module — imports only types, so both
// the app shell and the shared skin chrome can use it without import cycles.
import type { Skin } from '../core/types'
import type { Lang } from '../i18n'

export function skinLabel(skin: Skin, lang: Lang): string {
  return skin.i18nNames?.[lang]?.label ?? skin.label
}

export function skinAppName(skin: Skin, lang: Lang): string {
  return skin.i18nNames?.[lang]?.appName ?? skin.appName
}
