// "Did you mean …@gmail.com?" — catches common typos in email domains before they cost
// someone their account email or their PDF.
const COMMON = [
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.fr', 'yahoo.co.uk', 'hotmail.com', 'hotmail.fr', 'hotmail.co.uk',
  'outlook.com', 'outlook.fr', 'live.com', 'live.fr', 'msn.com', 'icloud.com', 'me.com', 'aol.com',
  'orange.fr', 'free.fr', 'sfr.fr', 'laposte.net', 'wanadoo.fr', 'bbox.fr', 'neuf.fr', 'gmx.fr', 'gmx.com',
  'protonmail.com', 'proton.me', 'btinternet.com', 'sky.com', 'virginmedia.com',
]

function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length][b.length]
}

// Suggested full address, or '' when the domain looks right
export function suggestEmail(email) {
  const m = String(email || '').trim().toLowerCase().match(/^([^\s@]+)@([^\s@]+)$/)
  if (!m) return ''
  const [, user, domain] = m
  if (COMMON.includes(domain)) return ''
  // gmail.co / gmail.con / gmial.com → gmail.com (small edit distance to a common domain)
  let best = '', bestD = 3
  for (const c of COMMON) { const dd = distance(domain, c); if (dd < bestD) { best = c; bestD = dd } }
  return best && bestD <= 2 ? `${user}@${best}` : ''
}

// Server check: the domain can receive email and isn't a throwaway service
export async function checkEmail(email) {
  try {
    const r = await fetch((import.meta.env.VITE_API_URL || '') + '/api/email-check?email=' + encodeURIComponent(String(email).trim()))
    return r.ok ? await r.json() : { ok: true }
  } catch { return { ok: true } }
}
