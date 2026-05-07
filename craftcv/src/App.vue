<template>
  <AuthModal v-if="!auth.loading && !auth.isLoggedIn" @done="onAuthDone" />
  <OnboardingModal v-else-if="auth.isLoggedIn && !auth.isOnboarded" @done="onboardDone" />

  <template v-else>
    <div class="app-shell" :class="{ 'dark': store.darkMode }">

      <!-- Mobile sidebar dimmer -->
      <div class="sidebar-dimmer" :class="{ active: mobileSidebarOpen }" @click="mobileSidebarOpen=false"></div>

      <!-- SIDEBAR (desktop) -->
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
              <span class="nav-chip">107</span>
            </button>
            <button class="nav-btn" :class="{ active: currentView==='builder' }" @click="goBuilderView">
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
            <div class="legal-links">
              <a @click.prevent="go('legal','/legal')" href="/legal">Privacy</a>
              <span>·</span>
              <a @click.prevent="go('legal','/legal')" href="/legal">Terms</a>
            </div>
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
          <div class="topbar-right">
            <NotificationDropdown />
            <button class="icon-btn" @click="store.darkMode = !store.darkMode" :title="store.darkMode ? 'Light mode' : 'Dark mode'">
              <svg v-if="store.darkMode" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            </button>
            <button class="btn-primary accent" @click="newCV()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span class="topbar-btn-label">New CV</span>
            </button>
          </div>
        </div>

        <!-- CONTENT AREA -->
        <div class="content-area" :class="{ 'hidden-view': currentView === 'builder' }">
          <RouterView />
        </div>

        <!-- BUILDER VIEW (separate, not inside content-area) -->
        <div v-if="currentView === 'builder'" class="content-area">
          <div class="builder-wrap">
            <div class="builder-panel" :class="{ 'panel-collapsed': !panelOpen }">
              <div class="builder-panel-inner">
                <div class="ptabs">
                  <button v-for="t in pTabs" :key="t.id" class="ptab" :class="{ active: panelTab===t.id }" @click="panelTab=t.id">{{ t.label }}</button>
                </div>

                <!-- EDIT tab -->
                <div class="ptab-body" :class="{ active: panelTab==='edit' }">
                  <div class="f-sec">Personal</div>
                  <div class="f-row">
                    <div class="f-grp"><div class="f-lbl">First</div><input class="f-inp" v-model="store.data.fn" placeholder="First name"/></div>
                    <div class="f-grp"><div class="f-lbl">Last</div><input class="f-inp" v-model="store.data.ln" placeholder="Last name"/></div>
                  </div>
                  <div class="f-grp"><div class="f-lbl">Title</div><input class="f-inp" v-model="store.data.title" placeholder="Job title"/></div>
                  <div class="f-grp"><div class="f-lbl">Email</div><input class="f-inp" v-model="store.data.email" placeholder="your@email.com"/></div>
                  <div class="f-grp"><div class="f-lbl">Phone</div><input class="f-inp" v-model="store.data.phone" placeholder="+44 7700 000000"/></div>
                  <div class="f-grp"><div class="f-lbl">Location</div><input class="f-inp" v-model="store.data.loc" placeholder="London, UK"/></div>
                  <div class="f-sec">Summary</div>
                  <div class="f-grp"><textarea class="f-ta" v-model="store.data.sum" rows="4" placeholder="Professional summary..."></textarea></div>
                  <button class="btn-ai" @click="store.openWizard()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2"/></svg>
                    Open Full Wizard
                  </button>
                </div>

                <!-- SKILLS tab -->
                <div class="ptab-body" :class="{ active: panelTab==='skills' }">
                  <div class="f-sec">Skills</div>
                  <div style="display:flex;gap:7px;">
                    <input class="f-inp" v-model="newSkill" placeholder="Add skill…" @keydown.enter="addSkill"/>
                    <button style="background:var(--c-accent);color:#fff;border:none;padding:0 14px;border-radius:var(--radius-sm);font-weight:700;font-size:18px;cursor:pointer;flex-shrink:0;" @click="addSkill">+</button>
                  </div>
                  <div class="skill-wrap">
                    <span v-for="s in store.data.skills" :key="s" class="skill-tag">
                      {{ s }}
                      <button class="skill-rm" @click="store.removeSkill(s)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:11px;height:11px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                    </span>
                  </div>
                </div>

                <!-- SCORE tab -->
                <div class="ptab-body" :class="{ active: panelTab==='review' }">
                  <div class="score-wrap" style="padding-top:4px;">
                    <div class="score-hero">
                      <div class="score-ring">
                        <svg width="76" height="76" viewBox="0 0 76 76">
                          <circle cx="38" cy="38" r="30" fill="none" stroke="var(--c-border2)" stroke-width="5.5"/>
                          <circle cx="38" cy="38" r="30" fill="none" stroke="var(--c-accent)" stroke-width="5.5" stroke-dasharray="188.5" stroke-dashoffset="35.8" stroke-linecap="round" transform="rotate(-90 38 38)"/>
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
                <button class="btn-primary accent" @click="showPaywall=true">Export PDF</button>
              </div>
            </div>

            <!-- PREVIEW AREA -->
            <div class="builder-preview">
              <div class="preview-topbar">
                <div class="preview-topbar-left">
                  <!-- Desktop: hide/show panel -->
                  <button class="ctrl-pill hide-mobile" @click="panelOpen=!panelOpen">
                    <svg style="width:12px;height:12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                    {{ panelOpen ? 'Hide panel' : 'Show panel' }}
                  </button>
                  <!-- Mobile: edit button -->
                  <button class="ctrl-pill show-mobile" @click="showMobileEdit=true">
                    <svg style="width:12px;height:12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                  <div class="live-pill">
                    <div class="live-dot"></div>
                    Live
                  </div>
                </div>
                <div class="preview-topbar-right">
                  <button class="ctrl-pill hide-mobile" @click="zoom=Math.max(35,zoom-10)">−</button>
                  <span class="zoom-lbl hide-mobile">{{ zoom }}%</span>
                  <button class="ctrl-pill hide-mobile" @click="zoom=Math.min(130,zoom+10)">+</button>
                  <button class="ctrl-pill" @click="cycleTemplate">
                    <svg style="width:11px;height:11px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                    <span class="hide-mobile">Template</span>
                  </button>
                  <button class="ctrl-pill export-pill" @click="showPaywall=true">
                    <svg style="width:11px;height:11px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export PDF
                  </button>
                </div>
              </div>

              <!-- CV Preview canvas -->
              <div class="builder-canvas" ref="canvasRef">
                <div class="cv-outer" :style="cvOuterStyle">
                  <div class="cv-scaler" :style="cvScalerStyle">
                    <div class="cv-page-shadow">
                      <div v-html="renderedCV"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mobile bottom export bar -->
              <div class="mobile-export-bar show-mobile">
                <button class="mobile-export-btn" @click="showPaywall=true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export PDF — £4.99
                </button>
              </div>
            </div>
          </div><!-- end builder-wrap -->
        </div><!-- end content-area for builder -->

        <!-- BOTTOM NAV (mobile only) -->
        <nav class="bottom-nav show-mobile">
          <button class="bnav-btn" :class="{ active: currentView==='dashboard' }" @click="go('dashboard','/')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            Home
          </button>
          <button class="bnav-btn" :class="{ active: currentView==='templates' }" @click="go('templates','/templates')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Templates
          </button>
          <button class="bnav-fab" @click="newCV()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button class="bnav-btn" :class="{ active: currentView==='builder' }" @click="goBuilderView">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Builder
          </button>
          <button class="bnav-btn" :class="{ active: currentView==='settings' }" @click="go('settings','/settings')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            Settings
          </button>
        </nav>
      </div>
    </div>

    <!-- MOBILE EDIT DRAWER -->
    <Teleport to="body">
      <Transition name="drawer-fade">
        <div v-if="showMobileEdit" class="mobile-edit-backdrop" @click.self="showMobileEdit=false">
          <div class="mobile-edit-drawer">
            <div class="drawer-handle"></div>
            <div class="drawer-hd">
              <div class="drawer-title">Edit CV</div>
              <button class="drawer-close" @click="showMobileEdit=false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="drawer-body">
              <div class="ptabs">
                <button v-for="t in pTabs" :key="t.id" class="ptab" :class="{ active: panelTab===t.id }" @click="panelTab=t.id">{{ t.label }}</button>
              </div>
              <div v-if="panelTab==='edit'">
                <div class="f-sec">Personal</div>
                <div class="f-row">
                  <div class="f-grp"><div class="f-lbl">First</div><input class="f-inp" v-model="store.data.fn" placeholder="First name"/></div>
                  <div class="f-grp"><div class="f-lbl">Last</div><input class="f-inp" v-model="store.data.ln" placeholder="Last name"/></div>
                </div>
                <div class="f-grp"><div class="f-lbl">Title</div><input class="f-inp" v-model="store.data.title" placeholder="Job title"/></div>
                <div class="f-grp"><div class="f-lbl">Email</div><input class="f-inp" v-model="store.data.email" type="email"/></div>
                <div class="f-grp"><div class="f-lbl">Phone</div><input class="f-inp" v-model="store.data.phone" type="tel"/></div>
                <div class="f-grp"><div class="f-lbl">Location</div><input class="f-inp" v-model="store.data.loc"/></div>
                <div class="f-sec">Summary</div>
                <div class="f-grp"><textarea class="f-ta" v-model="store.data.sum" rows="4"></textarea></div>
              </div>
              <div v-if="panelTab==='skills'">
                <div class="f-sec">Skills</div>
                <div style="display:flex;gap:7px;">
                  <input class="f-inp" v-model="newSkill" placeholder="Add skill…" @keydown.enter="addSkill"/>
                  <button style="background:var(--c-accent);color:#fff;border:none;padding:0 14px;border-radius:var(--radius-sm);font-weight:700;font-size:18px;cursor:pointer;flex-shrink:0;" @click="addSkill">+</button>
                </div>
                <div class="skill-wrap">
                  <span v-for="s in store.data.skills" :key="s" class="skill-tag">
                    {{ s }}<button class="skill-rm" @click="store.removeSkill(s)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:11px;height:11px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                  </span>
                </div>
              </div>
              <div style="margin-top:16px;display:flex;gap:8px;">
                <button class="btn-secondary" style="flex:1;" @click="store.openWizard(); showMobileEdit=false">Full Wizard</button>
                <button class="btn-primary accent" style="flex:1;" @click="showMobileEdit=false">Done</button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <WizardModal @open-builder="goBuilder" />
    <PaywallModal ref="paywallRef" :show="showPaywall" @close="showPaywall=false" @paid="onPaid" />

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
import { ref, computed, provide, onMounted, nextTick, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import { useCvStore } from './stores/cv.js'
import { useNotifStore } from './stores/notifications.js'
import { useCvRenderer } from './composables/cvRenderer.js'
import AuthModal from './components/auth/AuthModal.vue'
import OnboardingModal from './components/auth/OnboardingModal.vue'
import WizardModal from './components/WizardModal.vue'
import PaywallModal from './components/PaywallModal.vue'
import NotificationDropdown from './components/NotificationDropdown.vue'

const auth       = useAuthStore()
const store      = useCvStore()
const notifStore = useNotifStore()
const router     = useRouter()
const route      = useRoute()
const { render } = useCvRenderer()

const sidebarOpen      = ref(true)
const mobileSidebarOpen= ref(false)
const currentView      = ref('dashboard')
const panelOpen        = ref(true)
const panelTab         = ref('edit')
const zoom             = ref(75)
const newSkill         = ref('')
const showPaywall      = ref(false)
const paywallRef       = ref(null)
const toasts           = ref([])
const canvasRef        = ref(null)
const showMobileEdit   = ref(false)
const canvasWidth      = ref(0)

const pTabs = [
  { id: 'edit',   label: 'Edit' },
  { id: 'skills', label: 'Skills' },
  { id: 'review', label: 'Score' },
]

const TEMPLATES = ['executive','modern','minimal','bold','creative','academic','elegant','tech','pastel','teal','newspaper','swiss','gradient','compact','photo','infographic','corporate','magazine','midnight','clean','slate','terra','prism','ivory','split','forest','ruby','ocean','purple','charcoal','sunrise','silver','mint','indigo','amber','diamond','bloom','nordic','sakura','emerald','cobalt','lemon','graphite','vega','rose','onyx','aurora','carbon','sky','obsidian','slate2','crimson','sage','dusk','slate3','copper2','neon','blush','sand','phantom','electric','luxe','mono','wave','tealwave','navy','violet2','midnight2','glacier','lava','verdant','parchment','matrix','retro','prism2','zinc','coral','tan','slate4','clay','frost','steel','mauve','brick','peach','plum','spruce','pine','ochre','ash','jade','wine','ultraviolet','blueprint','meadow','glacier2','garnet','topaz','walnut','ivory2','slate5','crimson2','sepia','lavender','ink','moss','futura']
const TEMPLATE_NAMES = { executive:'Executive Slate', modern:'Modern Azure', minimal:'Minimal Editorial', bold:'Bold Noir', creative:'Creative Violet', academic:'Academic', elegant:'Elegant Gold', tech:'Tech Dark', pastel:'Pastel Rose', teal:'Teal Sidebar', newspaper:'Newspaper', swiss:'Swiss Design', gradient:'Gradient Flow', compact:'Compact Grid', photo:'Photo Professional', infographic:'Infographic', corporate:'Corporate Blue', magazine:'Magazine Editorial', midnight:'Midnight Executive', clean:'Clean Professional', slate:'Slate Impact', terra:'Terra', prism:'Prism', ivory:'Ivory Luxury', split:'Bold Split', forest:'Forest Green', ruby:'Ruby Red', ocean:'Ocean Blue', purple:'Purple Reign', charcoal:'Charcoal Grid', sunrise:'Sunrise Orange', silver:'Silver Lining', mint:'Mint Fresh', indigo:'Indigo Wave', amber:'Dark Amber', diamond:'Diamond', bloom:'Pink Bloom', nordic:'Nordic', sakura:'Sakura', emerald:'Emerald', cobalt:'Cobalt Night', lemon:'Lemon Fresh', graphite:'Graphite', vega:'Vega', rose:'Rose Gold', onyx:'Onyx', aurora:'Aurora', carbon:'Carbon', sky:'Sky Blue', obsidian:'Obsidian', slate2:'Slate Pro', crimson:'Crimson', sage:'Sage Green', dusk:'Dusk', slate3:'Slate III', copper2:'Copper II', neon:'Neon Green', blush:'Blush', sand:'Sand', phantom:'Phantom', electric:'Electric', luxe:'Luxe Gold', mono:'Monospace', wave:'Wave', tealwave:'Teal Wave', navy:'Navy Pro', violet2:'Violet', midnight2:'Midnight II', glacier:'Glacier', lava:'Lava', verdant:'Verdant', parchment:'Parchment', matrix:'Matrix', retro:'Retro Gold', prism2:'Prism II', zinc:'Zinc', coral:'Coral', tan:'Tan', slate4:'Slate IV', clay:'Clay Amber', frost:'Frost', steel:'Steel', mauve:'Mauve', brick:'Brick Red', peach:'Peach', plum:'Plum Dark', spruce:'Spruce', pine:'Pine', ochre:'Ochre', ash:'Ash', jade:'Jade', wine:'Wine', ultraviolet:'Ultraviolet', blueprint:'Blueprint', meadow:'Meadow', glacier2:'Glacier II', garnet:'Garnet', topaz:'Topaz', walnut:'Walnut', ivory2:'Ivory II', slate5:'Slate V', crimson2:'Crimson II', sepia:'Sepia', lavender:'Lavender', ink:'Ink', moss:'Moss', futura:'Futura' }

const PAGE_META = {
  dashboard: { title: 'Dashboard',     sub: 'Your CVs at a glance' },
  templates:  { title: 'Templates',    sub: '107 professional designs' },
  builder:    { title: 'CV Builder',   sub: 'Edit and preview live' },
  settings:   { title: 'Settings',     sub: 'Account & preferences' },
}
const pageMeta   = computed(() => PAGE_META[currentView.value] || { title: 'PerfectCV', sub: '' })
// Deep-reactive CV render — JSON.stringify forces Vue to track ALL nested fields
// so any change anywhere in store.data or template triggers a re-render
const renderedCV = computed(() => {
  // Touch every field deeply so Vue tracks them all
  JSON.stringify(store.data)
  return render(store.template, store.data)
})

// Auto-scale CV to fit canvas — on mobile fill width, on desktop use zoom
const isMobileView = computed(() => canvasWidth.value > 0 && canvasWidth.value < 780)

const cvScale = computed(() => {
  if (isMobileView.value && canvasWidth.value > 0) {
    return (canvasWidth.value - 16) / 700
  }
  return zoom.value / 100
})

const cvOuterStyle = computed(() => {
  // Both mobile and desktop: flex container that centres the zoom-scaled CV
  return {
    width: '100%',
    display: 'flex',
    justifyContent: isMobileView.value ? 'flex-start' : 'center',
    padding: isMobileView.value ? '8px' : '24px',
    boxSizing: 'border-box',
  }
})

const cvScalerStyle = computed(() => {
  const s = cvScale.value
  // Use CSS zoom for both mobile and desktop — shrinks layout AND visual, no clipping
  return {
    width: '700px',
    zoom: `${s}`,
    flexShrink: '0',
  }
})

let ro
function measureCanvas() {
  if (canvasRef.value) canvasWidth.value = canvasRef.value.clientWidth
}

function isMobile() { return window.innerWidth <= 768 }

function toggleSidebar() {
  if (isMobile()) mobileSidebarOpen.value = !mobileSidebarOpen.value
  else sidebarOpen.value = !sidebarOpen.value
}

function go(view, path) {
  currentView.value = view
  if (route.path !== path) router.push(path)
  if (isMobile()) mobileSidebarOpen.value = false
}
function goLegal() { go('legal', '/legal') }

function goBuilderView() { currentView.value = 'builder' }
function newCV()         { store.resetData(); store.openWizard() }
function goBuilder()     { currentView.value = 'builder' }

function cycleTemplate() {
  const i = TEMPLATES.indexOf(store.template)
  store.template = TEMPLATES[(i + 1) % TEMPLATES.length]
  showToast(`Template: ${TEMPLATE_NAMES[store.template] || store.template}`)
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
  showToast('CV sent to your email!')
}

async function onAuthDone() {
  await notifStore.fetch()
  handleStripeReturn()
}
function onboardDone() {}

function handleStripeReturn() {
  const params     = new URLSearchParams(window.location.search)
  const sessionId  = params.get('session') || params.get('session_id')
  const draftId    = params.get('draft') || 'current'
  const hasPending = sessionStorage.getItem('pcv_pending_download')

  if (sessionId && hasPending) {
    sessionStorage.removeItem('pcv_pending_download')
    // Clear URL AFTER saving the params
    window.history.replaceState({}, '', '/')
    currentView.value  = 'dashboard'
    showPaywall.value  = true
    nextTick(() => paywallRef.value?.handleStripeReturn(sessionId, draftId))
  }
}

onMounted(async () => {
  store.initDarkMode()
  await auth.fetchMe()
  if (auth.isLoggedIn) {
    await notifStore.fetch()
    handleStripeReturn()
    // Restore most recent draft from DB — DB is source of truth over localStorage
    restoreLatestDraft()
  }
  // Set currentView from current URL path
  const path = window.location.pathname
  if (path === '/templates') currentView.value = 'templates'
  else if (path === '/settings') currentView.value = 'settings'
  else if (path === '/legal' || path === '/privacy' || path === '/terms') currentView.value = 'legal'
  else currentView.value = 'dashboard'
  nextTick(() => {
    ro = new ResizeObserver(measureCanvas)
    if (canvasRef.value) ro.observe(canvasRef.value)
    measureCanvas()
    window.addEventListener('resize', measureCanvas)
  })
})

async function restoreLatestDraft() {
  try {
    const r = await fetch('/api/drafts', { credentials: 'include' })
    if (!r.ok) return
    const drafts = await r.json()
    if (!drafts.length) return
    // Find the most recently updated draft
    const latest = drafts.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))[0]
    if (latest?.data) {
      Object.assign(store.data, latest.data)
      if (latest.template) store.template = latest.template
      store.currentDraftId = latest.id
      store.wizardDraftId  = latest.id
    }
  } catch {}
}
onUnmounted(() => {
  ro?.disconnect()
  window.removeEventListener('resize', measureCanvas)
})
</script>

