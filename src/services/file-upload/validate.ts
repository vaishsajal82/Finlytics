import { ACCEPTED_UPLOADS, MAX_UPLOAD_BYTES } from '@/lib/constants'
import { formatBytes } from '@/lib/formatters'
import type { DocumentType } from '@/features/documents/types'

export function validateFile(file: Pick<File, 'name' | 'size'>): string | null {
  const ext = file.name.includes('.') ? `.${file.name.split('.').pop()?.toLowerCase()}` : ''
  if (!ACCEPTED_UPLOADS.some((f) => f.ext === ext)) {
    return `Unsupported file type${ext ? ` (${ext})` : ''}. Allowed: ${ACCEPTED_UPLOADS.map((f) => f.ext).join(', ')}.`
  }
  if (file.size === 0) return 'This file is empty.'
  if (file.size > MAX_UPLOAD_BYTES) return `File is ${formatBytes(file.size)}; the limit is ${formatBytes(MAX_UPLOAD_BYTES)}.`
  return null
}

/** Best-effort guess from the filename; the analyst can change it before uploading. */
export function guessDocumentType(name: string): DocumentType {
  const n = name.toLowerCase()
  if (/gst|gstr/.test(n)) return 'gst_return'
  if (/audit/.test(n)) return 'audited_financials'
  if (/itr|tax.?return|income.?tax/.test(n)) return 'itr'
  if (/trial.?balance|ledger/.test(n)) return 'trial_balance'
  if (/bank|account.?statement/.test(n) && !/balance|cash/.test(n)) return 'bank_statement'
  if (/balance/.test(n)) return 'balance_sheet'
  if (/cash.?flow/.test(n)) return 'cash_flow'
  if (/p&l|pnl|profit|loss|income.?statement/.test(n)) return 'profit_loss'
  if (/receivable|ar.?age|debtor/.test(n)) return 'ar_ageing'
  if (/payable|ap.?age|creditor/.test(n)) return 'ap_ageing'
  if (/loan|sanction|facility|repayment/.test(n)) return 'loan_statement'
  if (/cibil|experian|crif|bureau|credit.?report/.test(n)) return 'credit_bureau'
  if (/cin|mca|pan|moa|aoa|incorporation|registration/.test(n)) return 'registration_docs'
  if (/sales|purchase|invoice/.test(n)) return 'sales_purchase'
  return 'other'
}
