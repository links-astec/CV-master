// After `vite build`: the face check's WebAssembly (from @mediapipe/tasks-vision, ~13 MB) goes into the site,
// so it isn't kept in the repository. It's only downloaded when someone starts a Video interview.
import fs from 'fs'
import path from 'path'
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..')
const from = path.join(root, 'node_modules', '@mediapipe', 'tasks-vision', 'wasm')
const to = path.join(root, 'dist', 'mediapipe', 'wasm')
fs.mkdirSync(to, { recursive: true })
for (const f of ['vision_wasm_internal.js', 'vision_wasm_internal.wasm']) fs.copyFileSync(path.join(from, f), path.join(to, f))
console.log('copy-mediapipe: face check files copied')
