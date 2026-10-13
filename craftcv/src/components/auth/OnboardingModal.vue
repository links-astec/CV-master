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
.ob-root{position:fixed;inset:0;z-index:1500;background:rgba(12,12,16,.34);backdrop-filter:blur(16px) saturate(1.2);-webkit-backdrop-filter:blur(16px) saturate(1.2);display:flex;align-items:center;justify-content:center;padding:20px;animation:obFade .35s var(--ease) both}
.ob-card{position:relative;background:var(--c-surface);border-radius:30px;width:100%;max-width:580px;max-height:92dvh;display:flex;flex-direction:column;overflow:hidden;box-shadow:var(--shadow-xl);animation:obIn .5s var(--ease) both}
/* a soft indigo glow behind the welcome, like the homepage */
.ob-card::before{content:'';position:absolute;inset:0 0 auto 0;height:220px;background:radial-gradient(420px 200px at 15% -20%,color-mix(in srgb,var(--c-accent) 16%,transparent),transparent 70%);pointer-events:none}
@keyframes obFade{from{opacity:0}to{opacity:1}}
@keyframes obIn{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:none}}
.ob-body{position:relative;padding:36px 36px 10px;overflow-y:auto}
.ob-body h2{font-size:clamp(28px,4vw,34px);font-weight:800;letter-spacing:-.04em;line-height:1.08;color:var(--c-text);margin:20px 0 8px}
.ob-lead{font-size:15.5px;color:var(--c-text2);line-height:1.55;margin-bottom:28px;max-width:440px}

.ob-q{margin-bottom:24px}
.ob-q-lbl{font-size:15px;font-weight:700;letter-spacing:-.015em;color:var(--c-text);margin-bottom:12px}
.ob-chips{display:flex;flex-wrap:wrap;gap:8px}
.ob-chip{height:38px;padding:0 16px;border-radius:999px;border:none;background:var(--fill);
  font-size:14px;font-weight:500;color:var(--c-text);display:inline-flex;align-items:center;gap:6px;
  transition:background .2s var(--ease),color .2s var(--ease),box-shadow .2s var(--ease),transform .2s var(--ease)}
.ob-chip:hover{background:var(--fill-hover)}
.ob-chip:active{transform:scale(.97)}
.ob-chip.on{background:var(--c-accent);color:#fff;font-weight:600;box-shadow:0 6px 16px rgba(67,56,202,.28)}
.ob-chip-sub{font-size:12px;color:var(--c-text3);font-weight:500}
.ob-chip.on .ob-chip-sub{color:rgba(255,255,255,.8)}

.ob-footer{position:relative;display:flex;justify-content:space-between;align-items:center;gap:10px;padding:16px 28px 24px 28px;background:linear-gradient(180deg,color-mix(in srgb,var(--c-surface) 0%,transparent),var(--c-surface) 30%)}
.ob-footer .btn-primary{height:46px;padding:0 24px;font-size:15px}
.ob-footer svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2.2}

@media (max-width:600px){
  .ob-root{padding:0;align-items:flex-end}
  .ob-card{border-radius:30px 30px 0 0;max-width:100%;max-height:94dvh}
  .ob-body{padding:28px 22px 4px}
  .ob-footer{padding:12px 20px calc(18px + env(safe-area-inset-bottom))}
  .ob-footer .btn-primary{flex:1}
}
@media (prefers-reduced-motion:reduce){ .ob-root,.ob-card{animation:none} }
</style>
