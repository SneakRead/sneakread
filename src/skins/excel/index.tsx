import { useMemo, useState } from 'react'
import type { DocumentRecord } from '../../core/types'
import type { SkinDefinition } from '../types'
import {
  articleBody,
  getSiteLabel,
  extractHeadings,
  extractLinks,
  extractImages,
} from '../../core/content'
import { MsTitleBar, MsRibbonTabs, MsRibbonRight, MarkdownContent } from '../shared'
import { ExcelLogo } from '../../logos'
import {
  ClipboardPaste24Regular,
  Cut20Regular,
  Copy20Regular,
  TextBold20Regular,
  TextItalic20Regular,
  TextUnderline20Regular,
  TextColor20Regular,
  BorderAll20Regular,
  PaintBucket20Regular,
  TextAlignLeft20Regular,
  TextAlignCenter20Regular,
  TextAlignRight20Regular,
  TextWrapOff20Regular,
  TableCellsMerge20Regular,
  Money20Regular,
  TableInsertRow20Regular,
  TableDeleteRow20Regular,
  Table20Regular,
  Autosum20Regular,
  ArrowSortDownLines20Regular,
  Search20Regular,
} from '@fluentui/react-icons'

// ===== BLOCK APPENDED BELOW =====
type XlCell = { text: string; href?: string }
const isHttpUrl = (s: string) => /^https?:\/\//i.test(s.trim())
const colLetter = (i: number) =>
  i < 26
    ? String.fromCharCode(65 + i)
    : String.fromCharCode(64 + Math.floor(i / 26)) + String.fromCharCode(65 + (i % 26))

// A real markdown table in the content (e.g. the panic budget) becomes the sheet.
function markdownTableToSheet(markdown: string): XlCell[][] | null {
  const lines = markdown.split('\n')
  const isRow = (line: string) => /^\s*\|.*\|\s*$/.test(line)
  const start = lines.findIndex(isRow)
  if (start < 0) return null
  const table: string[] = []
  for (let i = start; i < lines.length; i++) {
    if (isRow(lines[i])) table.push(lines[i])
    else if (table.length) break
  }
  if (table.length < 2) return null
  if (!/^\s*\|?[\s:|-]+\|?\s*$/.test(table[1])) return null
  const parseRow = (line: string) =>
    line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())
  const header = parseRow(table[0])
  if (header.length < 2) return null
  const toCells = (arr: string[]): XlCell[] =>
    arr.map((tx) => ({ text: tx, href: isHttpUrl(tx) ? tx : undefined }))
  return [header.map((tx) => ({ text: tx })), ...table.slice(2).map(parseRow).map(toCells)]
}

function auditSheet(doc: DocumentRecord): XlCell[][] {
  const headings = extractHeadings(doc.markdown)
  const c = (text: string): XlCell => ({ text })
  return [
    [c('Metric'), c('Value'), c('Source'), c('Updated')],
    [c('Title'), c(doc.title), c(getSiteLabel(doc.sourceUrl)), c(doc.fetchedAt)],
    [c('Words'), c(String(doc.summary.words)), c('Markdown'), c('auto')],
    [c('Headings'), c(String(doc.summary.headings)), c('Markdown'), c('auto')],
    [c('Links'), c(String(doc.summary.links)), c('Markdown'), c('auto')],
    [c('Images'), c(String(doc.summary.images)), c('Markdown'), c('auto')],
    ...headings.slice(0, 12).map((h, i) => [c(`Section ${i + 1}`), c(h), c('Heading'), c('')]),
  ]
}

