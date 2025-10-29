// src/router/index.js
import Vue from 'vue'
import Router from 'vue-router'
import MapPage from '../views/MapPage.vue'
import Dashboard from '../views/Dashboard.vue'
import HourlyStatistics from '../views/HourlyStatistics.vue'
import DataVisualizationDashboard from '../views/DataVisualizationDashboard.vue'
import PatientListPage from '../views/PatientListPage.vue'
import MapDataAnimation from '../components/MapDataAnimation.vue'

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
    path: '/bigscreen',
    name: 'BigScreenDashboard',
    component: DataVisualizationDashboard
  },
  {
    path: '/hourly',
    name: 'HourlyStatistics',
    component: HourlyStatistics
  },
  {
    path: '/data-visualization',
    name: 'DataVisualizationDashboard',
    component: DataVisualizationDashboard
  },
  {
    path: '/patient-list',
    name: 'PatientListPage',
    component: PatientListPage
  },
  {
    path: '/monthly-heatmap',
    name: 'MapDataAnimation',
    component: MapDataAnimation
  }
]

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
