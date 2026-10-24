import { DEMO_STORAGE_KEY } from '@/lib/constants'
import { uid } from '@/lib/utils'
import type { Assessment, AssessmentQuery, CreateAssessmentInput, StageKey, StageStatus, UpdateAssessmentInput } from '@/features/assessments/types'
import type { ActivityEvent, Overview } from '@/features/dashboard/types'
import type { DocumentQuery, DocumentType, FinDocument } from '@/features/documents/types'
import type { Finding, FindingQuery, ReviewStatus } from '@/features/risk-analysis/types'
import type { Report } from '@/features/reports/types'
import type { Paginated, Severity } from '@/types/common'
import { PAGE_SIZE } from '@/lib/constants'
import { DOCUMENT_TYPE_LABEL } from '@/features/documents/types'
import { buildPreliminaryRecommendation, buildReportSections } from './reportBuilder'
import { buildAnalysis, type FinancialSeed } from './financials'
import { buildSeed, type DemoState, type StoredAssessment } from './seed'

let state: DemoState | null = null

function load(): DemoState {
  if (state) return state
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState
      if (parsed.version === 1) {
        state = parsed
        return state
      }
    }
  } catch {
    /* storage unavailable or corrupt: fall through to a fresh seed */
  }
  state = buildSeed()
  return state
}

function save() {
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* in-memory only */
  }
}

export function resetDemo() {
  state = buildSeed()
  save()
}

const SEVERITY_RANK: Record<Severity, number> = { high: 3, medium: 2, low: 1 }

// --- Derivations ------------------------------------------------------------------

/** Documents with simulated processing progress resolved from timestamps. */
function resolveDocument(d: FinDocument): FinDocument {
  const meta = (d as FinDocument & { _readyAt?: number; _startAt?: number })
  if (!meta._readyAt || d.status === 'failed') return d
  const now = Date.now()
  if (now >= meta._readyAt) return { ...d, status: 'completed', progress: 100, simulated: true, extractedFieldCount: 0 }
  if (now >= (meta._startAt ?? 0)) {
    const p = Math.round(((now - (meta._startAt ?? 0)) / (meta._readyAt - (meta._startAt ?? 0))) * 100)
    return { ...d, status: 'processing', progress: Math.min(95, p), simulated: true }
  }
  return { ...d, status: 'queued', progress: 0, simulated: true }
}

function documentsOf(assessmentId: string): FinDocument[] {
  return load().documents.filter((d) => d.assessmentId === assessmentId).map(resolveDocument)
}

function deriveStages(a: StoredAssessment): Record<StageKey, StageStatus> {
  const docs = documentsOf(a.id)
  const failed = docs.some((d) => d.status === 'failed')
  const busy = docs.some((d) => d.status === 'queued' || d.status === 'processing')
  const done = docs.length > 0 && docs.every((d) => d.status === 'completed')

  const s = load()
  const hasAnalysis = Boolean(s.analyses[a.id])
  const findings = s.findings.filter((f) => f.assessmentId === a.id)
  const hasFindings = findings.length > 0
  const hasReport = s.reports.some((r) => r.assessmentId === a.id && r.status === 'ready')

  if (a.fixedStages) {
    return {
      ...a.stages,
      ...(hasReport ? { report: 'completed' as const } : {}),
      ...(hasAnalysis ? { analysis: 'completed' as const } : {}),
    }
  }

  return {
    company: 'completed',
    documents: docs.length ? 'completed' : 'active',
    extraction: failed ? 'failed' : busy ? 'active' : done ? 'completed' : 'pending',
    analysis: hasAnalysis ? 'completed' : done ? 'active' : 'pending',
    investigation: hasFindings && findings.some((f) => f.reviewStatus !== 'unreviewed') ? 'completed' : hasAnalysis ? 'active' : 'pending',
    report: hasReport ? 'completed' : hasFindings ? 'active' : 'pending',
  }
}

