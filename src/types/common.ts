export type MetricUnit = 'currency' | 'percent' | 'ratio' | 'days'

export type Severity = 'high' | 'medium' | 'low'

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export type SortOrder = 'asc' | 'desc'

/** Pointer back to a source document so every figure is traceable. */
export interface SourceRef {
  documentId: string
  documentName: string
  page?: number
  locator?: string
}