// Sheet tabs are real: Summary/Raw/Links/Images each render a different grid,
// and the Links/Images sheets have clickable URL cells for continuous browsing.
function buildSheets(doc: DocumentRecord): { name: string; rows: XlCell[][] }[] {
  const links = extractLinks(doc.markdown)
  const images = extractImages(doc.markdown)
  const summary = markdownTableToSheet(doc.markdown) ?? auditSheet(doc)
  const linkRows: XlCell[][] = [
    [{ text: '#' }, { text: 'Link text' }, { text: 'URL' }],
    ...links.map((l, i) => [
      { text: String(i + 1) },
      { text: l.text, href: l.href },
      { text: l.href, href: l.href },
    ]),
  ]
  const imageRows: XlCell[][] = [
    [{ text: '#' }, { text: 'Alt' }, { text: 'URL' }],
    ...images.map((im, i) => [
      { text: String(i + 1) },
      { text: im.alt || 'Image' },
      { text: im.src, href: im.src },
    ]),
  ]
  const rawRows: XlCell[][] = [
    [{ text: 'Source (markdown)' }],
    ...articleBody(doc)
      .split('\n')
      .slice(0, 400)
      .map((line) => [{ text: line }]),
  ]
  return [
    { name: 'Summary', rows: summary },
    { name: 'Raw', rows: rawRows },
    { name: 'Links', rows: linkRows.length > 1 ? linkRows : [[{ text: 'No links' }]] },
    { name: 'Images', rows: imageRows.length > 1 ? imageRows : [[{ text: 'No images' }]] },
  ]
}

