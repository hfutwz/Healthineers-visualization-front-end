// src/router/index.js
import Vue from 'vue'
import Router from 'vue-router'
import MapPage from '../views/MapPage.vue'

Vue.use(Router)

const routes = [
  {
    path: '/',
    name: 'MapPage',
    component: MapPage
  }
]

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
