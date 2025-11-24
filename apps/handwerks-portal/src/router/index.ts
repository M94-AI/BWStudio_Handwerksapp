import { createRouter, createWebHistory } from 'vue-router'




const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/components/layout/AppShell.vue'),
      children: [
        { path: '', redirect: '/dashboard' },


        // Dashbioard
        { path: 'dashboard', name: 'dashboard', component: () => import('@/features/dashboard/DashboardView.vue') },

        //   ---- Aufträge----
        { path: 'auftraege', name: 'orders-list', component: () => import('@/features/auftraege/OrdersListView.vue') },
        { path: 'auftraege/neu', name: 'orders-new', component: () => import('@/features/auftraege/OrderFormView.vue') },
        { path: 'auftraege/:id', name: 'orders-detail', component: () => import('@/features/auftraege/OrderDetailView.vue') },
        { path: 'auftraege/:id/bearbeiten', name: 'orders-edit', component: () => import('@/features/auftraege/OrderFormView.vue') },
        

        //    ----Angebote----
        { path: 'angebote', name: 'offers-list', component: () => import('@/features/angebote/OffersListView.vue') },

        //    ----Rechnungen----
        { path: 'rechnungen', name: 'invoices-list', component: () => import('@/features/rechnungen/InvoicesListView.vue') },
        { path: 'rechnungen/neu', name: 'invoices-new', component: () => import('@/features/rechnungen/InvoicesFormView.vue') },
        { path: 'rechnungen/:id', name: 'invoices-detail', component: () => import('@/features/rechnungen/InvoicesDetailView.vue') },

        //   ---- Lager----
        { path: 'lager', name: 'inventory-list', component: () => import('@/features/lager/InventoryListView.vue'),},
        { path: "/lager/neu", name: "inventory-new", component: () => import('@/features/lager/InventoryFormView.vue') },
        { path: "/lager/:id", name: "inventory-detail", component: () => import('@/features/lager/InventoryFormView.vue') },




        //    ----Termine----
        { path: 'termine', name: 'calendar', component: () => import('@/features/termine/CalendarView.vue') },

        // Kunden
        { path: 'kunden', name: 'customers-list', component: () => import('@/features/kunden/CustomerListView.vue') },
        { path: 'kunden/:id', name: 'customers-detail', component: () => import('@/features/kunden/CustomerDetailView.vue') },

      ],
    },
    { path: '/login', name: 'login', component: () => import('@/features/auth/LoginView.vue') },
  ],
})

export default router
