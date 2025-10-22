// services/orders.ts
import http from './http'
import { API_URL } from '@/config'
export interface Order { id: string|number; customerId: number; title: string; status: 'offen'|'in Arbeit'|'erledigt'; due?: string; notes?: string }
export const listOrdersByCustomer = (customerId: string|number) => http<Order[]>(`${API_URL}/orders?customerId=${customerId}`)
