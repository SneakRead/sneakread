# Contributing to SneakRead

The most welcome contribution is **a new disguise (skin)** — make SneakRead look
like another real app. This guide covers the architecture and how to add one.

## Architecture

```
src/
  core/
    types.ts        # DocumentRecord, SkinId
    content.ts      # pure transforms: articleBody, emailBody, clockLabel, …
    alias.ts        # the user's display name, worn by every disguise
  skins/
    types.ts        # the SkinDefinition interface (Surface + optional Logo)
    shared/         # chrome shared across skins (title bars, MarkdownContent, …)
    index.tsx       # registry — auto-discovers skins via import.meta.glob
    _template/      # copy this to start a new skin (not registered)
    word/ vscode/ claude-code/ docs/ notion/ lark-docs/
    slack/ lark/ dingtalk/ wecom/ wps/ excel/ outlook/ teams/ gmail/
  App.tsx           # the app shell: routing, state, palette, boss-key, home
```

**North star:** _core owns reading/routing/storage; skins own disguise rendering._
A skin never imports the app shell; it imports only `core/*` and `skins/shared/*`.

## Add a skin

1. Copy `src/skins/_template/` to `src/skins/<your-app>/` — `index.tsx` exports a
   `SkinDefinition` as default:

   ```tsx
   import type { SkinDefinition } from '../types'
   import { articleBody } from '../../core/content'
   import './style.css' // your CSS lives IN your folder, prefixed with your id

   function Surface({ doc }: { doc: DocumentRecord }) {
     // Render `doc` as your app. Reuse shared chrome where you can.
     return <div className="myapp">/* title bar, toolbar, body… */</div>
   }

   const skin: SkinDefinition = {
     id: 'myapp',
     label: 'My App',
     appName: 'My App',
     fileExtension: 'myx',
     accent: '#123456',
     Logo: MyAppLogo, // inline-SVG brand mark, shipped in your folder
     Surface,
   }
   export default skin
   ```

2. Add your `id` to the `SkinId` union in `src/core/types.ts` — that's the only
   shared file you touch. (Optionally add it to `ORDER` in `src/skins/index.tsx`
   to control menu position; unknown ids sort to the end automatically.)
3. Ship your CSS as `src/skins/<your-app>/style.css`, every class prefixed with
   a short skin token (`.myapp`, `.ma-*`) so nothing leaks across skins.

## Fidelity checklist (the whole point is 以假乱真)

- [ ] **Pixel-close to the *latest* version** of the real app. Use real assets —
      [Codicons](https://github.com/microsoft/vscode-codicons),
      [Fluent icons](https://github.com/microsoft/fluentui-system-icons),
      [Material Symbols](https://fonts.google.com/icons) — not lookalikes.
- [ ] **Real fonts** (we bundle Inter/Carlito/Roboto/Cascadia Code).
- [ ] **Links stay clickable** — the app intercepts `a[href^=http]` so users keep
      browsing disguised. Don't swallow those clicks.
- [ ] **No global keyboard handlers** that break `Esc` (boss key) or `⌘K`.
- [ ] **No external network** and **no direct `localStorage`** from a skin
      (use `core/alias.ts` for the display name).
- [ ] **No hardcoded clock times** — derive timestamps from `new Date()` via
      `clockLabel`/`minutesAgo`/`daysAgoLabel` in `core/content.ts`, so the
      disguise never shows a time in the future.
- [ ] **Invented seed content only** — sidebar/chat filler must be fictional
      and localized (zh/en at minimum); never real people or real documents.
- [ ] One element carries `data-appmenu="file"` (the real control menu mount),
      and `<SkinSwitcher />` sits at the top of the content.
- [ ] **The menu mount is discoverable at a glance** — put it where the real
      app's own menu lives ("File", the "…" button, the hamburger), give it
      a large hit area, and never bury it among a row of look-alike icons.
      Multiple elements may carry `data-appmenu` (e.g. title bar + status
      hint). Bottom/right-edge mounts are fine — the menu and coach bubble
      auto-flip to stay on screen.
- [ ] Handles empty / very long / RTL markdown without exploding.
- [ ] `pnpm build` passes; include a screenshot in your PR.

## Dev

```bash
pnpm install
pnpm dev      # http://localhost:5173
pnpm build    # tsc + client + SSR prerender
```

By contributing you agree your work is licensed under the [MIT License](LICENSE).
