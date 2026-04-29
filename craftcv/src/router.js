import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './views/Dashboard.vue'
import Templates from './views/Templates.vue'
import Settings from './views/Settings.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/templates', component: Templates },
  { path: '/settings', component: Settings },
]

export default createRouter({ history: createWebHistory(), routes })