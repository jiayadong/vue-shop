import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import TreeTable from 'vue-table-with-tree-grid'
import axios from 'axios'
// 导入阿里图标
Vue.config.productionTip = false
axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1'
// 挂载到vue的原型，这样就可以全局使用
axios.interceptors.request.use(config => {
  // 为请求头对象，添加token 验证的Authorization字段
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最后必须return config
  return config
})

Vue.component('tree-table', TreeTable)
Vue.prototype.$http = axios
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
// axios。。。配置根路径
