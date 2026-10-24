import { buildUrl } from '@/services/api/client'
import { ApiError, fromResponse, networkError } from '@/services/api/errors'
import type { ApiErrorBody } from '@/types/api'

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/** XHR is used (not fetch) because fetch cannot report upload progress. */
export function uploadWithProgress<T>(path: string, form: FormData, onProgress: (pct: number) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', buildUrl(path))
    xhr.setRequestHeader('Accept', 'application/json')
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onerror = () => reject(networkError())
    xhr.onload = () => {
      const body = parseJson(xhr.responseText)
      if (xhr.status >= 200 && xhr.status < 300) {
        if (body === null) reject(new ApiError('unknown', 'The server returned an unreadable response.', xhr.status))
        else resolve(body as T)
      } else reject(fromResponse(xhr.status, body as ApiErrorBody | null))
    }
    xhr.send(form)
  })
}
