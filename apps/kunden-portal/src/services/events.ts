// services/events.ts
import http from './http'
import { API_URL } from '@/config'
export interface CalendarEvent { id: string|number; customerId: number; orderId: string|number; technicianId?: number|string; when: string }
export const listEventsByCustomer = (customerId: string|number) => http<CalendarEvent[]>(`${API_URL}/events?customerId=${customerId}`)
