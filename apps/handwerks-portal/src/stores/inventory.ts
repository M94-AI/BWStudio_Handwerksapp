import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Article } from '@/services/inventory'
import {
  listInventory,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
} from '@/services/inventory'

const TTL_MS = 30_000

// Patch-Typ: niemals id patchen
type ArticlePatch = Partial<Omit<Article, 'id'>> & { id?: never }

// util: nur definierte Felder übernehmen
function applyPatchDefined<T extends object>(base: T, patch: Partial<T>): T {
  const out = { ...base } as any
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) out[k] = v
  }
  return out as T
}

export const useInventoryStore = defineStore('inventory', () => {
  // ----- State -----
  const items = ref<Article[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastLoaded = ref<number>(0)

  // ----- Business-Logik -----
  const byId = (id: string | number) =>
    computed(() => items.value.find(a => String(a.id) === String(id)))

  const isEmpty = (a: Article) => (a.stock ?? 0) <= 0
  const isLow = (a: Article) => {
    const min = a.minStock ?? 0
    const stock = a.stock ?? 0
    return stock > 0 && stock <= min
  }
  const statusOf = (a: Article): 'ok' | 'niedrig' | 'leer' =>
    isEmpty(a) ? 'leer' : isLow(a) ? 'niedrig' : 'ok'

  // ----- Getters -----
  const lowStockItems = computed(() => items.value.filter(isLow))
  const emptyItems    = computed(() => items.value.filter(isEmpty))
  const all           = computed(() =>
    items.value.slice().sort((a, b) => String(a.name).localeCompare(String(b.name)))
  )

  // ----- Local helper -----
  function upsertLocal(a: Article) {
    if (a == null || a.id == null) return
    const i = items.value.findIndex(x => String(x.id) === String(a.id))
    if (i >= 0) {
      // id niemals überschreiben
      const keepId = items.value[i].id
      items.value[i] = { ...items.value[i], ...a, id: keepId }
    } else {
      items.value.push(a)
    }
  }

  // ----- Actions -----
  async function fetchAll(opts: { force?: boolean } = {}) {
    const { force = false } = opts
    if (!force && items.value.length && Date.now() - lastLoaded.value < TTL_MS) return

    loading.value = true
    error.value = null
    try {
      const data = await listInventory()
      items.value = Array.isArray(data) ? data : []
      lastLoaded.value = Date.now()
    } catch (e: any) {
      error.value = e?.message ?? String(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: string | number) {
    loading.value = true
    error.value = null
    try {
      const a = await getArticle(id)
      upsertLocal(a)
      return a
    } catch (e: any) {
      error.value = e?.message ?? String(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createOne(data: Partial<Article>) {
    const created = await createArticle(data) // erwartet Article mit echter id
    upsertLocal(created)
    return created
  }

  async function updateOne(id: Article['id'], patch: ArticlePatch) {
    const idx = items.value.findIndex(x => String(x.id) === String(id))

    if (idx < 0) {
      // keine lokale Kopie → Server-Stand holen/setzen
      const saved = await updateArticle(id, patch)
      upsertLocal(saved)
      return saved
    }

    // Optimistic Update
    const base = items.value[idx]!
    const prev = structuredClone(base)

    const optimistic: Article = applyPatchDefined(base, patch) as Article
    optimistic.id = base.id // id niemals überschreiben
    items.value[idx] = optimistic

    try {
      const saved = await updateArticle(id, patch)
      upsertLocal(saved)
      return saved
    } catch (e) {
      items.value[idx] = prev // rollback
      throw e
    }
  }

  async function removeOne(id: string | number) {
    const prev = items.value.slice()
    items.value = prev.filter(x => String(x.id) !== String(id))
    try {
      await deleteArticle(id)
    } catch (e) {
      items.value = prev // rollback
      throw e
    }
  }

  async function setMinStock(id: string | number, minStock: number) {
    return updateOne(id, { minStock })
  }

  return {
    // state
    items, loading, error, lastLoaded,
    // helpers
    statusOf, isEmpty, isLow, byId,
    // getters
    all, lowStockItems, emptyItems,
    // actions
    fetchAll, fetchOne, createOne, updateOne, removeOne, setMinStock,
  }
})
