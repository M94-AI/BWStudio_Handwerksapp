import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
        {
          path: '/',
          component: () => import('@/components/layout/AppShell.vue'),
          children: [
            { path: '', redirect: '/dashboard' },

            { path: 'auftraege', name: 'orders-list', component: () => import('@/features/auftraege/OrdersListView.vue') },
            { path: 'auftraege/neu', name: 'orders-new', component: () => import('@/features/auftraege/OrderFormView.vue') },
            { path: 'auftraege/:id', name: 'orders-detail', component: () => import('@/features/auftraege/OrderDetailView.vue') },
            { path: 'rechnungen', component: () => import('@/features/rechnungen/InvoicesListView.vue') },
            { path: 'lager', component: () => import('@/features/lager/InventoryListView.vue') },
            { path: 'termine', component: () => import('@/features/termine/CalendarView.vue') },
            { path: 'kunden', component: () => import('@/features/kunden/CustomerListView.vue') },
            { path: 'kunden/:id(\\d+)', component: () => import('@/features/kunden/CustomerDetailView.vue') },
            { path: 'dashboard', component: () => import('@/features/dashboard/DashboardView.vue') },
          ],
        },
        { path: '/login', component: () => import('@/features/auth/LoginView.vue') },
  ],
})

export default router
