# Contributing to SneakRead

The most welcome contribution is **a new disguise (skin)** — make SneakRead look
like another real app. This guide covers the architecture and how to add one.

## Architecture

```
src/
  core/
    types.ts        # DocumentRecord, SkinId, the skin registry metadata
    content.ts      # pure transforms: articleBody, emailBody, extractLinks, …
  skins/
    types.ts        # the SkinDefinition interface
    shared/         # chrome shared across skins (title bars, MarkdownContent, …)
    index.ts        # registry — auto-discovers skins via import.meta.glob
    _template/      # copy this to start a new skin (not registered)
    vscode/ word/ docs/ excel/ outlook/   # the five built-in disguises
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
     Surface,
   }
   export default skin
   ```

2. Add your `id` to the `SkinId` union in `src/core/types.ts` and a row to `skins`.
3. Add CSS (scoped to your skin's class) in `src/App.css`.

## Fidelity checklist (the whole point is 以假乱真)

- [ ] **Pixel-close to the *latest* version** of the real app. Use real assets —
      [Codicons](https://github.com/microsoft/vscode-codicons),
      [Fluent icons](https://github.com/microsoft/fluentui-system-icons),
      [Material Symbols](https://fonts.google.com/icons) — not lookalikes.
- [ ] **Real fonts** (we bundle Inter/Carlito/Roboto/Cascadia Code).
- [ ] **Links stay clickable** — the app intercepts `a[href^=http]` so users keep
      browsing disguised. Don't swallow those clicks.
- [ ] **No global keyboard handlers** that break `Esc` (boss key) or `⌘K`.
- [ ] **No external network** and **no direct `localStorage`** from a skin.
- [ ] Handles empty / very long / RTL markdown without exploding.
- [ ] `pnpm build` passes; include a screenshot in your PR.

## Dev

```bash
pnpm install
pnpm dev      # http://localhost:5173
pnpm build    # tsc + client + SSR prerender
```

By contributing you agree your work is licensed under the [MIT License](LICENSE).
