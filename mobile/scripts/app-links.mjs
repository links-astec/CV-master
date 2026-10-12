// Makes invite and password-reset links (https://www.cvmaster.live/invite/…, /reset-password)
// open the app when it's installed, by writing the two files the website must serve:
//   craftcv/public/.well-known/assetlinks.json            (Android: the app's signing key)
//   craftcv/public/.well-known/apple-app-site-association (iPhone: the Apple team)
// Run once the app has its signing key and Apple team, then deploy the website:
//   ANDROID_SHA256="AB:CD:…" APPLE_TEAM_ID="ABCDE12345" node scripts/app-links.mjs
// ANDROID_SHA256: `eas credentials` → Android → the keystore's SHA-256 fingerprint (and, once on
// Google Play, also the "App signing key" SHA-256 from Play Console; separate several with commas).
// APPLE_TEAM_ID: developer.apple.com → Membership. Either one can be left out until you have it.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8')).expo
const out = path.resolve(root, '../craftcv/public/.well-known')
fs.mkdirSync(out, { recursive: true })

const sha = String(process.env.ANDROID_SHA256 || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
if (sha.length) {
  const bad = sha.filter(s => !/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(s))
  if (bad.length) { console.error('Not a SHA-256 fingerprint:', bad.join(', ')); process.exit(1) }
  fs.writeFileSync(path.join(out, 'assetlinks.json'), JSON.stringify([{
    relation: ['delegate_permission/common.handle_all_urls'],
    target: { namespace: 'android_app', package_name: app.android.package, sha256_cert_fingerprints: sha },
  }], null, 2) + '\n')
  console.log('✓ assetlinks.json for', app.android.package)
}

const team = String(process.env.APPLE_TEAM_ID || '').trim().toUpperCase()
if (team) {
  if (!/^[A-Z0-9]{10}$/.test(team)) { console.error('An Apple team id is 10 letters and digits'); process.exit(1) }
  fs.writeFileSync(path.join(out, 'apple-app-site-association'), JSON.stringify({
    applinks: { details: [{ appIDs: [`${team}.${app.ios.bundleIdentifier}`], components: [{ '/': '/invite/*' }, { '/': '/reset-password' }] }] },
  }, null, 2) + '\n')
  console.log('✓ apple-app-site-association for', `${team}.${app.ios.bundleIdentifier}`)
}
if (!sha.length && !team) console.log('Nothing written: set ANDROID_SHA256 and/or APPLE_TEAM_ID (see the top of this file).')
