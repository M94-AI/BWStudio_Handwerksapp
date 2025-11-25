export interface CalendarEventInput {
  title: string
  start: string // ISO-String: '2025-11-24T10:00:00'
  end?: string
  relatedOrderId?: number | string
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

export async function createCalendarEvent(input: CalendarEventInput) {
  const res = await fetch(`${API_BASE}/calendar/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    throw new Error(`Fehler beim Erstellen des Termins (HTTP ${res.status})`)
  }

  return await res.json()
}
