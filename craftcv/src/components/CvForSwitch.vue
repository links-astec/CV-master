<template>
  <!-- Who the CV is for. The AI only uses the account holder's profile and other CVs for their own CV. -->
  <div v-if="auth.isLoggedIn" class="cvf">
    <span class="cvf-lbl">{{ $t('Who is this CV for?') }}</span>
    <div class="seg cvf-seg">
      <button type="button" :class="{ active: who === 'self' }" @click="store.data.cvFor = 'self'">{{ $t('Me') }}</button>
      <button type="button" :class="{ active: who === 'other' }" @click="store.data.cvFor = 'other'; store.clearPrefill()">{{ $t('Someone else') }}</button>
    </div>
    <p class="cvf-note">{{ $t(who === 'self'
      ? 'The AI personalises suggestions with your profile and your other CVs.'
      : 'The AI uses only what’s in this CV. Nothing from your profile or other CVs.') }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCvStore } from '../stores/cv.js'
import { useAuthStore } from '../stores/auth.js'

const store = useCvStore()
const auth  = useAuthStore()

// The user's choice, or a guess: a different name from the account's means someone else
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(/\s+/).filter(w => w.length > 1)
const who = computed(() => {
  if (store.data.cvFor === 'self' || store.data.cvFor === 'other') return store.data.cvFor
  const cv = norm(`${store.data.fn} ${store.data.ln}`), me = new Set(norm(auth.user?.name))
  return !cv.length || cv.some(w => me.has(w)) ? 'self' : 'other'
})
</script>

<style scoped>
.cvf{border:none;border-radius:18px;padding:16px 18px;margin-bottom:20px;background:var(--fill)}
.cvf-lbl{display:block;font-size:13px;font-weight:600;color:var(--c-text);margin-bottom:8px}
.cvf-seg{display:inline-flex}
.cvf-note{font-size:12px;color:var(--c-text3);margin-top:8px;line-height:1.45}
</style>
