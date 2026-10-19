// Prices are in euros everywhere. Visitors in Ghana (told by the browser's time zone, nothing is looked
// up) also see roughly what a price is in cedis, at today's rate from our server. Payment stays in euros.
import { ref } from 'vue'

const LOCAL = { 'Africa/Accra': { code: 'GHS', symbol: 'GH₵' } }
const zone = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone } catch { return '' } })()
const local = LOCAL[zone] || null
const rate = ref(0)
let asked = false

function load() {
  if (asked || !local) return
  asked = true
  fetch((import.meta.env.VITE_API_URL || '') + '/api/fx')
    .then(r => r.json()).then(j => { rate.value = Number(j?.rates?.[local.code]) || 0 })
    .catch(() => {})
}

// '≈ GH₵ 17' for a euro amount, or '' (not in Ghana, or no rate yet)
export function approx(eur) {
  load()
  if (!local || !rate.value) return ''
  const v = eur * rate.value
  return `≈ ${local.symbol} ${v < 10 ? v.toFixed(2) : Math.round(v)}`
}
