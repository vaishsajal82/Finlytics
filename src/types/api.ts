/** Error body shape the client understands (FastAPI default `{detail}` or `{message}`). */
export interface ApiErrorBody {
  detail?: string | { loc?: (string | number)[]; msg: string }[]
  message?: string
}

export interface HealthResponse {
  status: string
  version?: string
}
