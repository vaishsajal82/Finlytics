import { IS_DEMO } from '@/lib/constants'
import { sleep } from '@/lib/utils'
import { http } from '@/services/api/client'
import { endpoints } from '@/services/api/endpoints'
import { ApiError } from '@/services/api/errors'
import * as demo from '@/services/demo/db'
import type { Report } from '../types'

export const reportService = {
  async list(): Promise<Report[]> {
    if (IS_DEMO) {
      await sleep(250)
      return demo.listReports()
    }
    return http.get<Report[]>(endpoints.reports)
  },

  async generate(assessmentId: string): Promise<Report> {
    if (IS_DEMO) {
      await sleep(900)
      try {
        return demo.generateReport(assessmentId)
      } catch (e) {
        throw new ApiError('validation', e instanceof Error ? e.message : 'Report generation failed.')
      }
    }
    return http.post<Report>(endpoints.assessmentReport(assessmentId))
  },
}
