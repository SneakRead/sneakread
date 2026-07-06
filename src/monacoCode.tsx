import { useEffect, useRef } from 'react'
import * as monaco from 'monaco-editor'
// Self-host the editor worker (no CDN — the app's CSP would block one). Markdown
// only needs the base editor worker, so we don't wire the language workers.
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

;(self as unknown as { MonacoEnvironment: monaco.Environment }).MonacoEnvironment = {
  getWorker: () => new EditorWorker(),
}

let themeReady = false
function ensureTheme() {
  if (themeReady) return
  themeReady = true
  // Approximates VS Code's "Default Dark Modern".
  monaco.editor.defineTheme('sneak-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#1f1f1f',
      'editorGutter.background': '#1f1f1f',
      'editorLineNumber.foreground': '#6e7681',
      'editorLineNumber.activeForeground': '#cccccc',
      'editor.selectionBackground': '#264f78',
      'editor.lineHighlightBackground': '#2a2d2e',
      'editor.lineHighlightBorder': '#00000000',
      'editorCursor.foreground': '#aeafad',
      'editorIndentGuide.background1': '#404040',
      'minimap.background': '#1f1f1f',
    },
  })
}

export default function MonacoCode({ text }: { text: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const edRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    ensureTheme()
    const editor = monaco.editor.create(host, {
      value: text,
      language: 'markdown',
      theme: 'sneak-dark',
      readOnly: true,
      domReadOnly: true,
      minimap: { enabled: true },
      lineNumbers: 'on',
      fontFamily: "'Cascadia Code', Menlo, Consolas, monospace",
      fontSize: 13,
      lineHeight: 20,
      scrollBeyondLastLine: false,
      renderLineHighlight: 'all',
      wordWrap: 'on',
      smoothScrolling: true,
      contextmenu: false,
      automaticLayout: true,
      guides: { indentation: true },
      scrollbar: { verticalScrollbarSize: 14, horizontalScrollbarSize: 12 },
      padding: { top: 6 },
    })
    edRef.current = editor
    return () => {
      editor.dispose()
      edRef.current = null
    }
    // Create once; text changes are pushed via the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const ed = edRef.current
    if (ed && ed.getValue() !== text) ed.setValue(text)
  }, [text])

  return <div ref={hostRef} className="vsc-monaco" />
}
