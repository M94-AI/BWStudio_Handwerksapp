// apps/handwerks-portal/src/services/invoices.ts
import { API_URL } from '@/config'

export type InvoiceStatus = 'offen' | 'bezahlt'

export type Invoice = {
  id?: string | number
  orderId?: string | number
  customerId: number
  title: string
  status: InvoiceStatus
  total: number
  dueDate?: string // YYYY-MM-DD
  notes?: string
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

export const listInvoices  = () => http<Invoice[]>(`${API_URL}/invoices`)
export const getInvoice    = (id: string | number) => http<Invoice>(`${API_URL}/invoices/${id}`)

export const createInvoice = (data: Invoice) =>
  fetch(`${API_URL}/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(async (r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    try { return await r.json() } catch { return data }
  })

export const updateInvoice = (id: string | number, data: Partial<Invoice>) =>
  http<Invoice>(`${API_URL}/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteInvoice = async (id: string | number) => {
  const r = await fetch(`${API_URL}/invoices/${id}`, { method: 'DELETE' })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return true
}
