// A tiny context so the chrome injected *inside* a skin (the content-top skin
// switcher, and later anything else) can reach the app's switch handler and the
// skin roster — without changing the fixed `Surface({ doc })` contract. The app
// shell provides it around <SkinSurface>; skins consume it via <SkinSwitcher>.
import { createContext, useContext } from 'react'
import type { Skin, SkinId } from '../core/types'

export type SkinControlsValue = {
  /** The skin currently on screen (so the switcher can mark the active one). */
  activeSkin: SkinId
  /** Every registered skin, in menu order — for the switcher / gallery. */
  skins: Skin[]
  /** Switch the active document to another disguise. */
  onSwitchSkin: (id: SkinId) => void
}

const SkinControlsContext = createContext<SkinControlsValue | null>(null)

export const SkinControlsProvider = SkinControlsContext.Provider

export function useSkinControls(): SkinControlsValue | null {
  return useContext(SkinControlsContext)
}
