// Lists interface text the app uses that has no translation yet.
// The app uses the website's dictionaries (../craftcv/src/i18n) plus its own src/i18n/extra.ts.
//   node scripts/i18n-missing.mjs
import fs from 'fs'
import path from 'path'
import { pathToFileURL, fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const files = []
;(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f)
    if (fs.statSync(p).isDirectory()) walk(p)
    else if (/\.tsx?$/.test(f)) files.push(p)
  }
})(path.join(root, 'src'))

// t('...') with single-quoted text
const keys = new Set()
for (const f of files) {
  for (const m of fs.readFileSync(f, 'utf8').matchAll(/\bt\(\s*'((?:[^'\\]|\\.)*)'/g)) keys.add(m[1].replace(/\\'/g, "'"))
}

const web = path.join(root, '..', 'craftcv', 'src', 'i18n')
const { PARTS } = await import(pathToFileURL(path.join(web, 'fr.js')).href)
const FR = Object.assign({}, ...Object.values(PARTS))
const extraFile = path.join(root, 'src', 'i18n', 'extra.json')
const EXTRA = fs.existsSync(extraFile) ? JSON.parse(fs.readFileSync(extraFile, 'utf8')) : {}

let bad = 0
for (const lang of ['fr', 'es', 'de', 'it', 'pt', 'zh']) {
  const dict = lang === 'fr' ? FR : (await import(pathToFileURL(path.join(web, `${lang}.js`)).href)).default
  const missing = [...keys].filter(k => !dict[k] && !EXTRA[lang]?.[k])
  if (missing.length) { bad += missing.length; console.log(`${lang}: ${missing.length} missing: ${JSON.stringify(missing)}`) }
}
console.log(`${keys.size} texts used in the app${bad ? '' : ', all translated in every language'}`)
process.exit(bad ? 1 : 0)
