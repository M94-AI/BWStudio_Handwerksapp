import { API_URL } from '@/config';

export async function listCustomers() {
  const r = await fetch(`${API_URL}/customers`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export async function getCustomer(id: number | string, withOrders = true) {
  const url = withOrders
    ? `${API_URL}/customers/${id}?_embed=orders`
    : `${API_URL}/customers/${id}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
