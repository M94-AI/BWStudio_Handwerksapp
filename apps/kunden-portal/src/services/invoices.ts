// services/invoices.ts
import http from './http'
import { API_URL } from '@/config'
export interface Invoice { id: string|number; orderId: string|number; customerId: number; title: string; status: 'offen'|'bezahlt'; total: number; dueDate?: string }
export const listInvoicesByCustomer = (customerId: string|number) => http<Invoice[]>(`${API_URL}/invoices?customerId=${customerId}`)
