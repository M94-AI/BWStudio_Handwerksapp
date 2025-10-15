import { API_URL } from '@/config'
export type Invoice = { id:number|string; customerId:number|string; title:string; status:string; total:number; dueDate?:string }

export async function listInvoices(): Promise<Invoice[]> {
  const r = await fetch(`${API_URL}/invoices`)
  return r.json()
}