function XlSheet({ rows }: { rows: XlCell[][] }) {
  const cols = Math.max(1, ...rows.map((r) => r.length))
  const letters = Array.from({ length: cols }, (_, i) => colLetter(i))
  return (
    <table className="xl-grid">
      <thead>
        <tr>
          <th className="xl-corner" />
          {letters.map((l) => (
            <th key={l} className="xl-colh">
              {l}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, r) => (
          <tr key={r}>
            <td className="xl-rowh">{r + 1}</td>
            {letters.map((_, ci) => {
              const cell = row[ci]
              return (
                <td key={ci} className={r === 0 ? 'xl-cell xl-head' : 'xl-cell'}>
                  {cell?.href ? (
                    <a href={cell.href} rel="noreferrer">
                      {cell.text}
                    </a>
                  ) : (
                    cell?.text || ''
                  )}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const excelTabs = ['File', 'Home', 'Insert', 'Draw', 'Page Layout', 'Formulas', 'Data', 'Review', 'View', 'Automate', 'Help']

// Real Excel Home ribbon with Fluent icon buttons (parity with the Word ribbon),
// shared by the reader Excel skin and the panic budget.
function ExcelHomeRibbon() {
  return (
    <div className="ms-ribbon excel-ribbon">
      <div className="ms-group">
        <div className="ms-row">
          <button type="button" className="ms-btn-lg">
            <ClipboardPaste24Regular />
            <span>Paste</span>
          </button>
          <div className="ms-col">
            <button type="button" className="ms-btn-row">
              <Cut20Regular /> Cut
            </button>
            <button type="button" className="ms-btn-row">
              <Copy20Regular /> Copy
            </button>
          </div>
        </div>
        <div className="ms-group-name">Clipboard</div>
      </div>

      <div className="ms-group">
        <div className="ms-col">
          <div className="ms-row ms-font-row">
            <span className="ms-fontbox">Calibri</span>
            <span className="ms-sizebox">11</span>
          </div>
          <div className="ms-row">
            <button type="button" className="ms-btn-sm">
              <TextBold20Regular />
            </button>
            <button type="button" className="ms-btn-sm">
              <TextItalic20Regular />
            </button>
            <button type="button" className="ms-btn-sm">
              <TextUnderline20Regular />
            </button>
            <button type="button" className="ms-btn-sm">
              <BorderAll20Regular />
            </button>
            <button type="button" className="ms-btn-sm">
              <PaintBucket20Regular />
            </button>
            <button type="button" className="ms-btn-sm">
              <TextColor20Regular />
            </button>
          </div>
        </div>
        <div className="ms-group-name">Font</div>
      </div>

      <div className="ms-group">
        <div className="ms-col">
          <div className="ms-row">
            <button type="button" className="ms-btn-sm">
              <TextAlignLeft20Regular />
            </button>
            <button type="button" className="ms-btn-sm">
              <TextAlignCenter20Regular />
            </button>
            <button type="button" className="ms-btn-sm">
              <TextAlignRight20Regular />
            </button>
          </div>
          <div className="ms-row">
            <button type="button" className="ms-btn-row">
              <TextWrapOff20Regular /> Wrap
            </button>
            <button type="button" className="ms-btn-row">
              <TableCellsMerge20Regular /> Merge
            </button>
          </div>
        </div>
        <div className="ms-group-name">Alignment</div>
      </div>

      <div className="ms-group">
        <div className="ms-col">
          <div className="ms-row ms-font-row">
            <span className="ms-fontbox ms-numbox">General ▾</span>
          </div>
          <div className="ms-row">
            <button type="button" className="ms-btn-sm">
              <Money20Regular />
            </button>
            <button type="button" className="ms-btn-sm ms-btn-txt">
              %
            </button>
            <button type="button" className="ms-btn-sm ms-btn-txt">
              .00
            </button>
          </div>
        </div>
        <div className="ms-group-name">Number</div>
      </div>

      <div className="ms-group">
        <div className="ms-row">
          <button type="button" className="ms-btn-row">
            <TableInsertRow20Regular /> Insert
          </button>
          <button type="button" className="ms-btn-row">
            <TableDeleteRow20Regular /> Delete
          </button>
          <button type="button" className="ms-btn-row">
            <Table20Regular /> Format
          </button>
        </div>
        <div className="ms-group-name">Cells</div>
      </div>

      <div className="ms-group">
        <div className="ms-row">
          <button type="button" className="ms-btn-row">
            <Autosum20Regular /> AutoSum
          </button>
          <button type="button" className="ms-btn-row">
            <ArrowSortDownLines20Regular /> Sort
          </button>
          <button type="button" className="ms-btn-row">
            <Search20Regular /> Find
          </button>
        </div>
        <div className="ms-group-name">Editing</div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Panic budget — a genuinely modelled FY P&L (formulas, chart, sheets)
 * ------------------------------------------------------------------ */

const BUDGET_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

type BCell = {
  t?: string // text (labels / headers)
  v?: number // numeric value
  f?: string // A1 formula (shown in the formula bar)
  fmt?: 'num' | 'pct' | 'int'
  kind?: 'title' | 'section' | 'header' | 'label' | 'total' | 'fylabel'
  bold?: boolean
  red?: boolean // force red (negative accounting style)
}

// Compound a monthly series from a January base and a month-over-month growth.
function bseries(base: number, g: number) {
  const a: number[] = []
  let v = base
  for (let i = 0; i < 12; i++) {
    if (i) v = v * (1 + g)
    a.push(Math.round(v))
  }
  return a
}
const bsum = (arr: number[]) => arr.reduce((s, n) => s + n, 0)

type BudgetModel = {
  grid: BCell[][]
  chart: { rev: number[]; ebitda: number[] }
}

// A driver row: hard-coded January input, then =prev*(1+g) each month.
const BUDGET_DRIVERS = [
  { key: 'Subscription', base: 820, g: 0.045, row: 5 },
  { key: 'Services', base: 145, g: 0.03, row: 6 },
  { key: 'Marketplace', base: 60, g: 0.06, row: 7 },
  { key: 'Cloud & Hosting', base: 138, g: 0.03, row: 11 },
  { key: 'Payment Fees', base: 41, g: 0.04, row: 12 },
  { key: 'Salaries & Benefits', base: 560, g: 0.012, row: 18 },
  { key: 'Sales & Marketing', base: 240, g: 0.015, row: 19 },
  { key: 'Research & Development', base: 180, g: 0.008, row: 20 },
  { key: 'General & Admin', base: 95, g: 0.006, row: 21 },
  { key: 'Software & Tools', base: 46, g: 0.01, row: 23 },
] as const

// Travel is lumpy (conference/offsite months) — realism over a clean curve.
const BUDGET_TRAVEL = [22, 20, 60, 24, 22, 72, 26, 24, 66, 28, 26, 84]
const BUDGET_HEADCOUNT = [58, 59, 61, 62, 64, 66, 67, 69, 71, 72, 74, 76]
const BUDGET_START_CASH = 4200

function buildBudget(): BudgetModel {
  const series: Record<string, number[]> = {}
  for (const d of BUDGET_DRIVERS) series[d.key] = bseries(d.base, d.g)
  series['Travel & Events'] = BUDGET_TRAVEL

  const perMonth = (keys: string[]) =>
    BUDGET_MONTHS.map((_, m) => keys.reduce((s, k) => s + series[k][m], 0))
  const revKeys = ['Subscription', 'Services', 'Marketplace']
  const cogsKeys = ['Cloud & Hosting', 'Payment Fees']
  const opexKeys = [
    'Salaries & Benefits',
    'Sales & Marketing',
    'Research & Development',
    'General & Admin',
    'Travel & Events',
    'Software & Tools',
  ]
  const totRev = perMonth(revKeys)
  const totCogs = perMonth(cogsKeys)
  const gp = totRev.map((r, m) => r - totCogs[m])
  const gm = gp.map((g, m) => g / totRev[m])
  const totOpex = perMonth(opexKeys)
  const ebitda = gp.map((g, m) => g - totOpex[m])
  const em = ebitda.map((e, m) => e / totRev[m])
  const cash: number[] = []
  for (let m = 0; m < 12; m++) cash.push((m ? cash[m - 1] : BUDGET_START_CASH) + ebitda[m])

  const L = (c: number) => colLetter(c + 1) // data col 0 = Jan = column B
  const FY = 'N'

  const grid: BCell[][] = []
  const push = (cells: BCell[]) => grid.push(cells)
  const blank = () => push([{}])

  // Row 1 — report title
  push([{ t: 'FY2026 Operating Budget — Q3 Reforecast   ($000s)', kind: 'title' }])
  blank() // row 2
  // Row 3 — column header
  push([
    { t: 'Line item', kind: 'header' },
    ...BUDGET_MONTHS.map((mm) => ({ t: mm, kind: 'header' as const })),
    { t: 'FY2026', kind: 'header' },
  ])

  const driverRow = (label: string, key: string, g: number) => {
    const s = series[key]
    push([
      { t: label, kind: 'label' },
      ...s.map((v, m) => ({
        v,
        fmt: 'num' as const,
        f: m === 0 ? undefined : `=${L(m - 1)}${grid.length + 1}*(1+${g})`,
      })),
      { v: bsum(s), fmt: 'num', f: `=SUM(B${grid.length + 1}:M${grid.length + 1})`, bold: true },
    ])
  }
  const computedRow = (
    label: string,
    vals: number[],
    fyVal: number,
    monthF: (l: string) => string,
    fyF: string,
    opts: { fmt?: 'num' | 'pct' | 'int'; total?: boolean } = {},
  ) => {
    const rn = grid.length + 1
    push([
      { t: label, kind: opts.total ? 'total' : 'label', bold: opts.total },
      ...vals.map((v, m) => ({
        v,
        fmt: opts.fmt ?? 'num',
        f: monthF(L(m)).replace(/#/g, String(rn)),
        bold: opts.total,
      })),
      { v: fyVal, fmt: opts.fmt ?? 'num', f: fyF.replace(/#/g, String(rn)), bold: opts.total },
    ])
  }

  // Revenue
  push([{ t: 'Revenue', kind: 'section' }]) // row 4
  driverRow('  Subscription', 'Subscription', 0.045) // 5
  driverRow('  Services', 'Services', 0.03) // 6
  driverRow('  Marketplace', 'Marketplace', 0.06) // 7
  computedRow(
    'Total Revenue',
    totRev,
    bsum(totRev),
    (l) => `=SUM(${l}5:${l}7)`,
    `=SUM(B8:M8)`,
    { total: true },
  ) // 8
  blank() // 9
  // Cost of revenue
  push([{ t: 'Cost of Revenue', kind: 'section' }]) // 10
  driverRow('  Cloud & Hosting', 'Cloud & Hosting', 0.03) // 11
  driverRow('  Payment Fees', 'Payment Fees', 0.04) // 12
  computedRow(
    'Total COGS',
    totCogs,
    bsum(totCogs),
    (l) => `=SUM(${l}11:${l}12)`,
    `=SUM(B13:M13)`,
    { total: true },
  ) // 13
  computedRow('Gross Profit', gp, bsum(gp), (l) => `=${l}8-${l}13`, `=N8-N13`, {
    total: true,
  }) // 14
  computedRow('Gross Margin %', gm, bsum(gp) / bsum(totRev), (l) => `=${l}14/${l}8`, `=N14/N8`, {
    fmt: 'pct',
  }) // 15
  blank() // 16
  // Operating expenses
  push([{ t: 'Operating Expenses', kind: 'section' }]) // 17
  driverRow('  Salaries & Benefits', 'Salaries & Benefits', 0.012) // 18
  driverRow('  Sales & Marketing', 'Sales & Marketing', 0.015) // 19
  driverRow('  Research & Development', 'Research & Development', 0.008) // 20
  driverRow('  General & Admin', 'General & Admin', 0.006) // 21
  push([
    { t: '  Travel & Events', kind: 'label' },
    ...BUDGET_TRAVEL.map((v) => ({ v, fmt: 'num' as const })),
    { v: bsum(BUDGET_TRAVEL), fmt: 'num', f: `=SUM(B22:M22)`, bold: true },
  ]) // 22
  driverRow('  Software & Tools', 'Software & Tools', 0.01) // 23
  computedRow(
    'Total OpEx',
    totOpex,
    bsum(totOpex),
    (l) => `=SUM(${l}18:${l}23)`,
    `=SUM(B24:M24)`,
    { total: true },
  ) // 24
  blank() // 25
  computedRow('EBITDA', ebitda, bsum(ebitda), (l) => `=${l}14-${l}24`, `=N14-N24`, {
    total: true,
  }) // 26
  computedRow(
    'EBITDA Margin %',
    em,
    bsum(ebitda) / bsum(totRev),
    (l) => `=${l}26/${l}8`,
    `=N26/N8`,
    { fmt: 'pct' },
  ) // 27
  blank() // 28
  computedRow(
    'Headcount (EOP)',
    BUDGET_HEADCOUNT,
    BUDGET_HEADCOUNT[11],
    () => ``,
    `=M29`,
    { fmt: 'int' },
  ) // 29
  push([
    { t: 'Cash Balance', kind: 'label', bold: true },
    ...cash.map((v, m) => ({
      v,
      fmt: 'num' as const,
      f: m === 0 ? `=${BUDGET_START_CASH}+B26` : `=${L(m - 1)}30+${L(m)}26`,
      bold: true,
    })),
    { v: cash[11], fmt: 'num', f: `=M30`, bold: true },
  ]) // 30
  void FY

  return { grid, chart: { rev: totRev, ebitda } }
}

function fmtBudget(cell: BCell): string {
  if (cell.v === undefined) return cell.t ?? ''
  if (cell.fmt === 'pct') return `${(cell.v * 100).toFixed(1)}%`
  if (cell.fmt === 'int') return String(Math.round(cell.v))
  const abs = Math.abs(Math.round(cell.v)).toLocaleString('en-US')
  return cell.v < 0 ? `(${abs})` : abs
}

// Embedded chart object: revenue columns + an EBITDA line crossing zero.
function BudgetChart({ rev, ebitda }: { rev: number[]; ebitda: number[] }) {
  const W = 420
  const H = 232
  const padL = 40
  const padR = 12
  const padT = 30
  const padB = 26
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const maxV = Math.max(...rev, ...ebitda)
  const minV = Math.min(0, ...ebitda)
  const span = maxV - minV || 1
  const y = (v: number) => padT + ((maxV - v) / span) * plotH
  const bw = plotW / 12
  const zeroY = y(0)
  const linePts = ebitda
    .map((v, m) => `${padL + bw * (m + 0.5)},${y(v)}`)
    .join(' ')
  const ticks = [0, Math.round(maxV / 2), Math.round(maxV)]
  return (
    <svg className="xl-chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Revenue vs EBITDA">
      <text className="xl-chart-title" x={padL} y={16}>
        Revenue vs. EBITDA ($000s)
      </text>
      {ticks.map((tk) => (
        <g key={tk}>
          <line className="xl-chart-grid" x1={padL} y1={y(tk)} x2={W - padR} y2={y(tk)} />
          <text className="xl-chart-axis" x={padL - 6} y={y(tk) + 3} textAnchor="end">
            {tk.toLocaleString('en-US')}
          </text>
        </g>
      ))}
      <line className="xl-chart-zero" x1={padL} y1={zeroY} x2={W - padR} y2={zeroY} />
      {rev.map((v, m) => (
        <rect
          key={m}
          className="xl-chart-bar"
          x={padL + bw * m + bw * 0.16}
          y={y(v)}
          width={bw * 0.68}
          height={Math.max(0, zeroY - y(v))}
        />
      ))}
      <polyline className="xl-chart-line" points={linePts} />
      {ebitda.map((v, m) => (
        <circle
          key={m}
          className="xl-chart-dot"
          cx={padL + bw * (m + 0.5)}
          cy={y(v)}
          r={2.4}
        />
      ))}
      {BUDGET_MONTHS.map((mm, m) => (
        <text
          key={mm}
          className="xl-chart-axis"
          x={padL + bw * (m + 0.5)}
          y={H - 8}
          textAnchor="middle"
        >
          {mm[0]}
        </text>
      ))}
    </svg>
  )
}

const budgetAssumptions: BCell[][] = [
  [{ t: 'Planning Assumptions — FY2026', kind: 'title' }],
  [{}],
  [
    { t: 'Driver', kind: 'header' },
    { t: 'Basis', kind: 'header' },
    { t: 'Value', kind: 'header' },
    { t: 'Owner', kind: 'header' },
  ],
  [{ t: 'Subscription MoM growth', kind: 'label' }, { t: 'Net new ARR' }, { v: 0.045, fmt: 'pct' }, { t: 'RevOps' }],
  [{ t: 'Services MoM growth', kind: 'label' }, { t: 'Utilization' }, { v: 0.03, fmt: 'pct' }, { t: 'Delivery' }],
  [{ t: 'Gross margin target', kind: 'label' }, { t: 'Blended' }, { v: 0.82, fmt: 'pct' }, { t: 'Finance' }],
  [{ t: 'Logo churn (annual)', kind: 'label' }, { t: 'Cohort' }, { v: 0.086, fmt: 'pct' }, { t: 'CS' }],
  [{ t: 'Blended ARPA ($)', kind: 'label' }, { t: 'Price book' }, { v: 1180, fmt: 'num' }, { t: 'RevOps' }],
  [{ t: 'Cloud cost / $ revenue', kind: 'label' }, { t: 'Committed use' }, { v: 0.114, fmt: 'pct' }, { t: 'Platform' }],
  [{ t: 'Fully-loaded cost / head ($)', kind: 'label' }, { t: 'Comp band' }, { v: 168, fmt: 'num' }, { t: 'People' }],
  [{ t: 'Starting cash ($000s)', kind: 'label' }, { t: 'Bank' }, { v: 4200, fmt: 'num' }, { t: 'Treasury' }],
  [{ t: 'FX rate (EUR/USD)', kind: 'label' }, { t: 'Hedged 60%' }, { v: 1.08, fmt: 'num' }, { t: 'Treasury' }],
]

function buildHeadcountSheet(): BCell[][] {
  const depts = [
    { name: 'Engineering', q: [22, 24, 27, 30] },
    { name: 'Product & Design', q: [7, 8, 9, 10] },
    { name: 'Sales', q: [11, 12, 14, 16] },
    { name: 'Marketing', q: [5, 6, 6, 7] },
    { name: 'Customer Success', q: [6, 7, 8, 9] },
    { name: 'G&A', q: [5, 5, 6, 6] },
  ]
  const header: BCell[] = [
    { t: 'Department', kind: 'header' },
    { t: 'Q1', kind: 'header' },
    { t: 'Q2', kind: 'header' },
    { t: 'Q3', kind: 'header' },
    { t: 'Q4', kind: 'header' },
    { t: 'Net adds', kind: 'header' },
  ]
  const rows = depts.map((d, i) => {
    const rn = i + 4
    return [
      { t: d.name, kind: 'label' as const },
      ...d.q.map((v) => ({ v, fmt: 'int' as const })),
      { v: d.q[3] - d.q[0], fmt: 'int' as const, f: `=E${rn}-B${rn}` },
    ]
  })
  const totals: BCell[] = [
    { t: 'Total Headcount', kind: 'total', bold: true },
    ...[0, 1, 2, 3].map((qi) => ({
      v: depts.reduce((s, d) => s + d.q[qi], 0),
      fmt: 'int' as const,
      f: `=SUM(${colLetter(qi + 1)}4:${colLetter(qi + 1)}${depts.length + 3})`,
      bold: true,
    })),
    {
      v: depts.reduce((s, d) => s + (d.q[3] - d.q[0]), 0),
      fmt: 'int',
      f: `=E${depts.length + 4}-B${depts.length + 4}`,
      bold: true,
    },
  ]
  return [
    [{ t: 'Headcount Plan by Department', kind: 'title' }],
    [{}],
    header,
    ...rows,
    totals,
  ]
}

export function ExcelBudgetSkin({ doc }: { doc: DocumentRecord }) {
  const model = useMemo(() => buildBudget(), [])
  const sheets = useMemo(
    () => [
      { name: 'FY26 P&L', grid: model.grid, chart: true },
      { name: 'Assumptions', grid: budgetAssumptions, chart: false },
      { name: 'Headcount', grid: buildHeadcountSheet(), chart: false },
    ],
    [model],
  )
  const [active, setActive] = useState(0)
  // Selected cell drives the Name Box + formula bar (defaults to the EBITDA FY cell).
  const [sel, setSel] = useState<{ r: number; c: number }>({ r: 25, c: 13 })
  const grid = sheets[active].grid
  const selCell = grid[sel.r]?.[sel.c]
  const nameRef = selCell ? `${colLetter(sel.c)}${sel.r + 1}` : 'A1'
  const formulaText = selCell?.f || (selCell?.v !== undefined ? String(selCell.v) : selCell?.t || '')
  const cols = Math.max(1, ...grid.map((r) => r.length))
  const letters = Array.from({ length: cols }, (_, i) => colLetter(i))

  return (
    <div className="msapp excel">
      <MsTitleBar fileName={doc.fileName} app="Excel" accent="#107c41" />
      <MsRibbonTabs tabs={excelTabs} active={1} accent="#107c41" right={<MsRibbonRight />} />
      <ExcelHomeRibbon />
      <div className="excel-formula">
        <span className="name-box">{nameRef}</span>
        <span className="fx">fx</span>
        <span className="formula-value">{formulaText}</span>
      </div>
      <div className="excel-body excel-body-budget">
        <div className="excel-grid-host">
          <table className="xl-grid xl-grid-budget">
            <thead>
              <tr>
                <th className="xl-corner" />
                {letters.map((l) => (
                  <th key={l} className="xl-colh">
                    {l}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map((row, r) => {
                const rowKind = row[0]?.kind
                return (
                <tr
                  key={r}
                  className={
                    rowKind === 'section'
                      ? 'xl-row-section'
                      : rowKind === 'title'
                        ? 'xl-row-title'
                        : rowKind === 'header'
                          ? 'xl-row-header'
                          : undefined
                  }
                >
                  <td className="xl-rowh">{r + 1}</td>
                  {letters.map((_, ci) => {
                    const cell = row[ci] as BCell | undefined
                    const isSel = sel.r === r && sel.c === ci
                    const neg = cell?.v !== undefined && cell.v < 0
                    const cls = [
                      'xl-cell',
                      cell?.kind ? `xl-${cell.kind}` : '',
                      cell?.v !== undefined ? 'xl-num' : '',
                      cell?.bold ? 'xl-b' : '',
                      neg || cell?.red ? 'xl-neg' : '',
                      isSel ? 'xl-sel' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')
                    return (
                      <td key={ci} className={cls} onClick={() => setSel({ r, c: ci })}>
                        {cell ? fmtBudget(cell) : ''}
                      </td>
                    )
                  })}
                </tr>
                )
              })}
            </tbody>
          </table>
          {sheets[active].chart && (
            <div className="xl-chart">
              <BudgetChart rev={model.chart.rev} ebitda={model.chart.ebitda} />
            </div>
          )}
        </div>
      </div>
      <div className="excel-sheet-tabs">
        {sheets.map((s, i) => (
          <button
            key={s.name}
            type="button"
            className={i === active ? 'is-active' : undefined}
            onClick={() => {
              setActive(i)
              setSel({ r: 2, c: 0 })
            }}
          >
            {s.name}
          </button>
        ))}
        <span className="excel-add">＋</span>
      </div>
      <div className="ms-status excel-status">
        <span>Ready</span>
        <span>
          Sum={' '}
          {selCell?.v !== undefined ? Math.round(selCell.v).toLocaleString('en-US') : '0'}
        </span>
        <span className="ms-status-right">
          Average · Count: {grid.reduce((n, row) => n + row.filter((c) => c.v !== undefined).length, 0)}
        </span>
        <span>100%</span>
      </div>
    </div>
  )
}

export function ExcelSkin({ doc }: { doc: DocumentRecord }) {
  const sheets = useMemo(() => buildSheets(doc), [doc])
  const [active, setActive] = useState(0)
  const site = getSiteLabel(doc.sourceUrl)
  const rows = sheets[active].rows
  return (
    <div className="msapp excel">
      <MsTitleBar fileName={doc.fileName} app="Excel" accent="#107c41" />
      <MsRibbonTabs tabs={excelTabs} active={1} accent="#107c41" right={<MsRibbonRight />} />
      <ExcelHomeRibbon />
      <div className="excel-formula">
        <span className="name-box">A1</span>
        <span className="fx">fx</span>
        <span className="formula-value">={`SOURCE("${site}")`}</span>
      </div>
      <div className="excel-body">
        <div className="excel-grid-host">
          <XlSheet rows={rows} />
        </div>
        <aside className="excel-read markdown-body">
          <div className="excel-read-head">
            <ExcelLogo size={16} /> {site}
          </div>
          <MarkdownContent markdown={articleBody(doc)} />
        </aside>
      </div>
      <div className="excel-sheet-tabs">
        {sheets.map((s, i) => (
          <button
            key={s.name}
            type="button"
            className={i === active ? 'is-active' : undefined}
            onClick={() => setActive(i)}
          >
            {s.name}
          </button>
        ))}
        <span className="excel-add">＋</span>
      </div>
      <div className="ms-status excel-status">
        <span>Ready</span>
        <span className="ms-status-right">Count: {Math.max(0, rows.length - 1)}</span>
        <span>100%</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Outlook
 * ------------------------------------------------------------------ */


const excel: SkinDefinition = {
  id: 'excel',
  label: 'Excel',
  appName: 'Excel',
  fileExtension: 'xlsx',
  accent: '#107c41',
  Surface: ExcelSkin,
}
export default excel
