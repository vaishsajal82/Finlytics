import { IS_DEMO } from '@/lib/constants'
import { sleep } from '@/lib/utils'
import { http } from '@/services/api/client'
import { endpoints } from '@/services/api/endpoints'
import { ApiError } from '@/services/api/errors'
import * as demo from '@/services/demo/db'
import type { Finding, FindingQuery, ReviewStatus } from '../types'

const notFound = () => new ApiError('not_found', 'Finding not found.', 404)

export const riskService = {
  async list(q: FindingQuery): Promise<Finding[]> {
    if (IS_DEMO) {
      await sleep(250)
      return demo.listFindings(q)
    }
    return http.get<Finding[]>(endpoints.findings, { ...q })
  },

  async setReviewStatus(id: string, reviewStatus: ReviewStatus): Promise<Finding> {
    if (IS_DEMO) {
      await sleep(200)
      const f = demo.setReviewStatus(id, reviewStatus)
      if (!f) throw notFound()
      return f
    }
    return http.patch<Finding>(endpoints.finding(id), { reviewStatus })
  },

  async addNote(id: string, text: string, author: string): Promise<Finding> {
    if (IS_DEMO) {
      await sleep(200)
      const f = demo.addNote(id, text, author)
      if (!f) throw notFound()
      return f
    }
    return http.post<Finding>(endpoints.findingNotes(id), { text })
  },

  async runTinyFishResearch(assessmentId: string): Promise<Finding[]> {
    if (IS_DEMO) {
      await sleep(800)
      return demo.runTinyFishResearch(assessmentId)
    }
    return http.post<Finding[]>(endpoints.assessmentFindings(assessmentId) ?? endpoints.findings, {})
  },
}