function hydrate(a: StoredAssessment): Assessment {
  const s = load()
  const findings = s.findings.filter((f) => f.assessmentId === a.id)
  const active = findings.filter((f) => f.reviewStatus !== 'dismissed')
  const overall = active.reduce<Severity | null>((acc, f) => (!acc || SEVERITY_RANK[f.severity] > SEVERITY_RANK[acc] ? f.severity : acc), null)
  const stages = deriveStages(a)
  let status = a.status
  if (!a.fixedStages) status = stages.extraction === 'failed' ? 'failed' : stages.documents === 'completed' ? 'in_progress' : 'draft'
  return {
    ...a,
    stages,
    status,
    documentCount: documentsOf(a.id).length,
    riskSummary: findings.length
      ? {
          high: active.filter((f) => f.severity === 'high').length,
          medium: active.filter((f) => f.severity === 'medium').length,
          low: active.filter((f) => f.severity === 'low').length,
          unreviewed: findings.filter((f) => f.reviewStatus === 'unreviewed').length,
        }
      : null,
    overallRisk: overall,
  }
}

function log(assessmentId: string, kind: ActivityEvent['kind'], message: string) {
  const s = load()
  const a = s.assessments.find((x) => x.id === assessmentId)
  s.activity.unshift({ id: uid('ACT'), assessmentId, companyName: a?.companyName ?? 'Unknown', kind, message, at: new Date().toISOString() })
  s.activity = s.activity.slice(0, 50)
}

function paginate<T>(items: T[], page = 1, pageSize = PAGE_SIZE): Paginated<T> {
  const start = (page - 1) * pageSize
  return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize }
}

// --- Assessments -------------------------------------------------------------------

export function listAssessments(q: AssessmentQuery): Paginated<Assessment> {
  let rows = load().assessments.map(hydrate)
  const search = q.search?.trim().toLowerCase()
  if (search) rows = rows.filter((a) => a.companyName.toLowerCase().includes(search) || a.id.toLowerCase().includes(search))
  if (q.status) rows = rows.filter((a) => a.status === q.status)
  if (q.risk === 'none') rows = rows.filter((a) => a.overallRisk === null)
  else if (q.risk) rows = rows.filter((a) => a.overallRisk === q.risk)
  if (q.period) {
    const days = { '7d': 7, '30d': 30, '90d': 90 }[q.period]
    const cutoff = Date.now() - days * 86400_000
    rows = rows.filter((a) => new Date(a.createdAt).getTime() >= cutoff)
  }
  const dir = q.order === 'asc' ? 1 : -1
  const key = q.sort ?? 'createdAt'
  rows.sort((a, b) => {
    if (key === 'overallRisk') return dir * ((a.overallRisk ? SEVERITY_RANK[a.overallRisk] : 0) - (b.overallRisk ? SEVERITY_RANK[b.overallRisk] : 0))
    const av = String(a[key])
    const bv = String(b[key])
    return dir * av.localeCompare(bv)
  })
  return paginate(rows, q.page, q.pageSize)
}

export function getAssessment(id: string): Assessment | undefined {
  const a = load().assessments.find((x) => x.id === id)
  return a ? hydrate(a) : undefined
}

export function createAssessment(input: CreateAssessmentInput): Assessment {
  const s = load()
  const n = Math.max(1000, ...s.assessments.map((x) => Number(x.id.replace(/\D/g, '')) || 0)) + 1
  const now = new Date().toISOString()
  const a: StoredAssessment = {
    id: `ASM-${n}`,
    companyName: input.companyName.trim(),
    purpose: input.purpose.trim(),
    cin: input.cin?.trim() || undefined,
    gstin: input.gstin?.trim() || undefined,
    pan: input.pan?.trim() || undefined,
    industry: input.industry?.trim() || undefined,
    businessType: input.businessType?.trim() || undefined,
    requestedLoanAmount: input.requestedLoanAmount || undefined,
    currency: input.currency?.trim() || 'INR',
    facilityType: input.facilityType?.trim() || undefined,
    proposedTenure: input.proposedTenure?.trim() || undefined,
    annualTurnover: input.annualTurnover || undefined,
    existingDebt: input.existingDebt || undefined,
    operatingHistory: input.operatingHistory?.trim() || undefined,
    assignedAnalyst: input.assignedAnalyst?.trim() || undefined,
    assessmentDate: input.assessmentDate || now,
    reportingPeriod: input.reportingPeriod?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
    status: 'draft',
    stages: { company: 'completed', documents: 'active', extraction: 'pending', analysis: 'pending', investigation: 'pending', report: 'pending' },
    fixedStages: false,
    isDemo: true,
  }
  s.assessments.unshift(a)
  log(a.id, 'assessment_created', 'Assessment created')
  save()
  return hydrate(a)
}

