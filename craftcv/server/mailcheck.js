// Is this email safe? Scores an email that arrived at a cvmaster.live address and says why.
//   'danger'  → goes straight to Spam (phishing, a fake sender, a blocked sender)
//   'caution' → stays in the Inbox with a warning
//   'safe'    → nothing to say
// Uses what the receiving server checked (SPF, DKIM, DMARC, from Resend) and what the email says and
// links to. Works for emails in English, French, Danish, German, Spanish, Dutch, Italian and Portuguese,
// since phishing often arrives in a language the reader doesn't expect.

// Companies people imitate, and the domains their real emails come from
const BRANDS = {
  cvmaster: ['cvmaster.live'], namecheap: ['namecheap.com'], stripe: ['stripe.com'], google: ['google.com', 'googlemail.com', 'gmail.com'],
  apple: ['apple.com', 'icloud.com'], microsoft: ['microsoft.com', 'outlook.com'], paypal: ['paypal.com'], amazon: ['amazon.com', 'amazon.co.uk', 'amazon.fr'],
  render: ['render.com'], vercel: ['vercel.com'], cloudflare: ['cloudflare.com'], github: ['github.com'], resend: ['resend.com'],
  neon: ['neon.tech', 'neon.com'], anthropic: ['anthropic.com'], linkedin: ['linkedin.com'], facebook: ['facebookmail.com', 'facebook.com', 'meta.com'],
  dhl: ['dhl.com'], netflix: ['netflix.com'], 'simply.com': ['simply.com'],
}
// Where cvmaster.live is really registered: renewal notices from anyone else are fake
const REGISTRAR = ['namecheap.com']

const UNIT = String.raw`(?:hours?|hrs?|timer|heures?|stunden|horas|uur|ore)`
const URGENT = new RegExp(String.raw`\b(?:24|48|72)\s*${UNIT}|immediately|urgent|right away|final notice|last warning|omgående|straks|sidste|immédiatement|dernier avis|sofort|letzte mahnung|inmediatamente|onmiddellijk|immediatamente|deactivat|deaktiver|suspend|suspendu|gesperrt|bloqu|blocked|disabled|terminated|will be (?:closed|deleted|lost)|afbrydelse|interruption|unterbrechung`, 'i')
const PAYMENT = /\binvoice|faktura|facture|rechnung|factura|fattura|fatura|betaling|paiement|zahlung|pago|pagamento|payment|overdue|outstanding|forfald|impayé|unpaid|balance due|betalingspåmindelse|mahnung|rappel de paiement|wire transfer|gift ?card|bitcoin|crypto/i
const DOMAIN_TALK = /\bdomain|domæne|domaine|domänen|dominio|domínio|dns|renewal|fornyelse|renouvellement|verlängerung|renovación|rinnovo|renovação|expir/i
const CREDENTIALS = /\b(?:password|passcode|login details|verify your (?:account|identity)|confirm your (?:account|identity|details)|adgangskode|mot de passe|passwort|contraseña|wachtwoord|senha|sign in to (?:avoid|keep)|card (?:number|details)|cvv|one-time code)\b/i
const SHORTENERS = /^(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|rebrand\.ly|cutt\.ly|shorturl\.at|rb\.gy|t\.ly)$/i

const domainOf = (addr) => String(addr || '').toLowerCase().split('@').pop().trim()
// "mail.namecheap.com" belongs to "namecheap.com"
const under = (host, root) => host === root || host.endsWith('.' + root)
const strip = (html) => String(html || '').replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ')

