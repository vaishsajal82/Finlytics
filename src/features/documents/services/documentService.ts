import { IS_DEMO } from '@/lib/constants'
import { sleep } from '@/lib/utils'
import { http } from '@/services/api/client'
import { endpoints } from '@/services/api/endpoints'
import { ApiError } from '@/services/api/errors'
import * as demo from '@/services/demo/db'
import { uploadWithProgress } from '@/services/file-upload/upload'
import type { DocumentQuery, DocumentType, FinDocument } from '../types'

export const documentService = {
  async list(q: DocumentQuery): Promise<FinDocument[]> {
    if (IS_DEMO) {
      await sleep(200)
      return demo.listDocuments(q)
    }
    return http.get<FinDocument[]>(q.assessmentId ? endpoints.assessmentDocuments(q.assessmentId) : endpoints.documents, { ...q, assessmentId: undefined })
  },

  async get(id: string): Promise<FinDocument> {
    if (IS_DEMO) {
      await sleep(120)
      const d = demo.getDocument(id)
      if (!d) throw new ApiError('not_found', 'Document not found.', 404)
      return d
    }
    return http.get<FinDocument>(endpoints.document(id))
  },

  async upload(
    assessmentId: string,
    file: File,
    type: DocumentType,
    onProgress: (pct: number) => void,
    userCategory?: string,
    customCategory?: string,
  ): Promise<FinDocument> {
    if (IS_DEMO) {
      for (const p of [20, 55, 85, 100]) {
        await sleep(180)
        onProgress(p)
      }
      return demo.addDocument(assessmentId, file, type, userCategory, customCategory)
    }
    const form = new FormData()
    form.append('file', file)
    form.append('type', type)
    if (userCategory) form.append('userCategory', userCategory)
    if (customCategory) form.append('customCategory', customCategory)
    return uploadWithProgress<FinDocument>(endpoints.assessmentDocuments(assessmentId), form, onProgress)
  },

  async retry(id: string): Promise<FinDocument> {
    if (IS_DEMO) {
      await sleep(200)
      const d = demo.retryDocument(id)
      if (!d) throw new ApiError('not_found', 'Document not found.', 404)
      return d
    }
    return http.post<FinDocument>(endpoints.documentRetry(id))
  },

  async remove(id: string): Promise<void> {
    if (IS_DEMO) {
      await sleep(200)
      demo.deleteDocument(id)
      return
    }
    await http.delete(endpoints.document(id))
  },
}
