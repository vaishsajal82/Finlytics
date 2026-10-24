import { IS_DEMO } from '@/lib/constants'
import { sleep } from '@/lib/utils'
import { http } from '@/services/api/client'
import { endpoints } from '@/services/api/endpoints'
import { ApiError } from '@/services/api/errors'
import * as demo from '@/services/demo/db'
import type { Paginated } from '@/types/common'
import type { Assessment, AssessmentQuery, CreateAssessmentInput, UpdateAssessmentInput } from '../types'

const notFound = () => new ApiError('not_found', 'Assessment not found.', 404)

export const assessmentService = {
  async list(q: AssessmentQuery): Promise<Paginated<Assessment>> {
    if (IS_DEMO) {
      await sleep(250)
      return demo.listAssessments(q)
    }
    return http.get<Paginated<Assessment>>(endpoints.assessments, { ...q })
  },

  async get(id: string): Promise<Assessment> {
    if (IS_DEMO) {
      await sleep(150)
      const a = demo.getAssessment(id)
      if (!a) throw notFound()
      return a
    }
    return http.get<Assessment>(endpoints.assessment(id))
  },

  async create(input: CreateAssessmentInput): Promise<Assessment> {
    if (IS_DEMO) {
      await sleep(400)
      return demo.createAssessment(input)
    }
    return http.post<Assessment>(endpoints.assessments, input)
  },

  async update(id: string, input: UpdateAssessmentInput): Promise<Assessment> {
    if (IS_DEMO) {
      await sleep(300)
      const a = demo.updateAssessment(id, input)
      if (!a) throw notFound()
      return a
    }
    return http.patch<Assessment>(endpoints.assessment(id), input)
  },

  async remove(id: string): Promise<void> {
    if (IS_DEMO) {
      await sleep(250)
      demo.deleteAssessment(id)
      return
    }
    await http.delete(endpoints.assessment(id))
  },
}
