import Vue from 'vue'
import Router from 'vue-router'
import SignIn from './views/SignIn.vue'
import Home from './views/Home.vue'
import AppStat from './views/AppStat.vue'
import Retention from './views/Retention.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: () => import('./layouts/CommonLayout.vue'),
      children: [
        { name: 'home', path: '/', component: Home }
      ]
    },
    {
      path: '/signin',
      name: 'signin',
      component: SignIn
    },
    {
      path: '/app-stat/:appId',
      component: () => import('./layouts/CommonLayout.vue'),
      children: [
        { name: 'appStat', path: '/app-stat/:appId', component: AppStat }
      ]
    },
    {
      path: '/app-retention/:appId',
      component: () => import('./layouts/CommonLayout.vue'),
      children: [
        { name: 'Retention', path: '/app-retention/:appId', component: Retention }
      ]
    },
  ]
})