export function updateAssessment(id: string, input: UpdateAssessmentInput): Assessment | undefined {
  const a = load().assessments.find((x) => x.id === id)
  if (!a) return undefined
  Object.assign(a, {
    ...(input.companyName !== undefined && { companyName: input.companyName.trim() }),
    ...(input.purpose !== undefined && { purpose: input.purpose.trim() }),
    cin: input.cin !== undefined ? input.cin.trim() || undefined : a.cin,
    gstin: input.gstin !== undefined ? input.gstin.trim() || undefined : a.gstin,
    pan: input.pan !== undefined ? input.pan.trim() || undefined : a.pan,
    industry: input.industry !== undefined ? input.industry.trim() || undefined : a.industry,
    businessType: input.businessType !== undefined ? input.businessType.trim() || undefined : a.businessType,
    requestedLoanAmount: input.requestedLoanAmount !== undefined ? input.requestedLoanAmount : a.requestedLoanAmount,
    currency: input.currency !== undefined ? input.currency.trim() || undefined : a.currency,
    facilityType: input.facilityType !== undefined ? input.facilityType.trim() || undefined : a.facilityType,
    proposedTenure: input.proposedTenure !== undefined ? input.proposedTenure.trim() || undefined : a.proposedTenure,
    annualTurnover: input.annualTurnover !== undefined ? input.annualTurnover : a.annualTurnover,
    existingDebt: input.existingDebt !== undefined ? input.existingDebt : a.existingDebt,
    operatingHistory: input.operatingHistory !== undefined ? input.operatingHistory.trim() || undefined : a.operatingHistory,
    assignedAnalyst: input.assignedAnalyst !== undefined ? input.assignedAnalyst.trim() || undefined : a.assignedAnalyst,
    assessmentDate: input.assessmentDate !== undefined ? input.assessmentDate : a.assessmentDate,
    reportingPeriod: input.reportingPeriod !== undefined ? input.reportingPeriod.trim() || undefined : a.reportingPeriod,
    updatedAt: new Date().toISOString(),
  })
  save()
  return hydrate(a)
}

export function deleteAssessment(id: string) {
  const s = load()
  s.assessments = s.assessments.filter((a) => a.id !== id)
  s.documents = s.documents.filter((d) => d.assessmentId !== id)
  s.findings = s.findings.filter((f) => f.assessmentId !== id)
  s.reports = s.reports.filter((r) => r.assessmentId !== id)
  delete s.analyses[id]
  s.activity = s.activity.filter((e) => e.assessmentId !== id)
  save()
}

export function getOverview(): Overview {
  const s = load()
  const all = s.assessments.map(hydrate)
  const statusCounts = { draft: 0, in_progress: 0, review: 0, completed: 0, failed: 0 }
  for (const a of all) statusCounts[a.status] += 1
  const recent = [...all].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5)
  const reportsReadyCount = s.reports.filter((r) => r.status === 'ready').length
  const documentsAwaitingProcessingCount = s.documents.filter((d) => d.status === 'queued' || d.status === 'processing').length
  const outstandingFindingsCount = s.findings.filter((f) => f.reviewStatus === 'unreviewed' || f.reviewStatus === 'needs_info').length
  const highRiskFindingsCount = s.findings.filter((f) => f.severity === 'high' && f.reviewStatus !== 'dismissed').length

  return {
    statusCounts,
    total: all.length,
    recent,
    activity: s.activity.slice(0, 8),
    reportsReadyCount,
    documentsAwaitingProcessingCount,
    outstandingFindingsCount,
    highRiskFindingsCount,
  }
}

// --- Documents ----------------------------------------------------------------------

export function listDocuments(q: DocumentQuery): FinDocument[] {
  let rows = load().documents.map(resolveDocument)
  if (q.assessmentId) rows = rows.filter((d) => d.assessmentId === q.assessmentId)
  if (q.status) rows = rows.filter((d) => d.status === q.status)
  if (q.type) rows = rows.filter((d) => d.type === q.type)
  const search = q.search?.trim().toLowerCase()
  if (search) rows = rows.filter((d) => d.name.toLowerCase().includes(search) || d.companyName.toLowerCase().includes(search))
  return rows.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
}

export function getDocument(id: string): FinDocument | undefined {
  const d = load().documents.find((x) => x.id === id)
  return d ? resolveDocument(d) : undefined
}