<style>
/* Utility: show/hide on mobile */
.hide-mobile { display: flex; }
.show-mobile { display: none; }
@media (max-width: 768px) {
  .hide-mobile { display: none !important; }
  .show-mobile { display: flex !important; }
}

/* ── BOTTOM NAV ─────────────────────────────────────────────── */
.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 300;
  background: var(--c-surface); border-top: 1px solid var(--c-border);
  flex-direction: row; align-items: center; justify-content: space-around;
  padding: 6px 8px; padding-bottom: calc(6px + env(safe-area-inset-bottom));
  gap: 0;
}
.bnav-btn {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  background: none; border: none; cursor: pointer; padding: 6px 12px;
  color: var(--c-text3); font-size: 10px; font-weight: 500; font-family: 'DM Sans', sans-serif;
  transition: color .14s; flex: 1;
}
.bnav-btn svg { width: 20px; height: 20px; stroke: currentColor; fill: none; }
.bnav-btn.active { color: var(--c-accent); }
.bnav-fab {
  width: 50px; height: 50px; border-radius: 50%; border: none;
  background: var(--c-accent); color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(42,91,215,.4); flex-shrink: 0;
  transition: transform .14s, background .14s;
}
.bnav-fab:active { transform: scale(.93); }
.bnav-fab svg { width: 22px; height: 22px; stroke: currentColor; fill: none; }

