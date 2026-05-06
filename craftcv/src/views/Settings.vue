<template>
  <div class="view-page">
    <div style="max-width:660px;">

      <!-- Profile -->
      <div class="settings-card">
        <div class="settings-ttl">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          Profile
        </div>
        <div class="f-row">
          <div class="f-grp">
            <div class="f-lbl">Display Name</div>
            <input class="f-inp" v-model="name" :placeholder="auth.user?.name" />
          </div>
          <div class="f-grp">
            <div class="f-lbl">Email</div>
            <input class="f-inp" :value="auth.user?.email" disabled style="opacity:.5;cursor:not-allowed;" />
          </div>
        </div>
        <div class="f-grp">
          <div class="f-lbl">New Password <span style="font-size:10px;color:var(--c-text3);margin-left:4px;">optional</span></div>
          <div style="position:relative;">
            <input class="f-inp" v-model="newPassword" :type="showPw ? 'text' : 'password'" placeholder="Leave blank to keep current" style="padding-right:42px;" />
            <button type="button" @click="showPw=!showPw" style="position:absolute;right:11px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--c-text3);">
              <svg v-if="showPw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:15px;height:15px;"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:15px;height:15px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
        <div v-if="saveError" style="font-size:12px;color:var(--c-rose);margin-bottom:10px;">{{ saveError }}</div>
        <button class="btn-primary accent" @click="saveProfile" :disabled="saving">
          <svg v-if="saving" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 00-9-9"/></svg>
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>

      <!-- Appearance -->
      <div class="settings-card">
        <div class="settings-ttl">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 010 20z"/></svg>
          Appearance
        </div>
        <div class="toggle-row">
          <div>
            <div class="toggle-label">Dark Mode</div>
            <div class="toggle-sub">Switch to a dark interface</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="store.darkMode" />
            <div class="toggle-track"><div class="toggle-thumb"></div></div>
          </label>
        </div>
      </div>

      <!-- Notifications -->
      <div class="settings-card">
        <div class="settings-ttl">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          Notifications
        </div>
        <div class="toggle-row">
          <div><div class="toggle-label">CV tips and suggestions</div></div>
          <label class="toggle-switch"><input type="checkbox" checked /><div class="toggle-track"><div class="toggle-thumb"></div></div></label>
        </div>
        <div class="toggle-row">
          <div><div class="toggle-label">New template releases</div></div>
          <label class="toggle-switch"><input type="checkbox" checked /><div class="toggle-track"><div class="toggle-thumb"></div></div></label>
        </div>
        <div class="toggle-row">
          <div><div class="toggle-label">Payment receipts</div></div>
          <label class="toggle-switch"><input type="checkbox" checked /><div class="toggle-track"><div class="toggle-thumb"></div></div></label>
        </div>
      </div>

      <!-- Account -->
      <div class="settings-card" style="border-color:var(--c-rose-lt);">
        <div class="settings-ttl" style="color:var(--c-rose);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          Account
        </div>
        <button class="btn-secondary" style="color:var(--c-rose);border-color:var(--c-rose-lt);" @click="logout">
          Sign out of PerfectCV
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, inject } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useCvStore } from '../stores/cv.js'

const auth      = useAuthStore()
const store     = useCvStore()
const showToast = inject('showToast')

const name        = ref(auth.user?.name || '')
const newPassword = ref('')
const showPw      = ref(false)
const saving      = ref(false)
const saveError   = ref('')

async function saveProfile() {
  saveError.value = ''
  if (newPassword.value && newPassword.value.length < 8) {
    saveError.value = 'Password must be at least 8 characters.'
    return
  }
  saving.value = true
  try {
    const body = {}
    if (name.value && name.value !== auth.user?.name) body.name = name.value
    if (newPassword.value) body.password = newPassword.value
    if (!Object.keys(body).length) { showToast('Nothing to update'); saving.value = false; return }
    const r = await fetch('/api/auth/settings', {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error)
    if (auth.user && name.value) auth.user.name = name.value
    newPassword.value = ''
    showToast('Profile saved')
  } catch (e) { saveError.value = e.message }
  saving.value = false
}

async function logout() {
  await auth.logout()
  window.location.reload()
}

</script>

<style scoped>
.ai-status-row { display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:600;padding:8px 12px;border-radius:var(--radius-sm); }
.ai-ok   { background:var(--c-green-lt);color:var(--c-green); }
.ai-warn { background:var(--c-amber-lt);color:var(--c-amber); }
.ai-checking { background:var(--c-bg);color:var(--c-text3); }
.ai-status-dot { width:7px;height:7px;border-radius:50%;background:currentColor;flex-shrink:0; }
.spin { animation:spin .7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
</style>