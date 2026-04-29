<template>
  <div class="view-page">
    <div style="max-width:660px;">

      <!-- Profile -->
      <div class="settings-card">
        <div class="settings-ttl"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> Profile</div>
        <div class="f-row">
          <div class="f-grp"><div class="f-lbl">Display Name</div><input class="f-inp" v-model="name" :placeholder="auth.user?.name" /></div>
          <div class="f-grp"><div class="f-lbl">Email</div><input class="f-inp" :value="auth.user?.email" disabled style="opacity:.5;cursor:not-allowed;" /></div>
        </div>
        <button class="btn-primary accent" @click="saveProfile" style="margin-top:4px;">Save Profile</button>
      </div>

      <!-- Appearance -->
      <div class="settings-card">
        <div class="settings-ttl"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 010 20z"/></svg> Appearance</div>
        <div class="toggle-row">
          <div><div class="toggle-label">Dark Mode</div><div class="toggle-sub">Switch between light and dark interface</div></div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="store.darkMode" />
            <div class="toggle-track"><div class="toggle-thumb"></div></div>
          </label>
        </div>
        <div class="toggle-row">
          <div><div class="toggle-label">Compact Sidebar</div><div class="toggle-sub">Show icons only in sidebar</div></div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="compactSidebar" />
            <div class="toggle-track"><div class="toggle-thumb"></div></div>
          </label>
        </div>
      </div>

      <!-- AI Model -->
      <div class="settings-card">
        <div class="settings-ttl"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg> AI Model</div>
        <p style="font-size:12.5px;color:var(--c-text2);margin-bottom:14px;">AI is powered by Groq on our servers — no API key required.</p>
        <div class="model-grid">
          <div v-for="m in models" :key="m.id" class="model-card" :class="{ active: selectedModel===m.id }" @click="selectedModel=m.id">
            <div class="model-name">{{ m.name }}</div>
            <div class="model-desc">{{ m.desc }}</div>
            <div class="model-spd" :class="m.spdCls">{{ m.spd }}</div>
          </div>
        </div>
        <div class="groq-status gs-ok" style="margin-top:12px;"><div class="gs-dot"></div><span>AI connected via PerfectCV servers · No key needed</span></div>
      </div>

      <!-- Notifications -->
      <div class="settings-card">
        <div class="settings-ttl">🔔 Notifications</div>
        <div class="toggle-row">
          <div><div class="toggle-label">CV tips & suggestions</div></div>
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

      <!-- Danger zone -->
      <div class="settings-card" style="border-color:var(--c-rose-lt);">
        <div class="settings-ttl" style="color:var(--c-rose);">⚠️ Account</div>
        <button class="btn-secondary" style="color:var(--c-rose);border-color:var(--c-rose-lt);" @click="logout">Sign out of PerfectCV</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useCvStore } from '../stores/cv.js'
const auth = useAuthStore()
const store = useCvStore()
const showToast = inject('showToast')
const name = ref(auth.user?.name || '')
const compactSidebar = ref(false)
const selectedModel = ref('llama-3.3-70b-versatile')

async function saveProfile() {
  await fetch('/api/auth/settings', { method:'PATCH', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name: name.value }) })
  if (auth.user) auth.user.name = name.value
  showToast('✅ Profile saved')
}

async function logout() {
  await auth.logout()
  window.location.reload()
}

const models = [
  { id:'llama-3.3-70b-versatile', name:'Llama 3.3 70B', desc:'Best quality — default', spd:'⚡ 500 tok/s', spdCls:'spd-m' },
  { id:'llama-3.1-8b-instant', name:'Llama 3.1 8B', desc:'Ultra-fast, quick edits', spd:'⚡⚡ 1000 tok/s', spdCls:'spd-f' },
  { id:'mixtral-8x7b-32768', name:'Mixtral 8×7B', desc:'Best for multilingual CVs', spd:'⚡ 600 tok/s', spdCls:'spd-m' },
  { id:'gemma2-9b-it', name:'Gemma 2 9B', desc:'Balanced speed/quality', spd:'⚡⚡ 800 tok/s', spdCls:'spd-f' },
]
</script>

<style scoped>
.groq-status{display:flex;align-items:center;gap:7px;font-size:11.5px;font-weight:600;padding:8px 12px;border-radius:var(--radius-sm);}
.gs-ok{background:var(--c-green-lt);color:var(--c-green);}
.gs-dot{width:7px;height:7px;border-radius:50%;background:currentColor;flex-shrink:0;}
</style>