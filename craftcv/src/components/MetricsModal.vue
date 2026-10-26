<template>
  <!-- "Add your numbers": the AI leaves [X%], [N] or [€X] where a figure would help instead of inventing one.
       This asks for each one, with its sentence for context and a live preview. Empty ones stay as they are
       (the CV review still flags them). -->
  <Teleport to="body">
    <div v-if="text" class="mm-back" @click.self="$emit('close')">
      <div class="mm" role="dialog" aria-modal="true" aria-labelledby="mm-t">
        <h3 id="mm-t">{{ $t('Add your numbers') }}</h3>
        <p class="mm-sub">{{ $t('The AI marked where a real figure would make this stronger. It never makes numbers up: fill in yours, or leave a box empty to skip it.') }}</p>
        <div class="mm-list">
          <label v-for="(s, i) in slots" :key="i" class="mm-item">
            <span class="mm-ctx" v-html="s.context"></span>
            <span class="mm-field">
              <span v-if="s.prefix" class="mm-affix">{{ s.prefix }}</span>
              <input v-model="values[i]" class="mm-in" :inputmode="s.numeric ? 'decimal' : 'text'" :placeholder="s.hint" @keydown.enter.prevent="apply" />
              <span v-if="s.suffix" class="mm-affix">{{ s.suffix }}</span>
            </span>
          </label>
        </div>
        <div class="mm-prev-lbl">{{ $t('Preview') }}</div>
        <div class="mm-prev">{{ filled }}</div>
        <div class="mm-acts">
          <button type="button" class="mm-cancel" @click="$emit('close')">{{ $t('Cancel') }}</button>
          <button type="button" class="mm-ok" @click="apply">{{ $t(values.some(v => String(v || '').trim()) ? 'Use these numbers' : 'Use it without numbers') }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { PLACEHOLDER_RE, placeholderSlot } from '../composables/metrics.js'

const props = defineProps({ text: { type: String, default: '' } })
const emit = defineEmits(['apply', 'close'])
const values = ref([])
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Each placeholder, with the line it's in (the placeholder highlighted) and how to ask for it
const slots = computed(() => {
  const out = []
  for (const line of props.text.split('\n')) {
    let m; const re = new RegExp(PLACEHOLDER_RE.source, 'g')
    while ((m = re.exec(line))) {
      const s = placeholderSlot(m[0])
      out.push({ ...s, raw: m[0], context: esc(line.replace(/^\s*[•\-*]\s*/, '')).replace(esc(m[0]), `<mark>${esc(m[0])}</mark>`) })
    }
  }
  return out
})
watch(() => props.text, () => { values.value = slots.value.map(() => '') }, { immediate: true })

// The text with what's been typed so far (empty boxes keep their placeholder)
const filled = computed(() => {
  let i = 0
  return props.text.replace(new RegExp(PLACEHOLDER_RE.source, 'g'), (raw) => {
    const s = slots.value[i], v = String(values.value[i++] || '').trim()
    if (!v || !s) return raw
    // what they typed, without a currency or % they added themselves (the placeholder already has it)
    const num = v.replace(/^(?:[£€$]|GH₵|₵)\s*/, '').replace(/\s*%$/, '')
    const after = s.suffix === '%' ? '%' : s.suffix && !num.toLowerCase().endsWith(s.suffix.toLowerCase()) ? ' ' + s.suffix : ''
    return (s.prefix || '') + num + after
  })
})
function apply() { emit('apply', filled.value) }
</script>

<style scoped>
.mm-back{position:fixed;inset:0;z-index:1400;background:rgba(12,12,16,.4);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:20px}
.mm{width:100%;max-width:520px;max-height:calc(100dvh - 40px);overflow:auto;background:var(--c-bg);border-radius:24px;box-shadow:var(--shadow-xl);padding:24px}
.mm h3{font-size:22px;font-weight:700;letter-spacing:-.025em;margin:0;color:var(--c-text)}
.mm-sub{font-size:14px;color:var(--c-text2);line-height:1.5;margin:6px 0 16px}
.mm-list{display:flex;flex-direction:column;gap:10px}
.mm-item{display:flex;flex-direction:column;gap:8px;background:var(--c-surface);border-radius:16px;padding:12px 14px}
.mm-ctx{font-size:14px;line-height:1.5;color:var(--c-text)}
.mm-ctx :deep(mark){background:color-mix(in srgb,var(--c-accent) 14%,transparent);color:var(--c-accent);font-weight:600;border-radius:5px;padding:0 3px}
.mm-field{display:flex;align-items:center;gap:6px;background:var(--fill);border-radius:10px;padding:0 12px;height:40px}
.mm-affix{font-size:14px;font-weight:600;color:var(--c-text3)}
.mm-in{flex:1;min-width:0;border:none;background:none;font:inherit;font-size:15px;color:var(--c-text);outline:none}
.mm-prev-lbl{font-size:13px;font-weight:600;color:var(--c-text3);margin:16px 4px 6px}
.mm-prev{white-space:pre-line;font-size:13.5px;line-height:1.6;color:var(--c-text2);background:var(--c-surface);border-radius:16px;padding:12px 14px}
.mm-acts{display:flex;justify-content:flex-end;align-items:center;gap:14px;margin-top:18px}
.mm-cancel{border:none;background:none;font:inherit;font-size:15px;font-weight:500;color:var(--c-text3);cursor:pointer}
.mm-ok{height:44px;padding:0 20px;border:none;border-radius:99px;background:var(--c-accent);color:#fff;font:inherit;font-size:15px;font-weight:600;cursor:pointer}
@media (max-width:560px){ .mm-back{padding:0;align-items:flex-end} .mm{max-width:100%;border-radius:24px 24px 0 0;padding:20px 18px calc(20px + env(safe-area-inset-bottom))} .mm-acts{justify-content:space-between} .mm-ok{flex:1} }
</style>
