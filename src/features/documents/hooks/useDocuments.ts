import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { documentService } from '../services/documentService'
import type { DocumentQuery } from '../types'

export const documentKeys = { all: ['documents'] as const, list: (q: DocumentQuery) => ['documents', 'list', q] as const }

/** Polls while any document is still queued or processing, using the backend's status field. */
export const useDocuments = (q: DocumentQuery) =>
  useQuery({
    queryKey: documentKeys.list(q),
    queryFn: () => documentService.list(q),
    refetchInterval: (query) => (query.state.data?.some((d) => d.status === 'queued' || d.status === 'processing') ? 2000 : false),
  })

function useInvalidateDocs() {
  const qc = useQueryClient()
  return () => {
    void qc.invalidateQueries({ queryKey: documentKeys.all })
    void qc.invalidateQueries({ queryKey: ['assessments'] })
    void qc.invalidateQueries({ queryKey: ['overview'] })
  }
}

export function useRetryDocument() {
  const invalidate = useInvalidateDocs()
  return useMutation({ mutationFn: documentService.retry, onSuccess: invalidate })
}

export function useDeleteDocument() {
  const invalidate = useInvalidateDocs()
  return useMutation({ mutationFn: documentService.remove, onSuccess: invalidate })
}

export { useInvalidateDocs }
