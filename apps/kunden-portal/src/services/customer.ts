import { API_URL } from '@/config';

export async function getCustomerById(id: string | number) {
  const r = await fetch(`${API_URL}/customers/${id}?_embed=orders`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
