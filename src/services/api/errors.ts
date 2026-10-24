import type { ApiErrorBody } from '@/types/api'

export type ApiErrorKind = 'network' | 'validation' | 'auth' | 'not_found' | 'server' | 'unknown'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number
  readonly fieldErrors: Record<string, string>

  constructor(kind: ApiErrorKind, message: string, status?: number, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export function fromResponse(status: number, body: ApiErrorBody | null): ApiError {
  const fieldErrors: Record<string, string> = {}
  let detail = ''
  if (body?.detail && Array.isArray(body.detail)) {
    for (const d of body.detail) {
      const key = d.loc?.filter((p) => p !== 'body').join('.') ?? ''
      if (key) fieldErrors[key] = d.msg
    }
    detail = body.detail.map((d) => d.msg).join('; ')
  } else if (typeof body?.detail === 'string') detail = body.detail
  else if (body?.message) detail = body.message

  if (status === 401 || status === 403) return new ApiError('auth', 'You are not authorised to perform this action.', status)
  if (status === 404) return new ApiError('not_found', 'The requested resource was not found.', status)
  if (status === 422 || status === 400)
    return new ApiError('validation', detail || 'Some fields are invalid.', status, fieldErrors)
  if (status >= 500) return new ApiError('server', 'The server hit a problem. Please try again shortly.', status)
  return new ApiError('unknown', detail || `Unexpected response (${status}).`, status)
}

export function networkError(): ApiError {
  return new ApiError('network', 'Cannot reach the Finlytics API. Check that the backend is running and VITE_API_BASE_URL is correct.')
}

export function toUserMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return 'Something went wrong.'
}
