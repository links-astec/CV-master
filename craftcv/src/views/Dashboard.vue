<template>
  <div class="view-page">
    <!-- Filter tabs -->
    <div class="filter-row">
      <button
        v-for="t in tabs" :key="t.id"
        class="filter-tab" :class="{ active: activeTab === t.id }"
        @click="activeTab = t.id"
      >
        {{ t.label }}
        <span class="f-count">{{ t.count }}</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="dash-empty">
      <div class="dash-spinner"></div>
      <p>Loading your CVs...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredDrafts.length === 0" class="dash-empty">
      <div class="dash-empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
      </div>
      <div class="dash-empty-title">{{ activeTab === 'all' ? 'No CVs yet' : `No ${activeTab} CVs` }}</div>
      <p class="dash-empty-sub">{{ activeTab === 'all' ? 'Create your first CV to get started.' : `You have no ${activeTab} CVs right now.` }}</p>
      <button class="btn-primary accent" @click="newCV()" style="margin-top:16px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:13px;height:13px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Create your first CV
      </button>
    </div>

    <!-- Cards grid -->
    <div v-else class="cards-grid">
      <div
        v-for="(draft, i) in filteredDrafts" :key="draft.id"
        class="proj-card anim-up"
        :style="{ animationDelay: `${i * 0.06}s` }"
        @click="openDraft(draft)"
      >
        <div class="card-icon" :style="{ background: cardColor(i) }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px;"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
        </div>
        <div class="card-ttl">{{ draft.title || 'Untitled CV' }}</div>
        <div class="card-meta">{{ draft.template || 'executive' }} template · {{ timeAgo(draft.updatedAt) }}</div>
        <div class="card-sep"></div>
        <div class="card-foot">
          <span class="draft-status" :class="statusClass(draft)">{{ statusLabel(draft) }}</span>
          <div class="card-actions">
            <button class="card-action-btn" @click.stop="openDraft(draft)" title="Edit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="card-action-btn danger" @click.stop="deleteDraft(draft.id)" title="Delete">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
        </div>
        <div class="prog-track">
          <div class="prog-fill" :style="{ width: progress(draft) + '%', background: accentColor(i) }"></div>
        </div>
      </div>

      <!-- New CV card -->
      <div class="proj-card new-card anim-up" :style="{ animationDelay: `${filteredDrafts.length * 0.06}s` }" @click="newCV()">
        <div class="new-card-inner">
          <div class="new-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <div class="new-card-label">Create new CV</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, watch, inject } from 'vue'
import { useCvStore } from '../stores/cv.js'
import { useAuthStore } from '../stores/auth.js'

const store     = useCvStore()
const confirm   = inject('confirm')
const drafts    = ref([])
const loading   = ref(true)
const activeTab = ref('all')

const COLORS  = ['#e8eefb','#f0ebfa','#fce9eb','#e6f5f4','#fdf0dc','#e6f5ed']
const ACCENTS = ['#2a5bd7','#6236b0','#c52b3d','#0d7a72','#b56a0e','#1a7a4a']
const cardColor   = (i) => COLORS[i % COLORS.length]
const accentColor = (i) => ACCENTS[i % ACCENTS.length]

function newCV() {
  store.resetData()
  store.openWizard()
}

const tabs = computed(() => [
  { id: 'all',    label: 'All',       count: drafts.value.length },
  { id: 'active', label: 'Active',    count: drafts.value.filter(d => progress(d) > 0 && progress(d) < 100).length },
  { id: 'drafts', label: 'Drafts',    count: drafts.value.filter(d => progress(d) === 0).length },
  { id: 'done',   label: 'Completed', count: drafts.value.filter(d => progress(d) === 100).length },
])

const filteredDrafts = computed(() => {
  if (activeTab.value === 'active') return drafts.value.filter(d => progress(d) > 0 && progress(d) < 100)
  if (activeTab.value === 'drafts') return drafts.value.filter(d => progress(d) === 0)
  if (activeTab.value === 'done')   return drafts.value.filter(d => progress(d) === 100)
  return drafts.value
})

function progress(draft) {
  const d = draft.data || {}
  let s = 0
  if (d.fn || d.ln) s += 20
  if (d.sum && d.sum.length > 20) s += 20
  if (d.experiences?.length) s += 20
  if (d.skills?.length >= 3) s += 20
  if (d.education?.degree) s += 20
  return s
}

function statusLabel(draft) {
  const p = progress(draft)
  if (p === 100) return 'Complete'
  if (p === 0)   return 'Draft'
  return 'In progress'
}

