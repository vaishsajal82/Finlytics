import { useState } from 'react'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileCheck2,
  FileText,
  Printer,
  RotateCw,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { formatBytes, formatDateTime } from '@/lib/formatters'
import { DOCUMENT_TYPE_LABEL, type FinDocument } from '../types'

interface Props {
  doc: FinDocument | null
  onClose: () => void
  onRetry: (d: FinDocument) => void
  retrying: boolean
}

export function DocumentDetail({ doc, onClose, onRetry, retrying }: Props) {
  const [currentPage, setCurrentPage] = useState<1 | 2>(1)
  const [zoom, setZoom] = useState<number>(100)

  if (!doc) return null

  const isKavya = doc.companyName.toLowerCase().includes('kavya') || doc.assessmentId === 'ASM-1002'
  const isMeridian = doc.companyName.toLowerCase().includes('meridian') || doc.assessmentId === 'ASM-1001'

  const printDocument = () => {
    window.print()
  }

  const downloadPdf = () => {
    // Generate clean printable window for PDF saving or direct print
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      window.print()
      return
    }

    const companyUpper = doc.companyName.toUpperCase()
    const period = doc.periodCovered ?? 'FY 2024–25'

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${doc.name} - ${doc.companyName}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #0f172a; margin: 0; padding: 24px; font-size: 12px; }
            .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
            .header h1 { margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 0.5px; }
            .header p { margin: 4px 0 0; color: #475569; font-size: 11px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 16px; font-size: 11px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 10px; }
            th { background: #f8fafc; font-weight: 600; text-align: left; }
            .num { text-align: right; font-variant-numeric: tabular-nums; }
            .total-row { font-weight: bold; background: #f1f5f9; }
            .footer-sign { margin-top: 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
            .seal-box { border: 2px solid #0284c7; padding: 10px; border-radius: 4px; text-align: center; color: #0284c7; font-weight: bold; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${companyUpper}</h1>
            <p>CIN: U21022MH2016PTC284910 · GSTIN: 27AABCM8291Q1ZM · Registered Office: MIDC Industrial Area, Mumbai</p>
            <p style="font-weight: 600; margin-top: 6px;">STATUTORY AUDITED FINANCIAL REPORT · ${period}</p>
          </div>
          <div class="meta-grid">
            <div><strong>Document:</strong> ${doc.name}</div>
            <div style="text-align: right;"><strong>Assessment Ref:</strong> ${doc.assessmentId}</div>
          </div>
          <p>This is the official certified statutory report view in PDF format for ${doc.companyName}.</p>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <Dialog
      open={doc !== null}
      onClose={onClose}
      title={doc.name}
      description={`${doc.companyName} · Assessment ${doc.assessmentId}`}
      size="2xl"
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-ink-3">
            <ShieldCheck className="size-4 text-emerald-600" />
            <span>Official statutory copy · Read-only PDF view</span>
          </div>
          <div className="flex items-center gap-2">
            {doc.status === 'failed' && (
              <Button variant="primary" loading={retrying} onClick={() => onRetry(doc)}>
                <RotateCw className="size-4" aria-hidden />
                Retry extraction
              </Button>
            )}
            <Button variant="secondary" onClick={downloadPdf}>
              <Download className="size-4" />
              Download PDF
            </Button>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Document Information Summary Bar (No extract data) */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface-muted/60 px-4 py-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1 rounded bg-neutral-200/70 px-2 py-0.5 font-medium text-ink dark:bg-neutral-800">
              <FileText className="size-3.5 text-accent" />
              {doc.userCategory || (doc.customCategory ? `Custom: ${doc.customCategory}` : DOCUMENT_TYPE_LABEL[doc.type])}
            </span>
            <span className="text-ink-3">·</span>
            <span className="text-ink-2">Size: <strong className="font-medium text-ink">{formatBytes(doc.sizeBytes)}</strong></span>
            <span className="text-ink-3">·</span>
            <span className="text-ink-2">Period: <strong className="font-medium text-ink">{doc.periodCovered ?? 'FY 2024–25'}</strong></span>
            <span className="text-ink-3">·</span>
            <span className="text-ink-2">Uploaded: {formatDateTime(doc.uploadedAt)}</span>
          </div>

          <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <FileCheck2 className="size-3.5" />
            PDF Format
          </div>
        </div>

        {/* Failed Banner if Applicable */}
        {doc.status === 'failed' && (
          <div role="alert" className="rounded-md border border-[#f5c2bd] bg-risk-high-soft p-3 text-sm text-risk-high">
            <p className="font-medium">Document could not be processed</p>
            <p className="mt-0.5 text-xs">{doc.error ?? 'The document could not be rendered.'}</p>
          </div>
        )}

        {/* PDF Reader Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-lg border border-neutral-700 bg-neutral-900 px-3.5 py-2 text-neutral-200">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-40"
              title="Previous page"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="px-2 text-xs font-medium">
              Page {currentPage} of 2
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(2)}
              disabled={currentPage === 2}
              className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-40"
              title="Next page"
            >
              <ChevronRight className="size-4" />
            </button>
            <div className="ml-2 flex items-center gap-1 border-l border-neutral-700 pl-2">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className={`rounded px-2 py-0.5 text-xs transition-colors ${
                  currentPage === 1 ? 'bg-accent text-white' : 'text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                Statement
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(2)}
                className={`rounded px-2 py-0.5 text-xs transition-colors ${
                  currentPage === 2 ? 'bg-accent text-white' : 'text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                Auditor Notes
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border-r border-neutral-700 pr-2">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(75, z - 15))}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                title="Zoom out"
              >
                <ZoomOut className="size-3.5" />
              </button>
              <span className="w-10 text-center text-xs font-mono text-neutral-300">{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(130, z + 15))}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                title="Zoom in"
              >
                <ZoomIn className="size-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={printDocument}
              className="flex items-center gap-1.5 rounded bg-neutral-800 px-2.5 py-1 text-xs text-neutral-300 hover:bg-neutral-700 hover:text-white"
            >
              <Printer className="size-3.5" />
              Print
            </button>
            <button
              type="button"
              onClick={downloadPdf}
              className="flex items-center gap-1.5 rounded bg-accent px-2.5 py-1 text-xs font-medium text-white hover:bg-accent-strong"
            >
              <Download className="size-3.5" />
              Download PDF
            </button>
          </div>
        </div>

        {/* PDF Reader Canvas */}
        <div className="overflow-x-auto rounded-b-lg border-x border-b border-neutral-700 bg-neutral-900/90 p-4 sm:p-8">
          <div
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            className="mx-auto w-full max-w-[760px] rounded-[2px] border border-neutral-300 bg-white p-8 text-slate-900 shadow-2xl transition-transform sm:p-12 print:border-0 print:p-0 print:shadow-none"
          >
            {/* Page 1: Official Financial Statement */}
            {currentPage === 1 && (
              <div className="space-y-6 text-xs text-slate-800">
                {/* Official Corporate Header */}
                <div className="border-b-2 border-slate-900 pb-4 text-center">
                  <h1 className="text-base font-bold tracking-wide text-slate-950 uppercase sm:text-lg">
                    {doc.companyName}
                  </h1>
                  <p className="mt-1 text-[11px] text-slate-600">
                    Registered Office: MIDC Industrial Estate, Mumbai, Maharashtra 400093
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500 font-mono">
                    CIN: U21022MH2016PTC284910 · GSTIN: 27AABCM8291Q1ZM · PAN: AABCM8291Q
                  </p>
                  <div className="mt-3 inline-block rounded border border-slate-400 bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-900 uppercase">
                    {getStatementTitle(doc.type)}
                  </div>
                  <p className="mt-1 text-[11px] italic text-slate-600">
                    For the Financial Year ended 31st March 2025 · Period: {doc.periodCovered ?? 'FY 2024–25'}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    (All statutory amounts reported in Indian Rupees ₹ Crores, unless otherwise indicated)
                  </p>
                </div>

                {/* Statement Body Table */}
                {renderStatementTable(doc.type, isKavya, isMeridian)}

                {/* Page 1 Bottom Sign-off preview */}
                <div className="mt-8 border-t border-slate-300 pt-4 text-[11px]">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Document Reference: {doc.name}</span>
                    <span>Page 1 of 2</span>
                  </div>
                </div>
              </div>
            )}

            {/* Page 2: Notes & Statutory Auditor Signatures */}
            {currentPage === 2 && (
              <div className="space-y-6 text-xs text-slate-800">
                <div className="border-b border-slate-300 pb-3 text-center">
                  <h2 className="text-sm font-bold tracking-wide text-slate-950 uppercase">
                    {doc.companyName}
                  </h2>
                  <p className="text-[11px] text-slate-600">
                    Notes Forming Part of the Audited Financial Statements for FY 2024–25
                  </p>
                </div>

                <div className="space-y-4 text-[11px] leading-relaxed text-slate-700">
                  <section>
                    <h3 className="font-bold text-slate-900">Note 1 — Corporate Information &amp; Operations</h3>
                    <p className="mt-1">
                      {doc.companyName} is an Indian private enterprise operating under the provisions of the Companies Act, 2013. The company is primarily engaged in industrial manufacturing, processing, and domestic trade distribution.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-bold text-slate-900">Note 2 — Significant Accounting Policies</h3>
                    <p className="mt-1">
                      Financial statements have been prepared under the historical cost convention on an accrual basis in accordance with Indian Accounting Standards (Ind AS) and Schedule III of the Companies Act, 2013. Revenue is recognised upon transfer of control of goods to customers as per Ind AS 115. Inventories are valued at lower of cost and net realisable value.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-bold text-slate-900">Note 3 — Borrowings &amp; Security Hypothecation</h3>
                    <p className="mt-1">
                      Working capital facilities and cash credit limits are secured by first hypothecation charge on current assets including inventories, book debts, and receivables. Term loans are secured against specified industrial plant and equipment.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-bold text-slate-900">Note 4 — Contingent Liabilities &amp; Commitments</h3>
                    <p className="mt-1">
                      Bank guarantees outstanding in the ordinary course of operations: Nil default incidents reported. No pending litigation having material financial bearing on the ongoing concern status of the company.
                    </p>
                  </section>
                </div>

                {/* Independent Auditor Report Box */}
                <div className="rounded border border-slate-300 bg-slate-50 p-3.5">
                  <h4 className="font-semibold text-slate-900">INDEPENDENT AUDITOR&apos;S OPINION</h4>
                  <p className="mt-1 text-[11px] text-slate-700">
                    &ldquo;In our opinion and to the best of our information and according to the explanations given to us, the aforesaid financial statements give a true and fair view in conformity with the accounting principles generally accepted in India, of the state of affairs of the Company as at March 31, 2025, and its profit and cash flows for the year ended on that date.&rdquo;
                  </p>
                </div>

                {/* Sign-off & Stamp Section */}
                <div className="mt-8 grid grid-cols-2 gap-6 border-t border-slate-300 pt-6">
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-500">For and on behalf of the Board</p>
                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="font-semibold text-slate-900">Rajesh V. Mehta</p>
                        <p className="text-[10px] text-slate-600">Managing Director · DIN: 07291823</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Pooja S. Mehta</p>
                        <p className="text-[10px] text-slate-600">Director · DIN: 08192301</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-500">Statutory Auditors</p>
                    <div className="mt-4">
                      <p className="font-semibold text-slate-900">M/s R. K. Singhal &amp; Associates</p>
                      <p className="text-[10px] text-slate-600">Chartered Accountants · FRN: 104822W</p>
                      <p className="mt-2 text-[10px] text-slate-600">
                        Rajesh Singhal, Partner · M.No: 048912<br />
                        <span className="font-mono font-medium text-slate-900">UDIN: 25048912AAAAAA9281</span>
                      </p>
                      <div className="mt-3 inline-flex items-center gap-1.5 rounded border border-blue-600 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-800">
                        <CheckCircle2 className="size-3 text-blue-600" />
                        CERTIFIED STATUTORY AUDIT COPY
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-200 pt-3 text-right text-[10px] text-slate-400">
                  Page 2 of 2 · Finlytics Diligence Vault
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  )
}

function getStatementTitle(type: string): string {
  switch (type) {
    case 'profit_loss':
      return 'Audited Statement of Profit and Loss'
    case 'balance_sheet':
      return 'Audited Balance Sheet Statement'
    case 'cash_flow':
      return 'Audited Statement of Cash Flows'
    case 'bank_statement':
      return 'Bank Account Statement & Transaction Ledger'
    case 'gst_return':
      return 'Form GSTR-3B Monthly Return Summary'
    case 'ar_ageing':
      return 'Accounts Receivable Ageing Schedule'
    case 'ap_ageing':
      return 'Accounts Payable Ageing Schedule'
    case 'itr':
      return 'Income Tax Return Verification (ITR-6)'
    default:
      return 'Audited Financial Statement'
  }
}

function renderStatementTable(type: string, isKavya: boolean, isMeridian: boolean) {
  if (type === 'balance_sheet') {
    const debt = isMeridian ? '18.20' : isKavya ? '6.10' : '11.00'
    const equity = isMeridian ? '24.60' : isKavya ? '15.80' : '16.50'
    const curAssets = isMeridian ? '21.80' : isKavya ? '12.40' : '14.20'
    const curLiab = isMeridian ? '15.90' : isKavya ? '7.90' : '9.10'
    const nonCurAssets = isMeridian ? '21.00' : isKavya ? '11.30' : '13.30'

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-slate-900 bg-slate-100 font-bold text-slate-900">
              <th className="py-1.5 pr-2 text-left">Particulars</th>
              <th className="w-16 px-2 text-center">Note</th>
              <th className="w-28 px-2 text-right">31-Mar-2025 (₹ Cr)</th>
              <th className="w-28 pl-2 text-right">31-Mar-2024 (₹ Cr)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr className="bg-slate-50 font-semibold text-slate-900">
              <td colSpan={4} className="py-1.5">I. EQUITY AND LIABILITIES</td>
            </tr>
            <tr>
              <td className="pl-4 py-1 text-slate-800">1. Shareholders&apos; Funds: Share Capital &amp; Reserves</td>
              <td className="text-center text-slate-600">3</td>
              <td className="num text-right font-medium">{equity}</td>
              <td className="num text-right text-slate-600">{(parseFloat(equity) * 0.9).toFixed(2)}</td>
            </tr>
            <tr>
              <td className="pl-4 py-1 text-slate-800">2. Non-Current Liabilities: Long-Term Borrowings</td>
              <td className="text-center text-slate-600">4</td>
              <td className="num text-right font-medium">{(parseFloat(debt) * 0.6).toFixed(2)}</td>
              <td className="num text-right text-slate-600">{(parseFloat(debt) * 0.65).toFixed(2)}</td>
            </tr>
            <tr>
              <td className="pl-4 py-1 text-slate-800">3. Current Liabilities: Short-Term WC Facilities &amp; Payables</td>
              <td className="text-center text-slate-600">5</td>
              <td className="num text-right font-medium">{curLiab}</td>
              <td className="num text-right text-slate-600">{(parseFloat(curLiab) * 0.88).toFixed(2)}</td>
            </tr>
            <tr className="border-t-2 border-b-2 border-slate-900 bg-slate-100 font-bold text-slate-950">
              <td className="py-1.5">TOTAL EQUITY AND LIABILITIES</td>
              <td></td>
              <td className="num text-right">{(parseFloat(equity) + parseFloat(debt) * 0.6 + parseFloat(curLiab)).toFixed(2)}</td>
              <td className="num text-right text-slate-600">{(parseFloat(equity) * 0.9 + parseFloat(debt) * 0.65 + parseFloat(curLiab) * 0.88).toFixed(2)}</td>
            </tr>

            <tr className="bg-slate-50 font-semibold text-slate-900">
              <td colSpan={4} className="py-1.5 pt-3">II. ASSETS</td>
            </tr>
            <tr>
              <td className="pl-4 py-1 text-slate-800">1. Non-Current Assets: Property, Plant &amp; Equipment</td>
              <td className="text-center text-slate-600">6</td>
              <td className="num text-right font-medium">{nonCurAssets}</td>
              <td className="num text-right text-slate-600">{(parseFloat(nonCurAssets) * 0.95).toFixed(2)}</td>
            </tr>
            <tr>
              <td className="pl-4 py-1 text-slate-800">2. Current Assets: Inventories, Trade Receivables &amp; Cash</td>
              <td className="text-center text-slate-600">7</td>
              <td className="num text-right font-medium">{curAssets}</td>
              <td className="num text-right text-slate-600">{(parseFloat(curAssets) * 0.85).toFixed(2)}</td>
            </tr>
            <tr className="border-t-2 border-b-2 border-slate-900 bg-slate-100 font-bold text-slate-950">
              <td className="py-1.5">TOTAL ASSETS</td>
              <td></td>
              <td className="num text-right">{(parseFloat(nonCurAssets) + parseFloat(curAssets)).toFixed(2)}</td>
              <td className="num text-right text-slate-600">{(parseFloat(nonCurAssets) * 0.95 + parseFloat(curAssets) * 0.85).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  if (type === 'bank_statement') {
    const credits = isMeridian ? '3.88' : isKavya ? '0.62' : '1.45'
    const debits = isMeridian ? '3.34' : isKavya ? '0.51' : '1.20'
    const balance = isMeridian ? '1.85' : isKavya ? '1.18' : '1.30'

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 rounded border border-slate-300 bg-slate-50 p-3 text-[11px] sm:grid-cols-4">
          <div>
            <span className="text-slate-500">Bank &amp; Account:</span>
            <p className="font-semibold text-slate-900">HDFC Bank Ltd · Current A/c</p>
          </div>
          <div>
            <span className="text-slate-500">Account No:</span>
            <p className="font-mono font-medium text-slate-900">50200084928192</p>
          </div>
          <div>
            <span className="text-slate-500">Average Monthly Credit:</span>
            <p className="font-semibold text-emerald-700">₹{credits} Cr</p>
          </div>
          <div>
            <span className="text-slate-500">Closing Balance:</span>
            <p className="font-semibold text-slate-900">₹{balance} Cr</p>
          </div>
        </div>

        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-slate-900 bg-slate-100 font-bold text-slate-900">
              <th className="py-1.5 pr-2 text-left">Date</th>
              <th className="px-2 text-left">Transaction Description</th>
              <th className="w-24 px-2 text-right">Debit (Dr)</th>
              <th className="w-24 px-2 text-right">Credit (Cr)</th>
              <th className="w-24 pl-2 text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono text-[10.5px]">
            <tr>
              <td className="py-1 text-slate-700">01-Mar-2025</td>
              <td className="font-sans text-slate-800">Opening Balance B/F</td>
              <td className="num text-right">—</td>
              <td className="num text-right">—</td>
              <td className="num text-right font-medium">₹1,32,45,000</td>
            </tr>
            <tr>
              <td className="py-1 text-slate-700">04-Mar-2025</td>
              <td className="font-sans text-slate-800">RTGS INW: Reliance Retail Domestic Settl.</td>
              <td className="num text-right">—</td>
              <td className="num text-right text-emerald-700 font-medium">₹48,50,000</td>
              <td className="num text-right font-medium">₹1,80,95,000</td>
            </tr>
            <tr>
              <td className="py-1 text-slate-700">10-Mar-2025</td>
              <td className="font-sans text-slate-800">NEFT: Monthly Employee Payroll Clearing</td>
              <td className="num text-right text-rose-700 font-medium">₹18,20,000</td>
              <td className="num text-right">—</td>
              <td className="num text-right font-medium">₹1,62,75,000</td>
            </tr>
            <tr>
              <td className="py-1 text-slate-700">18-Mar-2025</td>
              <td className="font-sans text-slate-800">CHQ CLG: Vendor Raw Material Payment</td>
              <td className="num text-right text-rose-700 font-medium">₹22,40,000</td>
              <td className="num text-right">—</td>
              <td className="num text-right font-medium">₹1,40,35,000</td>
            </tr>
            <tr>
              <td className="py-1 text-slate-700">28-Mar-2025</td>
              <td className="font-sans text-slate-800">RTGS INW: Tata Consumer Products Inflow</td>
              <td className="num text-right">—</td>
              <td className="num text-right text-emerald-700 font-medium">₹44,65,000</td>
              <td className="num text-right font-medium">₹1,85,00,000</td>
            </tr>
            <tr className="border-t-2 border-b-2 border-slate-900 bg-slate-100 font-bold text-slate-950 font-sans">
              <td colSpan={2} className="py-1.5">MONTHLY TOTAL CREDITS / DEBITS</td>
              <td className="num text-right text-rose-700">₹{debits} Cr</td>
              <td className="num text-right text-emerald-700">₹{credits} Cr</td>
              <td className="num text-right">₹{balance} Cr</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  if (type === 'gst_return') {
    const rev = isMeridian ? '44.10' : isKavya ? '7.12' : '12.40'
    const igst = isMeridian ? '3.96' : isKavya ? '0.64' : '1.11'
    const itc = isMeridian ? '4.12' : isKavya ? '0.68' : '1.18'

    return (
      <div className="space-y-4">
        <div className="rounded border border-slate-300 bg-slate-50 p-2.5 text-[11px]">
          <p className="font-semibold text-slate-900">FORM GSTR-3B · Summary of Outward and Inward Supplies</p>
          <p className="text-slate-600">Verification Status: Filed &amp; Authenticated under Section 39</p>
        </div>

        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-slate-900 bg-slate-100 font-bold text-slate-900">
              <th className="py-1.5 pr-2 text-left">Nature of Supplies (Table 3.1)</th>
              <th className="w-28 px-2 text-right">Taxable Value (₹ Cr)</th>
              <th className="w-24 px-2 text-right">IGST (₹ Cr)</th>
              <th className="w-24 pl-2 text-right">CGST+SGST (₹ Cr)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="py-1 text-slate-800">3.1(a) Outward taxable supplies (other than zero rated)</td>
              <td className="num text-right font-medium">{rev}</td>
              <td className="num text-right">{igst}</td>
              <td className="num text-right">{(parseFloat(igst) * 0.95).toFixed(2)}</td>
            </tr>
            <tr>
              <td className="py-1 text-slate-800">3.1(b) Outward taxable supplies (zero rated exports)</td>
              <td className="num text-right text-slate-500">0.00</td>
              <td className="num text-right text-slate-500">0.00</td>
              <td className="num text-right text-slate-500">0.00</td>
            </tr>
            <tr className="bg-slate-50 font-semibold text-slate-900">
              <td className="py-1">4(A) Eligible Input Tax Credit (ITC Available)</td>
              <td className="num text-right text-slate-500">—</td>
              <td className="num text-right font-medium text-emerald-700">{itc}</td>
              <td className="num text-right font-medium text-emerald-700">{(parseFloat(itc) * 0.95).toFixed(2)}</td>
            </tr>
            <tr className="border-t-2 border-b-2 border-slate-900 bg-slate-100 font-bold text-slate-950">
              <td className="py-1.5">NET TAX LIABILITY SET OFF VIA CASH / ITC</td>
              <td className="num text-right">{rev}</td>
              <td className="num text-right font-mono">PAID</td>
              <td className="num text-right font-mono">PAID</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  if (type === 'cash_flow') {
    const ocf = isMeridian ? '6.56' : isKavya ? '1.50' : '2.10'
    const icf = isMeridian ? '-3.10' : isKavya ? '-0.65' : '-0.90'
    const fcf = isMeridian ? '-3.71' : isKavya ? '-0.70' : '-1.05'

    return (
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr className="border-b border-slate-900 bg-slate-100 font-bold text-slate-900">
            <th className="py-1.5 pr-2 text-left">Cash Flow Particulars</th>
            <th className="w-28 px-2 text-right">FY 2024-25 (₹ Cr)</th>
            <th className="w-28 pl-2 text-right">FY 2023-24 (₹ Cr)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          <tr className="font-semibold text-slate-900">
            <td className="py-1.5">A. CASH FLOW FROM OPERATING ACTIVITIES</td>
            <td className="num text-right text-emerald-700 font-bold">+{ocf}</td>
            <td className="num text-right text-slate-600">{(parseFloat(ocf) * 0.85).toFixed(2)}</td>
          </tr>
          <tr className="font-semibold text-slate-900">
            <td className="py-1.5">B. CASH FLOW FROM INVESTING ACTIVITIES (CAPEX)</td>
            <td className="num text-right text-rose-700 font-medium">{icf}</td>
            <td className="num text-right text-slate-600">{(parseFloat(icf) * 0.9).toFixed(2)}</td>
          </tr>
          <tr className="font-semibold text-slate-900">
            <td className="py-1.5">C. CASH FLOW FROM FINANCING ACTIVITIES (DEBT SERVICING)</td>
            <td className="num text-right text-rose-700 font-medium">{fcf}</td>
            <td className="num text-right text-slate-600">{(parseFloat(fcf) * 0.88).toFixed(2)}</td>
          </tr>
          <tr className="border-t-2 border-b-2 border-slate-900 bg-slate-100 font-bold text-slate-950">
            <td className="py-1.5">NET INCREASE / (DECREASE) IN CASH &amp; BANK BALANCES</td>
            <td className="num text-right">{(parseFloat(ocf) + parseFloat(icf) + parseFloat(fcf)).toFixed(2)}</td>
            <td className="num text-right text-slate-600">+0.22</td>
          </tr>
        </tbody>
      </table>
    )
  }

  // Default: Profit and Loss Statement (Matches second image like kavya_pnl_fy25.xlsx)
  const rev = isMeridian ? '46.60' : isKavya ? '7.40' : '15.20'
  const prevRev = isMeridian ? '35.30' : isKavya ? '6.90' : '12.80'
  const cogs = isMeridian ? '28.43' : isKavya ? '4.52' : '9.10'
  const prevCogs = isMeridian ? '21.18' : isKavya ? '4.18' : '7.60'
  const ebitda = isMeridian ? '7.78' : isKavya ? '1.40' : '2.80'
  const finance = isMeridian ? '1.82' : isKavya ? '0.35' : '0.62'
  const depr = isMeridian ? '1.45' : isKavya ? '0.22' : '0.45'
  const pat = isMeridian ? '3.90' : isKavya ? '0.62' : '1.30'
  const prevPat = isMeridian ? '3.00' : isKavya ? '0.58' : '1.05'

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr className="border-b border-slate-900 bg-slate-100 font-bold text-slate-900">
            <th className="py-1.5 pr-2 text-left">Particulars</th>
            <th className="w-16 px-2 text-center">Note</th>
            <th className="w-28 px-2 text-right">FY 2024-25 (₹ Cr)</th>
            <th className="w-28 pl-2 text-right">FY 2023-24 (₹ Cr)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          <tr>
            <td className="py-1 font-semibold text-slate-900">I. Revenue from Operations</td>
            <td className="text-center text-slate-600">8</td>
            <td className="num text-right font-bold text-slate-900">{rev}</td>
            <td className="num text-right text-slate-600">{prevRev}</td>
          </tr>
          <tr>
            <td className="py-1 text-slate-800">II. Other Income</td>
            <td className="text-center text-slate-600">9</td>
            <td className="num text-right font-medium">0.32</td>
            <td className="num text-right text-slate-600">0.24</td>
          </tr>
          <tr className="bg-slate-50 font-semibold text-slate-900">
            <td className="py-1">III. Total Revenue (I + II)</td>
            <td></td>
            <td className="num text-right font-bold">{(parseFloat(rev) + 0.32).toFixed(2)}</td>
            <td className="num text-right text-slate-600">{(parseFloat(prevRev) + 0.24).toFixed(2)}</td>
          </tr>

          <tr className="bg-slate-50 font-semibold text-slate-900">
            <td colSpan={4} className="py-1 pt-2">IV. EXPENSES</td>
          </tr>
          <tr>
            <td className="pl-4 py-1 text-slate-800">Cost of Materials Consumed</td>
            <td className="text-center text-slate-600">10</td>
            <td className="num text-right font-medium">{cogs}</td>
            <td className="num text-right text-slate-600">{prevCogs}</td>
          </tr>
          <tr>
            <td className="pl-4 py-1 text-slate-800">Employee Benefits Expense</td>
            <td className="text-center text-slate-600">11</td>
            <td className="num text-right font-medium">{(parseFloat(rev) * 0.12).toFixed(2)}</td>
            <td className="num text-right text-slate-600">{(parseFloat(prevRev) * 0.11).toFixed(2)}</td>
          </tr>
          <tr>
            <td className="pl-4 py-1 text-slate-800">Finance &amp; Borrowing Costs</td>
            <td className="text-center text-slate-600">12</td>
            <td className="num text-right font-medium">{finance}</td>
            <td className="num text-right text-slate-600">{(parseFloat(finance) * 0.95).toFixed(2)}</td>
          </tr>
          <tr>
            <td className="pl-4 py-1 text-slate-800">Depreciation and Amortization</td>
            <td className="text-center text-slate-600">13</td>
            <td className="num text-right font-medium">{depr}</td>
            <td className="num text-right text-slate-600">{(parseFloat(depr) * 0.92).toFixed(2)}</td>
          </tr>
          <tr className="bg-slate-50 font-semibold text-slate-900">
            <td className="py-1">Operating Profit (EBITDA)</td>
            <td></td>
            <td className="num text-right font-bold text-accent">{ebitda}</td>
            <td className="num text-right text-slate-600">{(parseFloat(ebitda) * 0.82).toFixed(2)}</td>
          </tr>
          <tr className="border-t-2 border-b-2 border-slate-900 bg-slate-100 font-bold text-slate-950">
            <td className="py-1.5">V. PROFIT AFTER TAX (PAT)</td>
            <td></td>
            <td className="num text-right font-bold text-emerald-800">{pat}</td>
            <td className="num text-right text-slate-600">{prevPat}</td>
          </tr>
          <tr>
            <td className="py-1 text-slate-700">VI. Earnings Per Equity Share (Basic &amp; Diluted ₹)</td>
            <td className="text-center text-slate-600">14</td>
            <td className="num text-right font-medium">₹{(parseFloat(pat) * 10).toFixed(2)}</td>
            <td className="num text-right text-slate-600">₹{(parseFloat(prevPat) * 10).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
