import { apiGet } from './http'

export type OfferStatus = 'offen' | 'akzeptiert' | 'abgelehnt'
export interface Offer {
  id: string | number
  customerId: number
  title: string
  status: OfferStatus
  total?: number
  validUntil?: string // YYYY-MM-DD
}

export const listOffers = () => apiGet<Offer[]>('/offers')
export const getOffer   = (id: string | number) => apiGet<Offer>(`/offers/${id}`)
