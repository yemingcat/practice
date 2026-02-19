import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/lab' },
  { path: '/lab', name: 'LabInbox', component: () => import('../pages/LabInbox.vue') },
  { path: '/match', name: 'MatchDialog', component: () => import('../pages/MatchDialog.vue') },
  { path: '/fill', name: 'FillForm', component: () => import('../pages/FillForm.vue') },
  { path: '/unit', name: 'UnitInbox', component: () => import('../pages/UnitInbox.vue') },
  { path: '/review', name: 'ReviewUnit', component: () => import('../pages/ReviewUnit.vue') },
  { path: '/reports', name: 'Reports', component: () => import('../pages/Reports.vue') },
  { path: '/supplement', name: 'Supplement', component: () => import('../pages/Supplement.vue') }
]
export default createRouter({ history: createWebHistory(), routes })
