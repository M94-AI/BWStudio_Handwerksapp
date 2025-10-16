import { http } from '@/services/http'
import { API_URL } from '@/config'

export type OfferStatus = 'offen' | 'akzeptiert' | 'abgelehnt'

export interface Offer {
  id: string | number
  customerId: number
  title: string
  status: OfferStatus
  total?: number
  validUntil?: string // YYYY-MM-DD
}

export const listOffers = () => http<Offer[]>(`${API_URL}/offers`)
export const getOffer   = (id: string | number) => http<Offer>(`${API_URL}/offers/${id}`)
