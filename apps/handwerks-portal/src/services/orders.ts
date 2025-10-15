import { API_URL } from '@/config'

export type Order = {
  id?: number
  customerId: number
  title: string
  status: 'offen' | 'in Arbeit' | 'erledigt'
  due?: string       // ISO YYYY-MM-DD
  notes?: string
  priority?: number
}

// kleiner HTTP-Helper nur für diesen Service
async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const r = await fetch(input, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json() as Promise<T>
}

export const listOrders  = () => http<Order[]>(`${API_URL}/orders`)
export const getOrder    = (id: number | string) => http<Order>(`${API_URL}/orders/${id}`)
export const createOrder = (data: Order) =>
  fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(async (r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    // json-server liefert JSON zurück; falls ein anderes Backend 204 liefert:
    try { return await r.json() } catch { return data }
  })
export const updateOrder = (id: number | string, data: Partial<Order>) =>
  http<Order>(`${API_URL}/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteOrder = (id: number | string) =>
  fetch(`${API_URL}/orders/${id}`, { method: 'DELETE' }).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return true
  })
