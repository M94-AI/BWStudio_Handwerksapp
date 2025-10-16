
// Kern: generischer HTTP-Helper
export async function http<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try { msg += `: ${await res.text()}` } catch {}
    throw new Error(msg)
  }
  // 204 No Content => kein Body
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const httpGet  = <T>(url: string) => http<T>(url)
export const httpPost = <T>(url: string, body: unknown) =>
  http<T>(url, { method: 'POST', body: JSON.stringify(body) })
export const httpPut  = <T>(url: string, body: unknown) =>
  http<T>(url, { method: 'PUT', body: JSON.stringify(body) })
export const httpDel  = <T>(url: string) =>
  http<T>(url, { method: 'DELETE' })

export const apiGet = httpGet

export default http
