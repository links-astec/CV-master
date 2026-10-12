<template>
  <Teleport to="body">
    <div class="ob-root">
      <div class="ob-card" role="dialog" aria-labelledby="ob-title">
        <div class="ob-body">
          <BrandLogo mark-only large animate />
          <h2 id="ob-title">{{ firstName ? $t('Welcome, {name}', { name: firstName }) : $t('Welcome') }}</h2>
          <p class="ob-lead">{{ $t('Three quick questions so the AI writes in the right tone for you. All optional.') }}</p>

          <div class="ob-q">
            <div class="ob-q-lbl">{{ $t('Your field') }}</div>
            <div class="ob-chips">
              <button v-for="o in industries" :key="o.id" class="ob-chip" :class="{ on: form.industry === o.id }"
                      :aria-pressed="form.industry === o.id" @click="pickOne('industry', o.id)">{{ $t(o.label) }}</button>
            </div>
          </div>

          <div class="ob-q">
            <div class="ob-q-lbl">{{ $t('What are you aiming for?') }}</div>
            <div class="ob-chips">
              <button v-for="o in goals" :key="o.id" class="ob-chip" :class="{ on: form.goal === o.id }"
                      :aria-pressed="form.goal === o.id" @click="pickOne('goal', o.id)">{{ $t(o.label) }}</button>
            </div>
          </div>

          <div class="ob-q">
            <div class="ob-q-lbl">{{ $t('Experience') }}</div>
            <div class="ob-chips">
              <button v-for="o in expLevels" :key="o.id" class="ob-chip" :class="{ on: form.experience === o.id }"
                      :aria-pressed="form.experience === o.id" @click="pickOne('experience', o.id)">
                {{ $t(o.label) }} <span class="ob-chip-sub">{{ $t(o.years) }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="ob-footer">
          <button class="btn-ghost" :disabled="loading" @click="skip">{{ $t('Skip') }}</button>
          <button class="btn-primary accent" :disabled="loading" @click="finish">
            {{ $t(loading ? 'Saving…' : 'Start building') }}
            <svg v-if="!loading" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import BrandLogo from '../BrandLogo.vue'
import { INDUSTRIES, GOALS, LEVELS } from '../../composables/profileOptions.js'

const auth = useAuthStore()
const emit = defineEmits(['done'])

const loading = ref(false)
const form    = ref({ industry: '', goal: '', experience: '' })
const firstName = computed(() => (auth.user?.name || '').trim().split(/\s+/)[0] || '')

// Tap again to clear a choice
function pickOne(key, id) { form.value[key] = form.value[key] === id ? '' : id }

async function save(payload) {
  loading.value = true
  await auth.completeOnboarding(payload).catch(() => {})
  loading.value = false
  emit('done')
}
const skip   = () => save({ industry: 'other', goal: 'update', experience: 'mid' })
const finish = () => save(form.value)

const industries = INDUSTRIES, goals = GOALS, expLevels = LEVELS
</script>

<style scoped>
.ob-root{position:fixed;inset:0;z-index:1500;background:rgba(20,20,43,.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px}
.ob-card{background:var(--c-surface);border-radius:20px;width:100%;max-width:540px;max-height:92dvh;display:flex;flex-direction:column;overflow:hidden;box-shadow:var(--shadow-xl);border:1px solid var(--c-border)}
.ob-body{padding:30px 30px 8px;overflow-y:auto}
.ob-body h2{font-size:24px;font-weight:800;letter-spacing:-.02em;color:var(--c-text);margin:16px 0 6px}
.ob-lead{font-size:14px;color:var(--c-text2);line-height:1.55;margin-bottom:22px}

.ob-q{margin-bottom:20px}
.ob-q-lbl{font-size:13px;font-weight:600;color:var(--c-text);margin-bottom:9px}
.ob-chips{display:flex;flex-wrap:wrap;gap:7px}
.ob-chip{height:34px;padding:0 13px;border-radius:99px;border:1px solid var(--c-border);background:var(--c-surface);
  font-size:13px;font-weight:500;color:var(--c-text2);display:inline-flex;align-items:center;gap:6px;transition:border-color .12s,background .12s,color .12s}
.ob-chip:hover{border-color:var(--c-border2);color:var(--c-text)}
.ob-chip.on{background:var(--c-accent-lt);border-color:var(--c-accent);color:var(--c-accent);font-weight:600}
.ob-chip-sub{font-size:11.5px;color:var(--c-text3);font-weight:400}
.ob-chip.on .ob-chip-sub{color:inherit;opacity:.75}

.ob-footer{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:14px 22px 18px 24px;border-top:1px solid var(--c-border);background:var(--c-surface)}
.ob-footer svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2.2}

@media (max-width:600px){
  .ob-root{padding:0;align-items:flex-end}
  .ob-card{border-radius:20px 20px 0 0;max-width:100%;max-height:94dvh}
  .ob-body{padding:24px 20px 4px}
  .ob-footer{padding:12px 20px calc(18px + env(safe-area-inset-bottom))}
}
</style>
