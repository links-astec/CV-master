<template>
  <!-- AUTH GATE -->
  <AuthModal v-if="!auth.loading && !auth.isLoggedIn" @done="onAuthDone" />
  <OnboardingModal v-else-if="auth.isLoggedIn && !auth.isOnboarded" @done="onboardDone" />

  <!-- APP SHELL -->
  <template v-else>
    <div class="app-shell">

      <!-- Mobile sidebar dimmer -->
      <div class="sidebar-dimmer" :class="{ active: mobileSidebarOpen }" @click="mobileSidebarOpen = false"></div>

      <!-- SIDEBAR -->
      <aside class="sidebar" :class="{ collapsed: !sidebarOpen, 'mobile-open': mobileSidebarOpen }">
        <div class="sidebar-inner">
          <div class="logo-area">
            <div class="logo-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="9" y1="12" x2="15" y2="12"/>
                <line x1="9" y1="16" x2="13" y2="16"/>
              </svg>
            </div>
            <div>
              <div class="logo-title">PerfectCV</div>
              <div class="logo-ver">AI Resume Builder</div>
            </div>
          </div>

          <nav>
            <div class="nav-section">Workspace</div>
            <button class="nav-btn" :class="{ active: currentView==='dashboard' }" @click="go('dashboard','/')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              Dashboard
            </button>
            <button class="nav-btn" :class="{ active: currentView==='templates' }" @click="go('templates','/templates')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>
              Templates
              <span class="nav-chip">16</span>
            </button>
            <button class="nav-btn" :class="{ active: currentView==='builder' }" @click="openBuilder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              CV Builder
            </button>

            <div class="nav-section" style="margin-top:8px;">Account</div>
            <button class="nav-btn" :class="{ active: currentView==='settings' }" @click="go('settings','/settings')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              Settings
            </button>
          </nav>

          <div class="sb-footer">
            <div class="user-row" @click="go('settings','/settings')">
              <div class="user-ava">{{ auth.user?.avatar || 'U' }}</div>
              <div style="flex:1;min-width:0;">
                <div class="user-name">{{ auth.user?.name }}</div>
                <div class="user-plan">{{ auth.user?.plan === 'free' ? 'Free Plan' : 'Pro' }}</div>
              </div>
              <svg style="width:13px;height:13px;color:var(--c-text3);flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </div>
      </aside>

      <!-- MAIN AREA -->
      <div class="main-area">
        <!-- TOPBAR -->
        <div class="topbar">
          <button class="sb-toggle" @click="toggleSidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>

          <div class="page-hd">
            <div class="page-title">{{ pageMeta.title }}</div>
            <div class="page-sub">{{ pageMeta.sub }}</div>
          </div>

          <div class="search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input type="text" placeholder="Search CVs..." v-model="searchQ" />
          </div>

          <NotificationDropdown />

          <button class="icon-btn" @click="store.darkMode = !store.darkMode" :title="store.darkMode ? 'Light mode' : 'Dark mode'">
            <svg v-if="store.darkMode" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
          </button>

          <button class="btn-primary accent" @click="store.openWizard()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span class="topbar-btn-label">New CV</span>
          </button>
        </div>

        <!-- CONTENT -->
        <div class="content-area" style="flex:1;overflow:hidden;display:flex;flex-direction:column;position:relative;">
          <RouterView v-if="currentView !== 'builder'" />

          <!-- BUILDER VIEW -->
          <div v-if="currentView === 'builder'" class="builder-wrap">
            <!-- LEFT PANEL -->
            <div class="builder-panel" :class="{ 'panel-collapsed': !panelOpen }">
              <div class="builder-panel-inner">
                <div class="ptabs">
                  <button v-for="t in pTabs" :key="t.id" class="ptab" :class="{ active: panelTab===t.id }" @click="panelTab=t.id">{{ t.label }}</button>
                </div>
                <div class="ptab-body" :class="{ active: panelTab==='edit' }">
                  <div class="f-sec">Personal</div>
                  <div class="f-row">
                    <div class="f-grp"><div class="f-lbl">First</div><input class="f-inp" v-model="store.data.fn" /></div>
                    <div class="f-grp"><div class="f-lbl">Last</div><input class="f-inp" v-model="store.data.ln" /></div>
                  </div>
                  <div class="f-grp"><div class="f-lbl">Title</div><input class="f-inp" v-model="store.data.title" /></div>
                  <div class="f-grp"><div class="f-lbl">Email</div><input class="f-inp" v-model="store.data.email" /></div>
                  <div class="f-grp"><div class="f-lbl">Phone</div><input class="f-inp" v-model="store.data.phone" /></div>
                  <div class="f-grp"><div class="f-lbl">Location</div><input class="f-inp" v-model="store.data.loc" /></div>
                  <div class="f-sec">Summary</div>
                  <div class="f-grp"><textarea class="f-ta" v-model="store.data.sum" rows="4"></textarea></div>
                  <button class="btn-ai" @click="store.openWizard()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2"/></svg>
                    Open AI Wizard
                  </button>
                </div>
                <div class="ptab-body" :class="{ active: panelTab==='skills' }">
                  <div class="f-sec">Skills</div>
                  <div style="display:flex;gap:7px;">
                    <input class="f-inp" v-model="newSkill" placeholder="Add skill, press Enter" @keydown.enter="addSkill" />
                    <button style="background:var(--c-accent);color:#fff;border:none;padding:0 14px;border-radius:var(--radius-sm);font-weight:700;font-size:18px;cursor:pointer;flex-shrink:0;" @click="addSkill">+</button>
                  </div>
                  <div class="skill-wrap">
                    <span v-for="s in store.data.skills" :key="s" class="skill-tag">
                      {{ s }}
                      <button class="skill-rm" @click="store.removeSkill(s)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </span>
                  </div>
                </div>
                <div class="ptab-body" :class="{ active: panelTab==='review' }">
                  <div class="score-wrap" style="padding-top:4px;">
                    <div class="score-hero">
                      <div class="score-ring">
                        <svg width="76" height="76" viewBox="0 0 76 76">
                          <circle cx="38" cy="38" r="30" fill="none" stroke="var(--c-border2)" stroke-width="5.5"/>
                          <circle cx="38" cy="38" r="30" fill="none" stroke="#2a5bd7" stroke-width="5.5" stroke-dasharray="188.5" stroke-dashoffset="35.8" stroke-linecap="round" transform="rotate(-90 38 38)"/>
                        </svg>
                        <div class="score-mid"><div class="score-n">81</div><div class="score-m">/100</div></div>
                      </div>
                      <div class="score-info">
                        <div class="score-ttl">Strong CV</div>
                        <div class="score-chips"><span class="sc sc-g">ATS Ready</span><span class="sc sc-a">Add Metrics</span></div>
                      </div>
                    </div>
                    <div class="sug-card warn">
                      <div class="sug-ttl">Add quantified metrics</div>
                      <div class="sug-txt">Numbers in bullets boost callback rate by 40%.</div>
                      <button class="fix-btn" @click="store.openWizard()">Fix in Wizard</button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="builder-panel-ft">
                <button class="btn-secondary" @click="store.openWizard()">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2"/></svg>
                  Wizard
                </button>
                <button class="btn-primary" @click="showPaywall=true">Export PDF</button>
              </div>
            </div>

            <!-- BUILDER PREVIEW -->
            <div class="builder-preview">
              <div class="preview-topbar">
                <div style="display:flex;align-items:center;gap:8px;">
                  <button class="ctrl-pill" @click="panelOpen=!panelOpen">
                    <svg style="width:12px;height:12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                    {{ panelOpen ? 'Hide' : 'Show' }}
                  </button>
                  <div class="live-pill">
                    <div class="live-dot"></div>
                    Live
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:5px;">
                  <button class="ctrl-pill" @click="zoom=Math.max(40,zoom-10)">−</button>
                  <span style="font-size:11px;font-weight:700;color:var(--c-text2);min-width:36px;text-align:center;">{{ zoom }}%</span>
                  <button class="ctrl-pill" @click="zoom=Math.min(130,zoom+10)">+</button>
                  <button class="ctrl-pill" @click="cycleTemplate">
                    <svg style="width:11px;height:11px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                    Template
                  </button>
                  <button class="ctrl-pill primary-btn" @click="showPaywall=true">
                    <svg style="width:11px;height:11px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export PDF
                  </button>
                </div>
              </div>
              <div class="builder-canvas">
                <div :style="{ transform:`scale(${zoom/100})`, transformOrigin:'top center', transition:'transform .2s' }">
                  <div v-html="renderedCV"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- WIZARD MODAL -->
    <WizardModal @open-builder="goBuilder" />

    <!-- PAYWALL MODAL -->
    <PaywallModal :show="showPaywall" @close="showPaywall=false" @paid="onPaid" />

    <!-- TOAST -->
    <div class="toast-wrap">
      <TransitionGroup name="toast">
        <div v-for="t in toasts" :key="t.id" class="toast">
          <svg style="width:13px;height:13px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          {{ t.msg }}
        </div>
      </TransitionGroup>
    </div>
  </template>
