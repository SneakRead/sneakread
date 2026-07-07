// Template skin — copy this folder to src/skins/<your-app>/ and make it real.
// It is NOT registered (the registry skips underscore-prefixed folders), so it
// won't show up in the app until you rename the folder and wire the id.
//
// Checklist to ship it:
//   1. Rename the folder to your app's kebab id, e.g. src/skins/notion/.
//   2. Add that id to the `SkinId` union in src/core/types.ts — the ONLY shared
//      file you touch. (Optionally add it to ORDER in src/skins/index.tsx.)
//   3. Build the Surface to look pixel-close to the real, latest app.
//   4. Ship your CSS as style.css IN THIS FOLDER (uncomment the import below),
//      every class prefixed with your skin token so nothing leaks.
//   5. Ship your brand mark as an inline-SVG `Logo` component here too.
//   6. No hardcoded clock times — use clockLabel/minutesAgo/daysAgoLabel from
//      core/content so the disguise never shows a time in the future.
//   7. `pnpm build` must pass; attach a screenshot to your PR.
import type { DocumentRecord, SkinId } from '../../core/types'
import type { SkinDefinition } from '../types'
import { articleBody } from '../../core/content'
import { MarkdownContent, SkinSwitcher } from '../shared'
// import './style.css'

function Logo({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect width="48" height="48" rx="10" fill="#3b82f6" />
      <text x="24" y="32" textAnchor="middle" fontSize="24" fontWeight="700" fill="#fff">
        M
      </text>
    </svg>
  )
}

function Surface({ doc }: { doc: DocumentRecord }) {
  return (
    <div className="template-skin">
      {/* Your app's real chrome goes here: title bar, toolbar, status bar…
          Exactly one element must carry data-appmenu="file" — it mounts the
          real control menu (open URL, switch skins, language, boss key). */}
      <header className="template-skin-bar" data-appmenu="file">
        {doc.fileName}
      </header>
      <article className="template-skin-body markdown-body">
        <SkinSwitcher />
        <h1>{doc.title}</h1>
        {/* Reuse shared MarkdownContent, or render `doc` however your app would. */}
        <MarkdownContent markdown={articleBody(doc)} baseUrl={doc.sourceUrl} />
      </article>
    </div>
  )
}

const template: SkinDefinition = {
  // Replace with your new id (also add it to SkinId in core/types.ts).
  id: 'template' as SkinId,
  label: 'My App',
  appName: 'My App',
  fileExtension: 'myx',
  accent: '#3b82f6',
  Logo,
  Surface,
}
export default template
