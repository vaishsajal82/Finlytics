import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { assessmentService } from '../services/assessmentService'
import type { AssessmentQuery, UpdateAssessmentInput } from '../types'

export const assessmentKeys = {
  all: ['assessments'] as const,
  list: (q: AssessmentQuery) => ['assessments', 'list', q] as const,
  detail: (id: string) => ['assessments', 'detail', id] as const,
}

export const useAssessments = (q: AssessmentQuery) =>
  useQuery({ queryKey: assessmentKeys.list(q), queryFn: () => assessmentService.list(q), placeholderData: keepPreviousData })

export const useAssessment = (id: string) => useQuery({ queryKey: assessmentKeys.detail(id), queryFn: () => assessmentService.get(id), retry: false })

export function useCreateAssessment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: assessmentService.create,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: assessmentKeys.all })
      void qc.invalidateQueries({ queryKey: ['overview'] })
    },
  })
}

export function useUpdateAssessment(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateAssessmentInput) => assessmentService.update(id, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: assessmentKeys.all }),
  })
}

export function useDeleteAssessment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: assessmentService.remove,
    onSuccess: () => {
      void qc.invalidateQueries()
    },
  })
}
