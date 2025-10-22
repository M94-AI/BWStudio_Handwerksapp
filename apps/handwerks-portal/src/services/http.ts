import { API_URL } from '@/config'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

export const apiGet = <T = any>(path: string) => request<T>(path)
export const apiPost = <T = any>(path: string, body: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) })
export const apiPut =  <T = any>(path: string, body: unknown) =>
  request<T>(path, { method: 'PUT',  body: JSON.stringify(body) })
export const apiDelete = <T = any>(path: string) =>
  request<T>(path, { method: 'DELETE' })
