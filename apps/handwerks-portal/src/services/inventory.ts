import { apiGet, apiPost, apiPut, apiDelete } from '@/services/http'

export type Article = {
  id: string | number
  sku: string
  name: string
  stock: number
  minStock?: number
  unit?: string
  location?: string
  notes?: string
}

export async function listInventory(): Promise<Article[]> {
  // Echte API: muss ich noch erfragen dann Pfad hier ändern
  return apiGet<Article[]>('/inventory')
}

export async function getArticle(id: string|number): Promise<Article> {
  return apiGet<Article>(`/inventory/${id}`)
}

export async function createArticle(a: Partial<Article>): Promise<Article> {
  return apiPost<Article>('/inventory', a)
}

export async function updateArticle(id: string|number, a: Partial<Article>): Promise<Article> {
  return apiPut<Article>(`/inventory/${id}`, a)
}

export async function deleteArticle(id: string|number): Promise<void> {
  await apiDelete(`/inventory/${id}`)
}
