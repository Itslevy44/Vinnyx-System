// API Client with bearer token & unified error handling

const API_BASE_URL = '/api/v1'

export interface ApiResponse<T = any> {
  data: T
  status: number
  message?: string
}

export class ApiClientError extends Error {
  code: string
  status: number
  details?: Record<string, string[]>

  constructor(message: string, code: string = 'UNKNOWN_ERROR', status: number = 500, details?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiClientError'
    this.code = code
    this.status = status
    this.details = details
  }
}

export function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export async function request<T = any>(
  endpoint: string,
  options: RequestInit & { idempotencyKey?: string } = {}
): Promise<T> {
  const token = localStorage.getItem('vinnyx_token')
  const headers = new Headers(options.headers || {})

  headers.set('Accept', 'application/json')
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (options.idempotencyKey) {
    headers.set('Idempotency-Key', options.idempotencyKey)
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    })

    if (res.status === 204) {
      return {} as T
    }

    const contentType = res.headers.get('content-type')
    const isJson = contentType && contentType.includes('application/json')
    const payload = isJson ? await res.json() : await res.text()

    if (!res.ok) {
      const message =
        payload?.error?.message ||
        payload?.message ||
        (typeof payload?.error === 'string' ? payload.error : 'Request failed')
      const code = payload?.error?.code || payload?.code || `HTTP_${res.status}`
      const details = payload?.errors || undefined
      throw new ApiClientError(message, code, res.status, details)
    }

    if (payload && typeof payload === 'object' && 'data' in payload) {
      return (payload as { data: T }).data
    }

    return payload as T
  } catch (err: any) {
    if (err instanceof ApiClientError) {
      throw err
    }
    // Network or parse error
    throw new ApiClientError(err?.message || 'Network connection failed', 'NETWORK_ERROR', 0)
  }
}
