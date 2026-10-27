import { createRouter, createWebHistory } from 'vue-router'
import { setSeo, seoForRoute } from './composables/seo.js'
import Dashboard from './views/Dashboard.vue'
import Templates from './views/Templates.vue'
// Loaded when first opened, so a first visit downloads less
const Editor   = () => import('./views/Editor.vue')
const Settings = () => import('./views/Settings.vue')
const Legal    = () => import('./views/Legal.vue')
const Pricing  = () => import('./views/Pricing.vue')
const InterviewPrep = () => import('./views/InterviewPrep.vue')

const routes = [
  { path: '/',               component: Dashboard, meta: { title: 'My CVs' } },
  { path: '/templates',      component: Templates, meta: { title: 'Templates' } },
  { path: '/editor',         component: Editor,    meta: { title: 'Editor', full: true } },
  { path: '/settings',       component: Settings,  meta: { title: 'Settings' } },
  { path: '/pricing',        component: Pricing,   meta: { title: 'Pricing' } },
  { path: '/interview',      component: InterviewPrep, meta: { title: 'Interview prep' } },
  { path: '/legal',          component: Legal,     meta: { title: 'Privacy & Terms' } },
  { path: '/builder',        redirect: '/editor'  },
  { path: '/privacy',        redirect: '/legal?tab=privacy' },
  { path: '/terms',          redirect: '/legal?tab=terms' },
  { path: '/reset-password', redirect: to => ({ path: '/', query: to.query }) },
  // Invite links (they open the phone app when it's installed): same as ?ref=CODE
  { path: '/invite/:code',   redirect: to => ({ path: '/', query: { ref: to.params.code } }) },
  { path: '/export-success', redirect: to => ({ path: '/', query: to.query }) },
  { path: '/download-clean', redirect: to => ({ path: '/', query: to.query }) },
  { path: '/:pathMatch(.*)*', redirect: '/'       },
]

const router = createRouter({ history: createWebHistory(), routes })
// Title, description and canonical URL for each page
router.afterEach((to) => setSeo(seoForRoute(to)))
export default router
