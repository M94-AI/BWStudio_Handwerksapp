// apps/handwerks-portal/src/services/events.ts
import { apiGet } from './http'

export type CalendarEvent = {
  id: string | number
  title: string
  when: string                // ISO: "2025-10-20T09:00:00+02:00"
  orderId?: string | number
  technicianId?: string | number
  customerId?: string | number
  location?: string
}

export const listEvents = () =>
  apiGet('/events') as Promise<CalendarEvent[]>

export async function listEventsToday(): Promise<CalendarEvent[]> {
  const all = await listEvents()
  const today = new Date().toISOString().slice(0, 10)
  return all
    .filter(e => (e.when ?? '').slice(0, 10) === today)
    .sort((a, b) => (a.when ?? '').localeCompare(b.when ?? ''))
}

// NEU: Events für die nächsten N Tage (inkl. heute)
export async function listEventsNextDays(days = 7): Promise<CalendarEvent[]> {
  const all = await listEvents()

  const start = new Date()
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())

  const endDay = new Date(startDay)
  endDay.setDate(endDay.getDate() + days + 1) // exklusiv

  return all
    .map(e => ({ e, d: new Date(e.when) }))
    .filter(({ d }) => !isNaN(d.getTime()))
    .filter(({ d }) => d >= startDay && d < endDay)
    .sort((a, b) => a.d.getTime() - b.d.getTime())
    .map(({ e }) => e)
}
