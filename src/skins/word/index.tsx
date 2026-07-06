import type { DocumentRecord } from '../../core/types'
import type { SkinDefinition } from '../types'
import { articleBody } from '../../core/content'
import { WordFrame, MarkdownContent } from '../shared'

// ===== BLOCK APPENDED BELOW =====
export function WordSkin({ doc }: { doc: DocumentRecord }) {
  const body = articleBody(doc)
  return (
    <WordFrame fileName={doc.fileName} statusWords={doc.summary.words}>
      <article className="paper markdown-body">
        <h1>{doc.title}</h1>
        <MarkdownContent markdown={body} baseUrl={doc.sourceUrl} />
      </article>
    </WordFrame>
  )
}

const word: SkinDefinition = {
  id: 'word',
  label: 'Word',
  appName: 'Word',
  fileExtension: 'docx',
  accent: '#2b579a',
  Surface: WordSkin,
}
export default word