export function addDocument(
  assessmentId: string,
  file: { name: string; size: number },
  type: DocumentType,
  userCategory?: string,
  customCategory?: string,
): FinDocument {
  const s = load()
  const a = s.assessments.find((x) => x.id === assessmentId)
  const now = Date.now()
  const categoryLabel = customCategory || userCategory || DOCUMENT_TYPE_LABEL[type]
  const d: FinDocument & { _startAt: number; _readyAt: number } = {
    id: uid('DOC'),
    assessmentId,
    companyName: a?.companyName ?? 'Unknown',
    name: file.name,
    type,
    userCategory: categoryLabel,
    customCategory,
    sizeBytes: file.size,
    uploadedAt: new Date(now).toISOString(),
    status: 'queued',
    progress: 0,
    confidence: 0.95,
    extractedFieldCount: Math.floor(Math.random() * 20) + 20,
    facts: [
      { label: `${categoryLabel} Document Header`, value: 'Verified statutory format', period: 'FY25', page: 1 },
      { label: 'File Hash & Checksum', value: 'SHA256:Valid', period: 'Current', page: 1 },
      { label: 'Primary Reporting Entity', value: a?.companyName ?? 'Verified', period: 'FY25', page: 1 },
    ],
    simulated: true,
    _startAt: now + 600,
    _readyAt: now + 3000,
  }
  s.documents.unshift(d)
  log(assessmentId, 'document_uploaded', `Uploaded ${file.name} (${categoryLabel})`)
  save()
  return d
}

export function retryDocument(id: string): FinDocument | undefined {
  const d = load().documents.find((x) => x.id === id)
  if (!d) return undefined
  const now = Date.now()
  Object.assign(d, { status: 'queued', error: undefined, progress: 0, simulated: true, _startAt: now + 1000, _readyAt: now + 5000 })
  save()
  return resolveDocument(d)
}

export function deleteDocument(id: string) {
  const s = load()
  s.documents = s.documents.filter((d) => d.id !== id)
  save()
}

// --- Analysis, findings ---------------------------------------------------------------

export function getAnalysis(assessmentId: string) {
  return load().analyses[assessmentId]
}

export function listFindings(q: FindingQuery): Finding[] {
  let rows = [...load().findings]
  if (q.assessmentId) rows = rows.filter((f) => f.assessmentId === q.assessmentId)
  if (q.severity) rows = rows.filter((f) => f.severity === q.severity)
  if (q.classification) rows = rows.filter((f) => f.classification === q.classification)
  if (q.reviewStatus) rows = rows.filter((f) => f.reviewStatus === q.reviewStatus)
  const search = q.search?.trim().toLowerCase()
  if (search) rows = rows.filter((f) => f.title.toLowerCase().includes(search) || f.companyName.toLowerCase().includes(search))
  return rows.sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] || b.detectedAt.localeCompare(a.detectedAt))
}

export function setReviewStatus(id: string, status: ReviewStatus): Finding | undefined {
  const f = load().findings.find((x) => x.id === id)
  if (!f) return undefined
  f.reviewStatus = status
  log(f.assessmentId, 'finding_reviewed', `Finding “${f.title}” marked ${status.replace('_', ' ')}`)
  save()
  return f
}

export function addNote(id: string, text: string, author: string): Finding | undefined {
  const f = load().findings.find((x) => x.id === id)
  if (!f) return undefined
  f.notes.push({ id: uid('N'), author, createdAt: new Date().toISOString(), text: text.trim() })
  save()
  return f
}

// --- Reports -----------------------------------------------------------------------------