</template>

<script setup>
import { ref, computed, provide, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import { useCvStore } from './stores/cv.js'
import { useNotifStore } from './stores/notifications.js'
import { useCvRenderer } from './composables/cvRenderer.js'
import AuthModal from './components/auth/AuthModal.vue'
import OnboardingModal from './components/auth/OnboardingModal.vue'
import WizardModal from './components/WizardModal.vue'
import PaywallModal from './components/PaywallModal.vue'
import NotificationDropdown from './components/NotificationDropdown.vue'

const auth = useAuthStore()
const store = useCvStore()
const notifStore = useNotifStore()
const router = useRouter()
const { render } = useCvRenderer()

const sidebarOpen = ref(true)
const mobileSidebarOpen = ref(false)
const currentView = ref('dashboard')
const panelOpen = ref(true)
const panelTab = ref('edit')
const zoom = ref(75)
const newSkill = ref('')
const searchQ = ref('')
const showPaywall = ref(false)
const toasts = ref([])

const pTabs = [
  { id: 'edit',   label: 'Edit' },
  { id: 'skills', label: 'Skills' },
  { id: 'review', label: 'Score' },
]

const TEMPLATES = ['executive','modern','minimal','bold','creative','academic','elegant','tech','pastel','teal','newspaper','swiss','gradient','compact','photo','infographic']
const TEMPLATE_NAMES = { executive:'Executive Slate', modern:'Modern Azure', minimal:'Minimal Editorial', bold:'Bold Noir', creative:'Creative Violet', academic:'Academic', elegant:'Elegant Gold', tech:'Tech Dark', pastel:'Pastel Rose', teal:'Teal Sidebar', newspaper:'Newspaper', swiss:'Swiss Design', gradient:'Gradient Flow', compact:'Compact Grid', photo:'Photo Professional', infographic:'Infographic' }

const PAGE_META = {
  dashboard: { title: 'Dashboard',        sub: 'Your CVs at a glance' },
  templates:  { title: 'CV Templates',    sub: '16 professional designs' },
  builder:    { title: 'CV Builder',      sub: 'Edit and preview in real-time' },
  settings:   { title: 'Settings',        sub: 'Account, appearance & AI' },
}
const pageMeta = computed(() => PAGE_META[currentView.value] || { title: 'PerfectCV', sub: '' })
const renderedCV = computed(() => render(store.template, store.data))

function isMobile() { return window.innerWidth <= 768 }

function toggleSidebar() {
  if (isMobile()) { mobileSidebarOpen.value = !mobileSidebarOpen.value }
  else { sidebarOpen.value = !sidebarOpen.value }
}

function go(view, path) {
  currentView.value = view
  router.push(path)
  if (isMobile()) mobileSidebarOpen.value = false
}

function openBuilder() { currentView.value = 'builder'; store.openWizard() }
function goBuilder() { currentView.value = 'builder' }

function cycleTemplate() {
  const i = TEMPLATES.indexOf(store.template)
  store.template = TEMPLATES[(i + 1) % TEMPLATES.length]
  showToast(`Template: ${TEMPLATE_NAMES[store.template]}`)
}

function addSkill() {
  const v = newSkill.value.trim()
  if (v) { store.addSkill(v); newSkill.value = '' }
}

function showToast(msg, ms = 3500) {
  const id = Date.now()
  toasts.value.push({ id, msg })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, ms)
}
provide('showToast', showToast)

function onPaid() {
  showPaywall.value = false
  showToast('Export unlocked — PDF downloading...')
}

async function onAuthDone() {
  await notifStore.fetch()
}
function onboardDone() { /* stay on dashboard */ }

onMounted(async () => {
  store.initDarkMode()
  await auth.fetchMe()
  if (auth.isLoggedIn) await notifStore.fetch()
})
</script>

<style>
.topbar-btn-label { display: inline; }
@media (max-width: 480px) { .topbar-btn-label { display: none; } }
.skill-rm svg { width: 11px; height: 11px; }
</style>