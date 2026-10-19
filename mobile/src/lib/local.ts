// Where the phone is set to, from its time zone (never the internet address), using the same table as
// the website. Used for the admin's people-by-country numbers and to show prices in the local currency.
// Prices stay in euros; this only adds an estimate such as "≈ £0.83" next to them.
import { useEffect, useState } from 'react'
import { getCalendars } from 'expo-localization'
import { ZONE_COUNTRY, COUNTRY_CURRENCY } from '@web/data/zones.js'
import { api } from '@/lib/api'
import { lang } from '@/i18n'

const zone = (() => { try { return getCalendars()[0]?.timeZone || '' } catch { return '' } })()
export const deviceCountry: string = (ZONE_COUNTRY as Record<string, string>)[zone] || ''
const currency: string = (COUNTRY_CURRENCY as Record<string, string>)[deviceCountry] || ''

let rate = 0
let loading: Promise<void> | null = null
const loadRate = () => (loading ||= api<{ rates: Record<string, number> }>('/api/fx')
  .then(j => { rate = Number(j?.rates?.[currency]) || 0 })
  .catch(() => { loading = null }))

function format(eur: number): string {
  if (!currency || !rate) return ''
  const v = eur * rate, digits = v >= 10 ? 0 : 2
  try {
    return '≈ ' + new Intl.NumberFormat(lang.value || 'en', { style: 'currency', currency, currencyDisplay: 'narrowSymbol', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v)
  } catch { return `≈ ${v.toFixed(digits)} ${currency}` }
}

// '≈ £0.83' for a euro amount, or '' (euro country, unknown, or no rate yet)
export function useApprox(eur: number): string {
  const [text, setText] = useState(() => format(eur))
  useEffect(() => {
    if (!currency) return
    let live = true
    loadRate().then(() => { if (live) setText(format(eur)) })
    return () => { live = false }
  }, [eur])
  return text
}
