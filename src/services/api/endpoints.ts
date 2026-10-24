import { API_PREFIX } from '@/lib/constants'

/**
 * PROPOSED contract. The repository's backend currently contains only empty route
 * modules, so these paths are the frontend's expectation, documented in README.md.
 */
export const endpoints = {
  health: `${API_PREFIX}/health`,
  overview: `${API_PREFIX}/overview`,
  assessments: `${API_PREFIX}/assessments`,
  assessment: (id: string) => `${API_PREFIX}/assessments/${id}`,
  assessmentDocuments: (id: string) => `${API_PREFIX}/assessments/${id}/documents`,
  assessmentFinancials: (id: string) => `${API_PREFIX}/assessments/${id}/financials`,
  assessmentFindings: (id: string) => `${API_PREFIX}/assessments/${id}/findings`,
  assessmentReport: (id: string) => `${API_PREFIX}/assessments/${id}/reports`,
  documents: `${API_PREFIX}/documents`,
  document: (id: string) => `${API_PREFIX}/documents/${id}`,
  documentRetry: (id: string) => `${API_PREFIX}/documents/${id}/retry`,
  findings: `${API_PREFIX}/findings`,
  finding: (id: string) => `${API_PREFIX}/findings/${id}`,
  findingNotes: (id: string) => `${API_PREFIX}/findings/${id}/notes`,
  reports: `${API_PREFIX}/reports`,
  report: (id: string) => `${API_PREFIX}/reports/${id}`,
} as const