function statusClass(draft) {
  const p = progress(draft)
  if (p === 100) return 'status-done'
  if (p === 0)   return 'status-draft'
  return 'status-active'
}

function timeAgo(ts) {
  if (!ts) return 'just now'
  const d = Date.now() - new Date(ts).getTime()
  if (d < 60000)    return 'just now'
  if (d < 3600000)  return `${Math.floor(d/60000)}m ago`
  if (d < 86400000) return `${Math.floor(d/3600000)}h ago`
  return `${Math.floor(d/86400000)}d ago`
}

const auth = useAuthStore()

async function loadDrafts() {
  loading.value = true
  try {
    const r = await fetch('/api/drafts', { credentials: 'include' })
    if (r.ok) {
      drafts.value = await r.json()
    } else if (r.status === 401) {
      // Retry once after short delay — handles Stripe redirect timing
      setTimeout(async () => {
        try {
          const r2 = await fetch('/api/drafts', { credentials: 'include' })
          if (r2.ok) drafts.value = await r2.json()
        } catch {}
        loading.value = false
      }, 1000)
      return
    }
  } catch {}
  loading.value = false
}

// Also re-fetch when user becomes available (page reload race condition)
watch(() => auth.user, (user) => {
  if (user && drafts.value.length === 0 && !loading.value) loadDrafts()
})

function openDraft(draft) {
  if (draft.data)     Object.assign(store.data, draft.data)
  if (draft.template) store.template = draft.template
  store.currentDraftId  = draft.id
  store.wizardDraftId   = draft.id
  store.openWizard()
}

async function deleteDraft(id) {
  const ok = await confirm({
    title:   'Delete CV?',
    message: 'This draft will be permanently deleted and cannot be recovered.',
    ok:      'Delete',
    cancel:  'Keep it',
    mode:    'danger',
  })
  if (!ok) return
  await fetch(`/api/drafts/${id}`, { method: 'DELETE', credentials: 'include' })
  drafts.value = drafts.value.filter(d => d.id !== id)
  // If this was the active draft, clear localStorage so it doesn't restore on refresh
  if (store.currentDraftId === id) {
    store.resetData()
  }
}

onMounted(loadDrafts)
onActivated(loadDrafts)
</script>
<style scoped>
.dash-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 64px 24px; text-align: center; color: var(--c-text2);
}
.dash-spinner {
  width: 32px; height: 32px; border: 3px solid var(--c-border);
  border-top-color: var(--c-accent); border-radius: 50%;
  animation: spin .8s linear infinite; margin-bottom: 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.dash-empty-icon {
  width: 56px; height: 56px; background: var(--c-bg); border-radius: 16px;
  display: flex; align-items: center; justify-content: center; margin-bottom: 14px;
}
.dash-empty-icon svg { width: 28px; height: 28px; color: var(--c-text3); }
.dash-empty-title { font-size: 16px; font-weight: 700; color: var(--c-text); margin-bottom: 6px; }
.dash-empty-sub { font-size: 13px; color: var(--c-text3); max-width: 260px; }

.card-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 12px; color: var(--c-text2);
}
.draft-status {
  font-size: 10.5px; font-weight: 700; padding: 2px 8px;
  border-radius: 20px; letter-spacing: .03em;
}
.status-draft  { background: var(--c-bg); color: var(--c-text3); }
.status-active { background: var(--c-amber-lt); color: var(--c-amber); }
.status-done   { background: var(--c-green-lt); color: var(--c-green); }

.card-actions { display: flex; gap: 4px; }
.card-action-btn {
  width: 26px; height: 26px; border-radius: 6px; border: 1px solid var(--c-border);
  background: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: var(--c-text3); transition: all .14s;
}
.card-action-btn:hover { background: var(--c-bg); color: var(--c-text); }
.card-action-btn.danger:hover { background: var(--c-rose-lt); color: var(--c-rose); border-color: var(--c-rose-lt); }

.new-card { border: 2px dashed var(--c-border) !important; cursor: pointer; }
.new-card:hover { border-color: var(--c-accent) !important; }
.new-card-inner { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center; min-height: 140px; }
.new-card-icon { width: 40px; height: 40px; border-radius: 50%; background: var(--c-accent-lt); display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
.new-card-icon svg { width: 18px; height: 18px; color: var(--c-accent); }
.new-card-label { font-size: 13px; font-weight: 600; color: var(--c-text2); }
</style>