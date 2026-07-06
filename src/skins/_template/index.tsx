// Template skin — copy this folder to src/skins/<your-app>/ and make it real.
// It is NOT registered (the registry skips underscore-prefixed folders), so it
// won't show up in the app until you rename the folder and wire the id.
//
// Checklist to ship it:
//   1. Rename the folder to your app's kebab id, e.g. src/skins/notion/.
//   2. Add that id to the `SkinId` union AND the `skins` array in src/core/types.ts.
//   3. Build the Surface to look pixel-close to the real, latest app.
//   4. Add scoped CSS to src/App.css.
//   5. `pnpm build` must pass; attach a screenshot to your PR.
import type { DocumentRecord, SkinId } from '../../core/types'
import type { SkinDefinition } from '../types'
import { articleBody } from '../../core/content'
import { MarkdownContent } from '../shared'

function Surface({ doc }: { doc: DocumentRecord }) {
  return (
    <div className="template-skin">
      {/* Your app's real chrome goes here: title bar, toolbar, status bar… */}
      <header className="template-skin-bar">{doc.fileName}</header>
      <article className="template-skin-body markdown-body">
        <h1>{doc.title}</h1>
        {/* Reuse shared MarkdownContent, or render `doc` however your app would. */}
        <MarkdownContent markdown={articleBody(doc)} />
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
  Surface,
}
export default template
