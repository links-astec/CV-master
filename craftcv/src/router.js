import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './views/Dashboard.vue'
import Templates from './views/Templates.vue'
import Editor    from './views/Editor.vue'
import Settings  from './views/Settings.vue'
import Legal     from './views/Legal.vue'

const routes = [
  { path: '/',               component: Dashboard, meta: { title: 'My CVs' } },
  { path: '/templates',      component: Templates, meta: { title: 'Templates' } },
  { path: '/editor',         component: Editor,    meta: { title: 'Editor', full: true } },
  { path: '/settings',       component: Settings,  meta: { title: 'Settings' } },
  { path: '/legal',          component: Legal,     meta: { title: 'Privacy & Terms' } },
  { path: '/builder',        redirect: '/editor'  },
  { path: '/privacy',        redirect: '/legal?tab=privacy' },
  { path: '/terms',          redirect: '/legal?tab=terms' },
  { path: '/reset-password', redirect: to => ({ path: '/', query: to.query }) },
  { path: '/export-success', redirect: to => ({ path: '/', query: to.query }) },
  { path: '/download-clean', redirect: to => ({ path: '/', query: to.query }) },
  { path: '/:pathMatch(.*)*', redirect: '/'       },
]

export default createRouter({ history: createWebHistory(), routes })
