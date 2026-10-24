import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reportService } from '../services/reportService'

export const useReports = () => useQuery({ queryKey: ['reports'], queryFn: reportService.list })

export function useGenerateReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: reportService.generate,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['reports'] })
      void qc.invalidateQueries({ queryKey: ['overview'] })
    },
  })
}
