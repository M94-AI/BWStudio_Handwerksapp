import { API_URL } from '@/config'

export interface Customer {
  id: string | number
  name: string
  email?: string
  phone?: string

  // Normale Adresse
  street?: string
  zip?: string
  city?: string

  // Abweichende Rechnungsadresse (optional)
  billingStreet?: string
  billingZip?: string
  billingCity?: string

  notes?: string
}

async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  // 204 No Content absichern
  // @ts-expect-error
  return r.status === 204 ? undefined : r.json()
}

export const listCustomers = () =>
  http<Customer[]>(`${API_URL}/customers`)

export const getCustomer = (id: string | number) =>
  http<Customer>(`${API_URL}/customers/${id}`)

export const createCustomer = (data: Partial<Customer>) =>
  http<Customer>(`${API_URL}/customers`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateCustomer = (id: string | number, data: Partial<Customer>) =>
  http<Customer>(`${API_URL}/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

export const deleteCustomer = (id: string | number) =>
  http<void>(`${API_URL}/customers/${id}`, { method: 'DELETE' })
