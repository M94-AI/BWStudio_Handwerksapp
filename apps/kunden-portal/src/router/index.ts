import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('@/views/HomeView.vue') },

    { path: '/auftraege', component: () => import('@/features/orders/OrdersListView.vue') },
    { path: '/auftraege/:id', component: () => import('@/features/orders/OrdersDetailView.vue') },

    { path: '/angebote', component: () => import('@/features/offers/OffersListView.vue') },
    { path: '/angebote/:id', component: () => import('@/features/offers/OffersDetailView.vue') },

    { path: '/rechnungen', component: () => import('@/features/invoices/InvoicesListView.vue') },
    { path: '/rechnungen/:id', component: () => import('@/features/invoices/InvoicesDetailView.vue') },


    { path: '/termine', component: () => import('@/features/termins/TerminsView.vue') },

    { path: '/:pathMatch(.*)*', component: () => import('@/views/NotFound.vue') },
  ],
})

export default router
