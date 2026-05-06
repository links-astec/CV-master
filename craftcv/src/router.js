import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './views/Dashboard.vue'
import Templates from './views/Templates.vue'
import Settings  from './views/Settings.vue'
import Legal     from './views/Legal.vue'

const routes = [
  { path: '/',               component: Dashboard },
  { path: '/templates',      component: Templates },
  { path: '/settings',       component: Settings  },
  { path: '/legal',          component: Legal     },
  { path: '/privacy',        redirect: '/legal'   },
  { path: '/terms',          redirect: '/legal'   },
  { path: '/export-success', redirect: to => ({ path: '/', query: to.query }) },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({ history: createWebHistory(), routes })