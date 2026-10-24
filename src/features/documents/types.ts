export type DocumentType =
  | 'audited_financials'
  | 'profit_loss'
  | 'balance_sheet'
  | 'cash_flow'
  | 'bank_statement'
  | 'gst_return'
  | 'itr'
  | 'trial_balance'
  | 'ar_ageing'
  | 'ap_ageing'
  | 'loan_statement'
  | 'credit_bureau'
  | 'registration_docs'
  | 'sales_purchase'
  | 'other'

export type DocumentStatus = 'queued' | 'processing' | 'completed' | 'failed'

export const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  audited_financials: 'Audited financial statements',
  profit_loss: 'Profit and loss statements',
  balance_sheet: 'Balance sheets',
  cash_flow: 'Cash flow statements',
  bank_statement: 'Bank statements',
  gst_return: 'GST returns',
  itr: 'Income tax returns',
  trial_balance: 'Trial balance and general ledger',
  ar_ageing: 'Accounts receivable ageing',
  ap_ageing: 'Accounts payable ageing',
  loan_statement: 'Existing loan statements',
  credit_bureau: 'Credit bureau reports',
  registration_docs: 'Business registration documents',
  sales_purchase: 'Sales and purchase reports',
  other: 'Other supporting documents',
}

export const DOCUMENT_STATUS_LABEL: Record<DocumentStatus, string> = {
  queued: 'Queued',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
}

export interface ExtractedFact {
  label: string
  value: string
  period?: string
  page?: number
}

export interface FinDocument {
  id: string
  assessmentId: string
  companyName: string
  name: string
  type: DocumentType
  userCategory?: string
  customCategory?: string
  sizeBytes: number
  uploadedAt: string
  status: DocumentStatus
  /** 0-100, present while processing when the backend reports it. */
  progress?: number
  periodCovered?: string
  extractedFieldCount?: number
  confidence?: number
  missingFields?: string[]
  limitations?: string | string[]
  relevantMetrics?: string[]
  relatedFindingIds?: string[]
  error?: string
  /** Demo adapter finished this document without parsing the file. */
  simulated?: boolean
  facts?: ExtractedFact[]
}

export interface DocumentQuery {
  assessmentId?: string
  status?: DocumentStatus | ''
  type?: DocumentType | ''
  search?: string
}
