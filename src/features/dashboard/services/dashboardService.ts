import { IS_DEMO } from '@/lib/constants'
import { sleep } from '@/lib/utils'
import { http } from '@/services/api/client'
import { endpoints } from '@/services/api/endpoints'
import * as demo from '@/services/demo/db'
import type { Overview } from '../types'

export const dashboardService = {
  async overview(): Promise<Overview> {
    if (IS_DEMO) {
      await sleep(250)
      return demo.getOverview()
    }
    return http.get<Overview>(endpoints.overview)
  },
}