/* ── MOBILE EXPORT BAR ──────────────────────────────────────── */
.mobile-export-bar {
  position: sticky; bottom: 0; left: 0; right: 0;
  background: var(--c-surface); border-top: 1px solid var(--c-border);
  padding: 10px 16px; padding-bottom: calc(10px + env(safe-area-inset-bottom));
  z-index: 50;
}
.mobile-export-btn {
  width: 100%; background: var(--c-accent); color: #fff; border: none;
  padding: 14px; border-radius: 12px; font-size: 15px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  gap: 8px; font-family: 'DM Sans', sans-serif;
}

/* ── MOBILE EDIT DRAWER ─────────────────────────────────────── */
.mobile-edit-backdrop {
  position: fixed; inset: 0; z-index: 800;
  background: rgba(0,0,0,.55); backdrop-filter: blur(4px);
  display: flex; align-items: flex-end;
}
.mobile-edit-drawer {
  width: 100%; background: var(--c-surface);
  border-radius: 20px 20px 0 0; max-height: 88dvh;
  display: flex; flex-direction: column; overflow: hidden;
}
.drawer-handle { width: 36px; height: 4px; background: var(--c-border2); border-radius: 2px; margin: 10px auto 0; flex-shrink: 0; }
.drawer-hd { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--c-border); flex-shrink: 0; }
.drawer-title { font-size: 15px; font-weight: 700; color: var(--c-text); }
.drawer-close { width: 28px; height: 28px; border-radius: 50%; background: var(--c-bg); border: 1px solid var(--c-border); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--c-text2); }
.drawer-close svg { width: 13px; height: 13px; }
.drawer-body { flex: 1; overflow-y: auto; padding: 16px; -webkit-overflow-scrolling: touch; }
.drawer-fade-enter-active, .drawer-fade-leave-active { transition: opacity .25s; }
.drawer-fade-enter-active .mobile-edit-drawer, .drawer-fade-leave-active .mobile-edit-drawer { transition: transform .3s cubic-bezier(.4,0,.2,1); }
.drawer-fade-enter-from { opacity: 0; }
.drawer-fade-enter-from .mobile-edit-drawer { transform: translateY(100%); }
.drawer-fade-leave-to { opacity: 0; }
.drawer-fade-leave-to .mobile-edit-drawer { transform: translateY(100%); }

