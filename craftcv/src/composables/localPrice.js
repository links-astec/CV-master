// Prices are in euros everywhere. Visitors outside the euro area also see roughly what a price is in
// their own currency (UK → pounds, Ghana → cedis, …), at today's rate from our server. The country comes
// from the device's time zone setting: nothing is looked up from the internet address. Payment stays in euros.
import { ref } from 'vue'
import { locale } from '../i18n/index.js'

const zone = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || '' } catch { return '' } })()
let table = null
const loadTable = () => (table ||= import('../data/zones.js'))

// The device's country ('GB', 'GH', …) or '' when the time zone doesn't say
export async function deviceCountry() {
  if (!zone) return ''
  try { return (await loadTable()).ZONE_COUNTRY[zone] || '' } catch { return '' }
}

const currency = ref('')
const rate = ref(0)
let asked = false
async function load() {
  if (asked) return
  asked = true
  try {
    const { ZONE_COUNTRY, COUNTRY_CURRENCY } = await loadTable()
    const code = COUNTRY_CURRENCY[ZONE_COUNTRY[zone]]
    if (!code) return
    const j = await (await fetch((import.meta.env.VITE_API_URL || '') + '/api/fx')).json()
    const r = Number(j?.rates?.[code])
    if (r > 0) { currency.value = code; rate.value = r }
  } catch {}
}

// '≈ £0.85', '≈ GH₵13' for a euro amount, or '' (euro country, unknown, or no rate yet)
export function approx(eur) {
  load()
  if (!currency.value || !rate.value) return ''
  const v = eur * rate.value
  const digits = v >= 10 ? 0 : 2
  try {
    return '≈ ' + new Intl.NumberFormat(locale() || 'en', { style: 'currency', currency: currency.value, currencyDisplay: 'narrowSymbol', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v)
  } catch { return `≈ ${v.toFixed(digits)} ${currency.value}` }
}
