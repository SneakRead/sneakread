// The user's display alias, worn by every disguise (avatar initials, Notion
// workspace name, the Feishu doc watermark). A disguise wearing YOUR name
// survives a close look; "M" is the neutral default. Stored locally only.
const aliasKey = 'sneakread-alias'

export function getAlias(): string {
  try {
    return (typeof localStorage === 'undefined' ? '' : localStorage.getItem(aliasKey)) || ''
  } catch {
    return ''
  }
}

export function setAlias(value: string) {
  try {
    if (typeof localStorage === 'undefined') return
    const clean = value.trim()
    if (clean) localStorage.setItem(aliasKey, clean)
    else localStorage.removeItem(aliasKey)
  } catch {
    // ignore storage failures
  }
}

export function aliasInitial(fallback = 'M'): string {
  const alias = getAlias().trim()
  return alias ? alias.charAt(0).toUpperCase() : fallback
}
