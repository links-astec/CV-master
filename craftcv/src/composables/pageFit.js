// One-page fitting — the browser twin of the server's PDF fit (server/index.js,
// renderPdfFromHtml). Both measure the CV root at 700px and, if it is taller than one
// 990px page, find the largest zoom at which it fits while still filling the page width.
// Keep the two algorithms identical so the preview matches the exported PDF.
import { PAGE_W, PAGE_H } from './cvRenderer.js'

export { PAGE_W, PAGE_H }

// Below this zoom the text gets noticeably small, so the UI warns more firmly.
export const SMALL_TEXT_ZOOM = 0.82

const CV_FONTS = [
  '400 12px "DM Sans"', '600 12px "DM Sans"', '700 12px "DM Sans"', '400 12px "DM Serif Display"',
  '400 12px Inter', '600 12px Inter', '400 12px Lora', '600 12px Lora',
]
let fontsReady = null
function ensureCvFonts() {
  if (!fontsReady) fontsReady = Promise.all(CV_FONTS.map(f => document.fonts?.load(f).catch(() => {})))
  return fontsReady
}

function applyZoom(root, z) {
  root.style.zoom      = String(z)
  root.style.width     = `${PAGE_W / z}px`
  root.style.maxWidth  = 'none'
  root.style.minHeight = `${PAGE_H / z}px`
}

// Largest zoom (0.5–1) at which the root fits one page. Same search as the server.
function findFitZoom(root) {
  const height = () => root.getBoundingClientRect().height
  if (height() <= PAGE_H + 1) return 1
  let lo = 0.5, hi = 1, best = 0.5
  for (let i = 0; i < 9; i++) {
    const mid = (lo + hi) / 2
    applyZoom(root, mid)
    if (height() <= PAGE_H + 1) { best = mid; lo = mid } else { hi = mid }
  }
  return best
}

// Measure a rendered CV (HTML string) off-screen.
// → { height, overflow, overBy (0.12 = 12% too long), zoom (shrink needed to fit, 1 = none) }
export async function analysePage(html) {
  await ensureCvFonts()
  const box = document.createElement('div')
  box.setAttribute('aria-hidden', 'true')
  box.style.cssText = 'position:fixed;left:-20000px;top:0;width:700px;visibility:hidden;pointer-events:none'
  box.innerHTML = html
  document.body.appendChild(box)
  try {
    const root = box.querySelector('[data-cv-root]')
    if (!root) return { height: 0, overflow: false, overBy: 0, zoom: 1 }
    const height = root.getBoundingClientRect().height
    const overflow = height > PAGE_H + 1
    return { height, overflow, overBy: overflow ? height / PAGE_H - 1 : 0, zoom: overflow ? findFitZoom(root) : 1 }
  } finally {
    box.remove()
  }
}

// The same HTML with the shrink-to-fit zoom applied to the CV root.
export function withFitZoom(html, zoom) {
  if (!zoom || zoom >= 1) return html
  const z = Math.round(zoom * 10000) / 10000
  return html.replace(/(data-cv-root[^>]*?style=")/,
    `$1zoom:${z};width:${(PAGE_W / z).toFixed(2)}px;max-width:none;min-height:${(PAGE_H / z).toFixed(2)}px;`)
}

// Full HTML document sent to the server for PDF rendering (the server does the fitting).
export function exportDocument(cvHtml) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>CV</title>`
    + `<style>*{box-sizing:border-box;margin:0;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}`
    + `html,body{background:#fff;width:700px;margin:0;padding:0}@page{margin:0}</style>`
    + `</head><body>${cvHtml}</body></html>`
}
