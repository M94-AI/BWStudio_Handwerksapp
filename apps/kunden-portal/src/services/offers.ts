// services/offers.ts
import http from './http'
import { API_URL } from '@/config'
export type OfferStatus = 'offen'|'akzeptiert'|'abgelehnt'
export interface Offer { id: string|number; orderId: string|number; customerId: number; title: string; status: OfferStatus; total?: number; validUntil?: string }
export const listOffersByCustomer = (customerId: string|number) => http<Offer[]>(`${API_URL}/offers?customerId=${customerId}`)
