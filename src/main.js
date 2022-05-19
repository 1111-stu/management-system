import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//导入全局的样式表文件
import './assets/css/global.css'
//导入图标库文件夹
import './assets/fonts/iconfont.css'

import axios from 'axios'
axios.defaults.baseURL = 'http://www.tangxiaoyang.vip:8888/api/v2/'
//拦截所有的请求，为请求头添加token认证。
axios.interceptors.request.use(config => {
  // console.log(config)
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
  config.headers.Authorization = userInfo? userInfo.token:''
  return config
})

Vue.prototype.$http = axios

// 全局注册第三方表格组件
import ZkTable from 'vue-table-with-tree-grid'
Vue.component('tree-table', ZkTable)

// 工具库
import utils from './libs/utils'
Vue.prototype.$utils = utils

//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
Vue.use(VueQuillEditor)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