/* ── CV PAGE SHADOW ─────────────────────────────────────────── */
.cv-page-shadow {
  display: inline-block;
  box-shadow: 0 8px 40px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.08);
  border-radius: 2px;
  overflow: hidden;
  background: #fff;
}

/* ── PREVIEW TOPBAR ─────────────────────────────────────────── */
.preview-topbar { display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; background: var(--c-surface); border-bottom: 1px solid var(--c-border); flex-shrink: 0; gap: 8px; }
.preview-topbar-left, .preview-topbar-right { display: flex; align-items: center; gap: 6px; }
.zoom-lbl { font-size: 11px; font-weight: 700; color: var(--c-text3); min-width: 32px; text-align: center; }
.export-pill { background: var(--c-accent) !important; color: #fff !important; border-color: var(--c-accent) !important; }
.export-pill:hover { opacity: .88; }

/* ── CV OUTER + SCALER ──────────────────────────────────────── */
.cv-outer  { box-sizing: border-box; }
.cv-scaler { display: block; }

/* ── MOBILE BUILDER ─────────────────────────────────────────── */
@media (max-width: 779px) {
  .builder-wrap    { flex-direction: column !important; }
  .builder-panel   { display: none !important; }
  .builder-preview { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
}

/* ── TOPBAR RIGHT ───────────────────────────────────────────── */
.topbar-right { display: flex; align-items: center; gap: 6px; margin-left: auto; }

/* Hide pages when builder is active — keep them mounted for KeepAlive */
.hidden-view { display: none !important; }

/* ── MISC ───────────────────────────────────────────────────── */
.skill-rm svg { width: 11px; height: 11px; }
</style>