import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import 'basiccontext/dist/basicContext.min.css'
import 'basiccontext/dist/themes/dark.min.css'

import VueClipBoard from 'vue-clipboard2'

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(VueClipBoard)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