export function triggerAnalysis(assessmentId: string) {
  const s = load()
  const a = s.assessments.find((x) => x.id === assessmentId)
  if (!a) throw new Error('Assessment not found')
  if (s.analyses[assessmentId]) return s.analyses[assessmentId]

  const turnover = a.annualTurnover ? a.annualTurnover / 1e7 : 46.6
  const qTurnover = turnover / 4
  const debt = a.existingDebt ? a.existingDebt / 1e7 : 18.2

  const seed: FinancialSeed = {
    revenue: [
      qTurnover * 0.88,
      qTurnover * 0.92,
      qTurnover * 0.98,
      qTurnover * 1.01,
      qTurnover * 1.15,
      qTurnover * 1.22,
      qTurnover * 1.28,
      qTurnover * 1.33,
    ],
    ocf: [
      qTurnover * 0.2,
      qTurnover * 0.21,
      qTurnover * 0.22,
      qTurnover * 0.21,
      qTurnover * 0.2,
      qTurnover * 0.18,
      qTurnover * 0.17,
      qTurnover * 0.14,
    ],
    receivables: [
      qTurnover * 0.55,
      qTurnover * 0.59,
      qTurnover * 0.63,
      qTurnover * 0.68,
      qTurnover * 0.75,
      qTurnover * 0.85,
      qTurnover * 0.93,
      qTurnover * 1.01,
    ],
    netProfit: [turnover * 0.08, turnover * 0.084],
    payables: [turnover * 0.15, turnover * 0.155],
    currentAssets: turnover * 0.468,
    currentLiabilities: turnover * 0.341,
    debt: debt,
    equity: turnover * 0.528,
    grossProfit: [turnover * 0.4, turnover * 0.39],
    ebitda: [turnover * 0.17, turnover * 0.167],
    cash: [turnover * 0.045, turnover * 0.04],
    inventory: [turnover * 0.09, turnover * 0.124],
    annualDebtObligations: debt * 0.25,
  }

  const docs = documentsOf(assessmentId)
  const plDoc = docs.find((d) => d.type === 'profit_loss') ?? { id: 'DOC-PL', name: `${a.companyName.toLowerCase().replace(/\s+/g, '_')}_pnl.xlsx` }
  const bsDoc = docs.find((d) => d.type === 'balance_sheet') ?? { id: 'DOC-BS', name: `${a.companyName.toLowerCase().replace(/\s+/g, '_')}_balance_sheet.pdf` }
  const cfDoc = docs.find((d) => d.type === 'cash_flow') ?? { id: 'DOC-CF', name: `${a.companyName.toLowerCase().replace(/\s+/g, '_')}_cashflow.pdf` }

  const analysis = buildAnalysis(
    assessmentId,
    seed,
    {
      pl: { documentId: plDoc.id, documentName: plDoc.name },
      bs: { documentId: bsDoc.id, documentName: bsDoc.name },
      cf: { documentId: cfDoc.id, documentName: cfDoc.name },
    },
    new Date().toISOString(),
  )

  s.analyses[assessmentId] = analysis
  log(assessmentId, 'finding_detected', 'Financial analysis calculated & credit indicators compiled')
  save()
  return analysis
}

export function runTinyFishResearch(assessmentId: string): Finding[] {
  const s = load()
  const a = s.assessments.find((x) => x.id === assessmentId)
  if (!a) throw new Error('Assessment not found')
  const findings = s.findings.filter((f) => f.assessmentId === assessmentId)
  for (const f of findings) {
    if (f.reviewStatus === 'unreviewed') {
      f.reviewStatus = 'investigating'
    }
  }
  log(assessmentId, 'finding_reviewed', 'TinyFish external research completed across MCA, e-Courts, and adverse media registries')
  save()
  return findings
}

export function listReports(): Report[] {
  const s = load()
  return s.assessments.map((a) => {
    const existing = s.reports.find((r) => r.assessmentId === a.id)
    return (
      existing ?? {
        id: `RPT-${a.id}`,
        assessmentId: a.id,
        companyName: a.companyName,
        assessmentDate: a.createdAt,
        status: 'not_generated' as const,
        draft: true,
        sections: [],
        isDemo: true,
      }
    )
  })
}

export function generateReport(assessmentId: string): Report {
  const s = load()
  const a = s.assessments.find((x) => x.id === assessmentId)
  if (!a) throw new Error('Assessment not found')
  const analysis = s.analyses[assessmentId]
  const findings = s.findings.filter((f) => f.assessmentId === assessmentId)
  if (!analysis) throw new Error('No financial analysis exists for this assessment yet, so a report cannot be compiled.')
  const hyd = hydrate(a)
  const report: Report = {
    id: `RPT-${assessmentId}`,
    assessmentId,
    companyName: a.companyName,
    assessmentDate: a.createdAt,
    status: 'ready',
    version: '2.4',
    generatedAt: new Date().toISOString(),
    draft: a.status !== 'completed',
    recommendation: buildPreliminaryRecommendation(hyd, analysis, findings),
    preliminaryRecommendation: buildPreliminaryRecommendation(hyd, analysis, findings),
    sections: buildReportSections(hyd, analysis, findings),
    isDemo: true,
  }
  s.reports = s.reports.filter((r) => r.assessmentId !== assessmentId)
  s.reports.push(report)
  log(assessmentId, 'report_generated', 'Comprehensive decision-support report generated')
  save()
  return report
}

export function getReport(assessmentId: string): Report | undefined {
  return listReports().find((r) => r.assessmentId === assessmentId)
}
