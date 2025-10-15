import { API_URL } from '@/config'

export type Role = 'disponent' | 'handwerker' | 'admin'
export type User = { id: number; username: string; role: Role }

export async function loginWithUsernamePassword(username: string, _password: string) {
  const r = await fetch(`${API_URL}/users?username=${encodeURIComponent(username)}`)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const users: User[] = await r.json()
  if (!users.length) throw new Error('Unbekannter Benutzer')
  // Passwort einfach ignoren
  return users[0]
}

