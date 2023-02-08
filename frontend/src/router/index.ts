// Composables
import { createRouter, createWebHistory } from 'vue-router'
import SignIn from '../views/SignIn.vue'
// import Test2 from '../views/Test2.vue'
import Home from '../views/Home.vue'
import AppStat from '../views/AppStat.vue'
import Retention from '../views/Retention.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/layouts/CommonLayout.vue'),
    children: [
      { name: 'home', path: '/', component: () => import('@/views/Home.vue'), }
    ]
  },
  {
    path: '/signin',
    name: 'signin',
    component: SignIn,
  },
  {
    path: '/app-stat/:appId',
    component: () => import('@/layouts/CommonLayout.vue'),
    children: [
      { name: 'appStat', path: '/app-stat/:appId', component: AppStat }
    ]
  },
  {
    path: '/app-retention/:appId',
    component: () => import('@/layouts/CommonLayout.vue'),
    children: [
      { name: 'Retention', path: '/app-retention/:appId', component: Retention }
    ]
  },  
  // {
  //   path: '/test2',
  //   component: () => import('@/layouts/CommonLayout2.vue'),
  //   children: [
  //     { name: 'test2', path: '/test2', component: Test2 }
  //   ]
  // },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
