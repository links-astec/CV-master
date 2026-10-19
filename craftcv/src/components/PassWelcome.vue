<template>
  <Teleport to="body">
    <Transition name="pw-sheet">
      <div v-if="show" class="pws-back" @click.self="$emit('close')">
        <div class="pws" role="dialog" aria-modal="true" aria-labelledby="pws-t">
          <div class="pws-card"><PassCard :name="name" :since="since" :plan="plan" /></div>
          <h2 id="pws-t">{{ $t('Welcome to the Job Hunt Pass.') }}</h2>
          <p class="pws-sub">{{ $t('Everything is unlocked. Here’s what changes for you.') }}</p>
          <ul class="pws-list">
            <li><span class="pws-ic"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/></svg></span>
              <div><b>{{ $t('Every CV, clean') }}</b><span>{{ $t('Download or email any CV you make as a clean PDF, as often as you like.') }}</span></div></li>
            <li><span class="pws-ic"><svg viewBox="0 0 24 24"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/></svg></span>
              <div><b>{{ $t('100 AI requests a day') }}</b><span>{{ $t('Tailor a CV to every job offer without running out.') }}</span></div></li>
            <li><span class="pws-ic"><svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 11-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg></span>
              <div><b>{{ $t('Yours to change') }}</b><span>{{ until ? $t('Renews on {date}. Cancel any time in Settings.', { date: until }) : $t('Cancel any time in Settings.') }}</span></div></li>
          </ul>
          <button class="pws-go" @click="$emit('start')">{{ $t('Start applying') }}</button>
          <button class="pws-later" @click="$emit('close')">{{ $t('Not now') }}</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
// Shown once, right after the Job Hunt Pass is bought: a calm, Apple-like welcome that says what's unlocked
import PassCard from './PassCard.vue'
defineProps({ show: Boolean, until: { type: String, default: '' }, name: { type: String, default: '' }, since: { type: String, default: '' }, plan: { type: String, default: 'month' } })
defineEmits(['close', 'start'])
</script>

<style scoped>
.pws-back{position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.36);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.pws{perspective:1000px;width:100%;max-width:440px;max-height:calc(100dvh - 40px);overflow-y:auto;background:var(--c-surface);border-radius:32px;padding:44px 36px 28px;text-align:center;box-shadow:0 40px 100px rgba(0,0,0,.25)}
.pws-card{display:flex;justify-content:center;margin:-8px 0 26px;animation:pwsCard .9s cubic-bezier(.2,.9,.25,1) .1s both}
@keyframes pwsCard{from{opacity:0;transform:translateY(40px) rotateX(28deg) scale(.9)}to{opacity:1;transform:none}}
.pws-mark{width:64px;height:64px;margin:0 auto 22px}
.pws-mark svg{width:100%;height:100%;fill:none;stroke-linecap:round;stroke-linejoin:round}
.pws-mark circle{fill:var(--c-accent);stroke:none;transform-origin:center;animation:pwsPop .5s cubic-bezier(.2,.9,.3,1.2) both}
.pws-mark path{stroke:#fff;stroke-width:4;stroke-dasharray:40;stroke-dashoffset:40;animation:pwsDraw .45s .35s ease forwards}
@keyframes pwsPop{from{transform:scale(.4);opacity:0}to{transform:none;opacity:1}}
@keyframes pwsDraw{to{stroke-dashoffset:0}}
.pws-k{font-size:15px;font-weight:600;color:var(--c-text3);margin:0}
.pws h2{font-size:30px;font-weight:700;letter-spacing:-.035em;line-height:1.12;color:var(--c-text);margin:6px 0 10px}
.pws-sub{font-size:16px;line-height:1.5;color:var(--c-text2);margin:0 0 28px}
.pws-list{list-style:none;margin:0 0 30px;padding:0;display:flex;flex-direction:column;gap:20px;text-align:left}
.pws-list li{display:flex;gap:16px;align-items:flex-start}
.pws-ic{width:40px;height:40px;flex-shrink:0;border-radius:12px;background:var(--fill);display:flex;align-items:center;justify-content:center}
.pws-ic svg{width:20px;height:20px;fill:none;stroke:var(--c-text);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.pws-list b{display:block;font-size:15.5px;font-weight:600;color:var(--c-text);margin-bottom:2px}
.pws-list span{font-size:14.5px;line-height:1.45;color:var(--c-text2)}
.pws-go{width:100%;height:50px;border:none;border-radius:99px;background:var(--c-accent);color:#fff;font:inherit;font-size:16px;font-weight:600;cursor:pointer;transition:background .2s,transform .15s}
.pws-go:hover{background:color-mix(in srgb,var(--c-accent) 88%,#000)}
.pws-go:active{transform:scale(.98)}
.pws-later{margin-top:10px;width:100%;height:42px;border:none;background:none;color:var(--c-accent);font:inherit;font-size:15px;font-weight:500;cursor:pointer}
.pw-sheet-enter-active,.pw-sheet-leave-active{transition:opacity .3s ease}
.pw-sheet-enter-active .pws,.pw-sheet-leave-active .pws{transition:transform .4s cubic-bezier(.2,.9,.3,1)}
.pw-sheet-enter-from,.pw-sheet-leave-to{opacity:0}
.pw-sheet-enter-from .pws,.pw-sheet-leave-to .pws{transform:translateY(24px) scale(.97)}
@media (prefers-reduced-motion:reduce){ .pws-card{animation:none} }
</style>
