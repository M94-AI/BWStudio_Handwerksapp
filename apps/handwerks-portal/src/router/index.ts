import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/components/layout/AppShell.vue'),
      children: [
        { path: '', redirect: '/dashboard' },

        { path: 'dashboard', name: 'dashboard', component: () => import('@/features/dashboard/DashboardView.vue') },

        // Aufträge
        { path: 'auftraege', name: 'orders-list', component: () => import('@/features/auftraege/OrdersListView.vue') },
        { path: 'auftraege/neu', name: 'orders-new', component: () => import('@/features/auftraege/OrderFormView.vue') },
        { path: 'auftraege/:id', name: 'orders-detail', component: () => import('@/features/auftraege/OrderDetailView.vue') },

        // Angebote / Rechnungen / Lager / Termine
        { path: 'angebote', name: 'offers-list', component: () => import('@/features/angebote/OffersListView.vue') },
        { path: 'rechnungen', name: 'invoices-list', component: () => import('@/features/rechnungen/InvoicesListView.vue') },
        { path: 'lager', name: 'inventory-list', component: () => import('@/features/lager/InventoryListView.vue'),},
        { path: 'termine', name: 'calendar', component: () => import('@/features/termine/CalendarView.vue') },

        // Kunden (wichtig: /kunden VOR /kunden/:id und OHNE Regex)
        { path: 'kunden', name: 'customers-list', component: () => import('@/features/kunden/CustomerListView.vue') },
        { path: 'kunden/:id', name: 'customers-detail', component: () => import('@/features/kunden/CustomerDetailView.vue') },

      ],
    },
    { path: '/login', name: 'login', component: () => import('@/features/auth/LoginView.vue') },
  ],
})

export default router
