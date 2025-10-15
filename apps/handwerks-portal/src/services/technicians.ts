import { API_URL } from '@/config'
export type Technician = { id:number|string; name:string; short?:string }
export const listTechnicians = () =>
  fetch(`${API_URL}/technicians`).then(r=>r.json()) as Promise<Technician[]>
