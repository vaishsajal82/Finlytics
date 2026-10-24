export type DataMode = 'demo' | 'live'

const rawMode = import.meta.env.VITE_DATA_MODE
/** Explicit switch. Never changed at runtime, never flipped after an API error. */
export const DATA_MODE: DataMode = rawMode === 'live' ? 'live' : 'demo'
export const IS_DEMO = DATA_MODE === 'demo'

export const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '')
export const API_PREFIX = '/api/v1'

const maxMb = Number(import.meta.env.VITE_MAX_UPLOAD_MB)
export const MAX_UPLOAD_BYTES = (Number.isFinite(maxMb) && maxMb > 0 ? maxMb : 25) * 1024 * 1024

/**
 * Formats the repository's requirements.txt can process (PyMuPDF/pdfplumber/pypdf for PDF,
 * openpyxl/xlrd for spreadsheets, pytesseract/pillow for scanned images, pandas for CSV).
 * The backend does not yet enforce a list; keep this in sync once it does.
 */
export const ACCEPTED_UPLOADS = [
  { ext: '.pdf', mime: 'application/pdf', label: 'PDF' },
  { ext: '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', label: 'Excel' },
  { ext: '.xls', mime: 'application/vnd.ms-excel', label: 'Excel (legacy)' },
  { ext: '.csv', mime: 'text/csv', label: 'CSV' },
  { ext: '.png', mime: 'image/png', label: 'Image (OCR)' },
  { ext: '.jpg', mime: 'image/jpeg', label: 'Image (OCR)' },
] as const

export const ACCEPT_ATTR = ACCEPTED_UPLOADS.map((f) => f.ext).join(',')

export const PAGE_SIZE = 10
export const PROFILE_STORAGE_KEY = 'finlytics.profile'
export const DEMO_STORAGE_KEY = 'finlytics.demo.v1'
