// src/router/index.js
import Vue from 'vue'
import Router from 'vue-router'
import MapPage from '../views/MapPage.vue'
import Dashboard from '../views/Dashboard.vue'
import HourlyStatistics from '../views/HourlyStatistics.vue'

Vue.use(Router)

const routes = [
  {
    path: '/',
    name: 'MapPage',
    component: MapPage
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/hourly',
    name: 'HourlyStatistics',
    component: HourlyStatistics
  }
]

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
