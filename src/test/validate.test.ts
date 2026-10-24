import { describe, expect, it } from 'vitest'
import { guessDocumentType, validateFile } from '@/services/file-upload/validate'
import { MAX_UPLOAD_BYTES } from '@/lib/constants'

describe('validateFile', () => {
  it('accepts supported types', () => {
    expect(validateFile({ name: 'a.pdf', size: 1000 })).toBeNull()
    expect(validateFile({ name: 'B.XLSX', size: 1000 })).toBeNull()
  })
  it('rejects unsupported extensions, empty and oversized files', () => {
    expect(validateFile({ name: 'a.exe', size: 10 })).toMatch(/Unsupported/)
    expect(validateFile({ name: 'noext', size: 10 })).toMatch(/Unsupported/)
    expect(validateFile({ name: 'a.pdf', size: 0 })).toMatch(/empty/)
    expect(validateFile({ name: 'a.pdf', size: MAX_UPLOAD_BYTES + 1 })).toMatch(/limit/)
  })
  it('guesses document type from filename', () => {
    expect(guessDocumentType('acme_gstr3b.pdf')).toBe('gst_return')
    expect(guessDocumentType('balance_sheet_fy25.pdf')).toBe('balance_sheet')
    expect(guessDocumentType('cashflow.pdf')).toBe('cash_flow')
    expect(guessDocumentType('misc.pdf')).toBe('other')
  })
})
