import { IS_DEMO } from '@/lib/constants'
import { sleep } from '@/lib/utils'
import { http } from '@/services/api/client'
import { endpoints } from '@/services/api/endpoints'
import { ApiError } from '@/services/api/errors'
import * as demo from '@/services/demo/db'
import type { FinancialAnalysis } from '../types'

export const financialService = {
  /** Resolves to null when no analysis exists yet (never fabricated). */
  async get(assessmentId: string): Promise<FinancialAnalysis | null> {
    if (IS_DEMO) {
      await sleep(250)
      return demo.getAnalysis(assessmentId) ?? null
    }
    try {
      return await http.get<FinancialAnalysis>(endpoints.assessmentFinancials(assessmentId))
    } catch (e) {
      if (e instanceof ApiError && e.kind === 'not_found') return null
      throw e
    }
  },
  async triggerAnalysis(assessmentId: string): Promise<FinancialAnalysis> {
    if (IS_DEMO) {
      await sleep(600)
      return demo.triggerAnalysis(assessmentId)
    }
    return http.post<FinancialAnalysis>(endpoints.assessmentFinancials(assessmentId))
  },
}
