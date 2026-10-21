// Finds the Affinda workspace and resume document type for the API key in .env (prints names and ids, never the key)
//   node --env-file=.env scripts/affinda-setup.mjs
const key = process.env.AFFINDA_API_KEY
if (!key) { console.log('AFFINDA_API_KEY is missing in .env'); process.exit(1) }
const H = { Authorization: 'Bearer ' + key, accept: 'application/json' }
for (const base of ['https://api.affinda.com', 'https://api.eu1.affinda.com', 'https://api.us1.affinda.com']) {
  const get = async (p) => { try { const r = await fetch(base + p, { headers: H, signal: AbortSignal.timeout(15000) }); return { status: r.status, j: await r.json().catch(() => null) } } catch (e) { return { status: 'no answer (' + (e.cause?.code || e.name) + ')', j: null } } }
  const org = await get('/v3/organizations')
  console.log(`\n${base}: organizations → ${org.status}`)
  if (org.status !== 200 || !Array.isArray(org.j)) continue
  for (const o of org.j) {
    console.log(`  organization: ${o.name} (${o.identifier})`)
    const ws = await get(`/v3/workspaces?organization=${o.identifier}`)
    for (const w of Array.isArray(ws.j) ? ws.j : []) console.log(`    workspace: ${w.name} (${w.identifier})`)
    const dt = await get(`/v3/document_types?organization=${o.identifier}`)
    for (const d of Array.isArray(dt.j) ? dt.j : (dt.j?.results || [])) console.log(`    document type: ${d.name} (${d.identifier})`)
    if (dt.status !== 200) console.log(`    document types → ${dt.status} ${JSON.stringify(dt.j).slice(0, 160)}`)
  }
  console.log(`  → API region: ${base}`)
}
