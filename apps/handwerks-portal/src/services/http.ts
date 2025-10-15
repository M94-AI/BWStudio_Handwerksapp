import { API_URL } from '@/config'
export async function apiGet(path: string) {
  const r = await fetch(`${API_URL}${path}`)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}
