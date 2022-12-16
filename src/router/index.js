import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'JSONPath',
    component: () => import('@/views/JSONPath/index.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
