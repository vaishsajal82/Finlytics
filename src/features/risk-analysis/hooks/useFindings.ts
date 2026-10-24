import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { riskService } from '../services/riskService'
import type { FindingQuery, ReviewStatus } from '../types'

export const useFindings = (q: FindingQuery) => useQuery({ queryKey: ['findings', q], queryFn: () => riskService.list(q) })

function useRefresh() {
  const qc = useQueryClient()
  return () => {
    void qc.invalidateQueries({ queryKey: ['findings'] })
    void qc.invalidateQueries({ queryKey: ['assessments'] })
    void qc.invalidateQueries({ queryKey: ['overview'] })
  }
}

export function useSetReviewStatus() {
  const refresh = useRefresh()
  return useMutation({ mutationFn: ({ id, status }: { id: string; status: ReviewStatus }) => riskService.setReviewStatus(id, status), onSuccess: refresh })
}

export function useAddNote(author: string) {
  const refresh = useRefresh()
  return useMutation({ mutationFn: ({ id, text }: { id: string; text: string }) => riskService.addNote(id, text, author), onSuccess: refresh })
}

export function useRunTinyFishResearch() {
  const refresh = useRefresh()
  return useMutation({
    mutationFn: (assessmentId: string) => riskService.runTinyFishResearch(assessmentId),
    onSuccess: refresh,
  })
}