// Links in the HTML: where they really go, and what their text claims
function links(html, text) {
  const out = []
  const re = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let m
  while ((m = re.exec(String(html || ''))) && out.length < 80) out.push({ href: m[1].trim(), label: strip(m[2]).trim() })
  for (const u of String(text || '').match(/https?:\/\/[^\s<>()"']+/g) || []) if (out.length < 80) out.push({ href: u, label: '' })
  return out.map(l => { try { const u = new URL(l.href); return { ...l, host: u.hostname.toLowerCase(), proto: u.protocol } } catch { return { ...l, host: '', proto: '' } } })
    .filter(l => l.proto === 'http:' || l.proto === 'https:')
}

export function checkEmail({ fromAddr, fromName, subject, text, html, auth, blocked = [] } = {}) {
  const reasons = []
  let score = 0
  const add = (n, why) => { score += n; reasons.push(why) }
  const from = String(fromAddr || '').toLowerCase()
  const fromDomain = domainOf(from)
  const name = String(fromName || '').toLowerCase()
  const body = `${subject || ''} ${text || ''} ${strip(html)}`.slice(0, 40000)

  // Senders you blocked
  if (blocked.some(b => b === from || (b.startsWith('@') ? under(fromDomain, b.slice(1)) : false)))
    return { verdict: 'danger', score: 99, reasons: ['You blocked this sender.'] }

  // What the receiving server checked
  const a = auth || {}
  if (a.dmarc === 'fail') add(4, 'The sender’s own domain says this email didn’t come from it (DMARC failed).')
  else if (a.spf === 'fail' && a.dkim === 'fail') add(3, 'The email failed both sender checks (SPF and DKIM).')
  else if (a.spf === 'fail' || a.dkim === 'fail') add(1, `The ${a.spf === 'fail' ? 'SPF' : 'DKIM'} sender check failed.`)
  // Mail claiming to be from cvmaster.live itself must pass
  if (under(fromDomain, 'cvmaster.live') && a.dmarc && a.dmarc !== 'pass') add(4, 'It claims to come from cvmaster.live but wasn’t sent by CVMaster.')

  // A well-known name in the sender, but not their address
  for (const [brand, domains] of Object.entries(BRANDS)) {
    const word = brand.replace('.com', '')
    const inName = new RegExp(`\\b${word.replace('.', '\\.')}\\b`, 'i').test(name)
    if (inName && !domains.some(d => under(fromDomain, d))) { add(3, `The sender’s name says “${fromName}” but the address is ${from}.`); break }
  }

  // Domain renewal or payment demands from anyone but the real registrar
  const aboutDomain = DOMAIN_TALK.test(body), aboutMoney = PAYMENT.test(body)
  if (aboutDomain && aboutMoney && !REGISTRAR.some(d => under(fromDomain, d)))
    add(4, `It asks you to pay for a domain, but cvmaster.live is registered with Namecheap, not ${fromDomain}.`)
  else if (aboutMoney) add(1, 'It asks for a payment.')
  if (URGENT.test(body)) add(aboutMoney ? 2 : 1, 'It pressures you to act fast or threatens to cut something off.')
  if (CREDENTIALS.test(body)) add(2, 'It asks for a password, a code or card details.')

  // Links
  const ls = links(html, text)
  const bad = ls.find(l => /^\d{1,3}(?:\.\d{1,3}){3}$/.test(l.host))
  if (bad) add(3, `A link goes to a bare internet address (${bad.host}).`)
  const mismatch = ls.find(l => { const shown = (l.label.match(/\b([a-z0-9-]+(?:\.[a-z0-9-]+)+\.[a-z]{2,}|[a-z0-9-]+\.[a-z]{2,})\b/i) || [])[1]; return shown && l.host && !under(l.host, shown.toLowerCase().replace(/^www\./, '')) && !under(shown.toLowerCase(), l.host.replace(/^www\./, '')) })
  if (mismatch) add(3, `A link shows “${mismatch.label.slice(0, 60)}” but really goes to ${mismatch.host}.`)
  if (ls.some(l => SHORTENERS.test(l.host))) add(1, 'It uses shortened links that hide where they go.')
  // A "pay / log in" button that leads somewhere other than the sender's own site
  const action = ls.find(l => /\b(?:pay|betal|payer|zahlen|pagar|log ?in|sign ?in|verify|confirm|se og betal|view invoice|update)\b/i.test(l.label))
  if (action && action.host && fromDomain && !under(action.host, fromDomain) && !fromDomain.endsWith(action.host.split('.').slice(-2).join('.')))
    add(2, `Its “${action.label.slice(0, 40)}” button leads to ${action.host}, not ${fromDomain}.`)

  const verdict = score >= 5 ? 'danger' : score >= 2 ? 'caution' : 'safe'
  return { verdict, score, reasons }
}
