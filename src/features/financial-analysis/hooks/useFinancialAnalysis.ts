import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { financialService } from '../services/financialService'

export const useFinancialAnalysis = (assessmentId: string) =>
  useQuery({ queryKey: ['financials', assessmentId], queryFn: () => financialService.get(assessmentId) })

export const useTriggerAnalysis = (assessmentId?: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (overrideId?: string) => financialService.triggerAnalysis(overrideId || assessmentId || ''),
    onSuccess: (data, variables) => {
      const id = variables || assessmentId || ''
      qc.setQueryData(['financials', id], data)
      void qc.invalidateQueries({ queryKey: ['assessment', id] })
      void qc.invalidateQueries({ queryKey: ['assessments'] })
      void qc.invalidateQueries({ queryKey: ['findings'] })
      void qc.invalidateQueries({ queryKey: ['overview'] })
    },
  })
}
