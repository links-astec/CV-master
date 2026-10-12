// The HTML pages the app's WebViews show: the editor's CV page and the grid of layout previews.
// Both draw the website's own renderer output. Messages back to the app go through
// window.ReactNativeWebView (the phone) or the parent window (the web stand-ins for screenshots).
import { PAGE_W, PAGE_H } from '@web/composables/cvRenderer.js'

export type PageInfo = { overflow: boolean; overBy: number; zoom: number }
export type GridItem = { id: string; html: string; name: string; badge?: { text: string; bg: string; fg: string } }

const POST = `function post(m){var s=JSON.stringify(m);if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(s);else if(window.parent!==window)window.parent.postMessage(s,'*')}`
const esc = (s: string) => s.replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]!))

// The editor's page. Same one-page check as the website (pageFit.js and the server's PDF step):
// the CV is measured at 700px; if it is taller than one 990px page, the largest zoom that fits is
// found, and either applied ("Shrink to fit" accepted) or the end of page 1 is marked.
export function previewDocument(o: { cv: string; fontCss: string; canvas: string; zoomed: boolean; shrink: boolean; endLabel: string }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=4">
${o.fontCss}
<style>
  html,body{margin:0;padding:0;background:${o.canvas};-webkit-text-size-adjust:100%;text-size-adjust:100%}
  .stage{padding:12px 12px 120px;overflow-x:auto}
  .page{position:relative;width:${PAGE_W}px;min-height:${PAGE_H}px;margin:0 auto;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.12),0 10px 30px rgba(0,0,0,.12);border-radius:2px;overflow:hidden}
  .over{position:absolute;left:0;right:0;top:${PAGE_H}px;bottom:0;pointer-events:none;
    background:repeating-linear-gradient(-45deg,rgba(220,38,38,.05) 0 10px,rgba(220,38,38,.10) 10px 20px)}
  .brk{position:absolute;left:0;right:0;top:${PAGE_H}px;height:0;border-top:2px dashed #dc2626;pointer-events:none}
  .brk span{position:absolute;right:10px;top:-11px;background:#dc2626;color:#fff;font:600 11px/22px -apple-system,system-ui,sans-serif;padding:0 8px;border-radius:6px;white-space:nowrap}
</style></head><body>
<div class="stage"><div class="page" id="page">${o.cv}</div></div>
<script>
${POST}
var W=${PAGE_W},H=${PAGE_H},SHRINK=${o.shrink ? 'true' : 'false'},ZOOMED=${o.zoomed ? 'true' : 'false'};
var page=document.getElementById('page'), root=page.querySelector('[data-cv-root]')||page.firstElementChild;
function scale(){ return ZOOMED ? 0.9 : Math.min(1,(window.innerWidth-24)/W); }
function applyZoom(z){ root.style.zoom=String(z); root.style.width=(W/z)+'px'; root.style.maxWidth='none'; root.style.minHeight=(H/z)+'px'; }
function clearZoom(){ root.style.zoom=''; root.style.width=''; root.style.maxWidth=''; root.style.minHeight=''; }
function height(){ return root.getBoundingClientRect().height; }
function measure(){
  page.style.zoom='1'; clearZoom();
  var h=height(), over=h>H+1, best=1;
  if(over){ var lo=0.5,hi=1; best=0.5; for(var i=0;i<9;i++){ var mid=(lo+hi)/2; applyZoom(mid); if(height()<=H+1){best=mid;lo=mid}else{hi=mid} } clearZoom(); }
  return { h:h, overflow:over, overBy: over ? h/H-1 : 0, zoom: over ? best : 1 };
}
function draw(){
  if(!root) return;
  var m=measure(), s=scale();
  var old=page.querySelectorAll('.over,.brk'); for(var i=0;i<old.length;i++) old[i].remove();
  if(m.overflow && SHRINK){ applyZoom(m.zoom); page.style.height=H+'px'; }
  else { page.style.height=''; }
  if(m.overflow && !SHRINK){
    var ov=document.createElement('div'); ov.className='over'; page.appendChild(ov);
    var b=document.createElement('div'); b.className='brk';
    // The page is scaled to the screen; the marker is scaled back so it stays readable
    b.style.borderTopWidth=(2/s)+'px';
    var l=document.createElement('span'); l.textContent=${JSON.stringify(o.endLabel)};
    l.style.fontSize=(12/s)+'px'; l.style.lineHeight=(24/s)+'px'; l.style.padding='0 '+(9/s)+'px'; l.style.borderRadius=(7/s)+'px';
    l.style.top=(-12/s)+'px'; l.style.right=(10/s)+'px';
    b.appendChild(l); page.appendChild(b);
  }
  page.style.zoom=String(s);
  post({ type:'page', overflow:m.overflow, overBy:m.overBy, zoom:m.zoom });
}
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(draw);
window.addEventListener('resize', function(){ page.style.zoom=String(scale()); });
</script>
</body></html>`
}

// A grid of layout previews (2 per row, like the website on a phone). Tapping one sends its id.
// The selection is changed from the app with select(id), so the grid doesn't reload.
export function gridDocument(o: {
  items: GridItem[]; selected: string; fontCss: string
  colors: { bg: string; text: string; text2: string; border: string; accent: string; ring: string; surface: string }
}) {
  const c = o.colors
  const cards = o.items.map(it => `<button class="card${it.id === o.selected ? ' on' : ''}" data-id="${esc(it.id)}">
<div class="thumb"><div class="inner">${it.html}</div></div>
<div class="foot"><span class="name">${esc(it.name)}</span>${it.badge ? `<span class="badge" style="background:${it.badge.bg};color:${it.badge.fg}">${esc(it.badge.text)}</span>` : ''}</div>
</button>`).join('')
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
${o.fontCss}
<style>
  html,body{margin:0;padding:0;background:${c.bg};-webkit-text-size-adjust:100%;text-size-adjust:100%;-webkit-tap-highlight-color:transparent}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px 12px;padding:2px 2px 8px}
  .card{display:flex;flex-direction:column;gap:7px;padding:0;margin:0;border:0;background:none;text-align:left;font:inherit;cursor:pointer}
  .thumb{position:relative;width:100%;aspect-ratio:700/990;overflow:hidden;background:#fff;border-radius:8px;border:1px solid ${c.border};box-shadow:0 1px 2px rgba(0,0,0,.06);transition:box-shadow .15s,border-color .15s}
  .inner{position:absolute;top:0;left:0;width:700px;transform-origin:top left;pointer-events:none}
  .card.on .thumb{border-color:${c.accent};box-shadow:0 0 0 3px ${c.ring}}
  .card:active .thumb{opacity:.85}
  .foot{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:0 2px}
  .name{font:600 14px/1.3 -apple-system,system-ui,sans-serif;color:${c.text}}
  .card.on .name{color:${c.accent}}
  .badge{font:600 11px/1 -apple-system,system-ui,sans-serif;padding:4px 7px;border-radius:99px}
</style></head><body>
<div class="grid" id="grid">${cards}</div>
<script>
${POST}
function fit(){
  var t=document.querySelectorAll('.thumb');
  for(var i=0;i<t.length;i++){ t[i].firstElementChild.style.transform='scale('+(t[i].clientWidth/700)+')'; }
  post({ type:'height', h: document.getElementById('grid').getBoundingClientRect().height + 10 });
}
function select(id){
  var cs=document.querySelectorAll('.card');
  for(var i=0;i<cs.length;i++) cs[i].classList.toggle('on', cs[i].getAttribute('data-id')===id);
}
document.getElementById('grid').addEventListener('click', function(e){
  var b=e.target.closest('.card'); if(b) post({ type:'pick', id:b.getAttribute('data-id') });
});
window.addEventListener('message', function(e){ try{ var m=JSON.parse(e.data); if(m.select!==undefined) select(m.select) }catch(_){} });
fit(); window.addEventListener('resize', fit);
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(fit);
</script>
</body></html>`
}
