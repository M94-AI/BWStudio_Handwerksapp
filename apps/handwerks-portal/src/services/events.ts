import { apiGet } from './http'
export const listEvents = () => apiGet('/events') as Promise<CalendarEvent[]>


import { API_URL } from '@/config'
export type CalendarEvent = {
  id:number|string; title:string; when:string; orderId?:number|string;
  technicianId?:number|string; customerId?:number|string; location?:string
}

export async function listEventsToday(): Promise<CalendarEvent[]> {
  // Client-seitig filtern und sortieren (json-server kann nur rudimentär sortieren weil dumm)
  const r = await fetch(`${API_URL}/events`)
  const all = (await r.json()) as CalendarEvent[]
  const today = new Date().toISOString().slice(0,10)
  return all
    .filter(e => (e.when ?? '').slice(0,10) === today)
    .sort((a,b) => a.when.localeCompare(b.when))
}
