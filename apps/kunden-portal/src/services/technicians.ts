// services/technicians.ts
import http from './http'
import { API_URL } from '@/config'
export interface Technician { id: number|string; name: string; phone?: string; email?: string }
export const getTechnician = (id: string|number) => http<Technician>(`${API_URL}/technicians/${id}`)
