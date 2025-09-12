// src/main.js
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);
axios.defaults.baseURL = 'http://localhost:8080';
Vue.prototype.$axios = axios; // 这样$axios在所有组件中都可用
// Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
