// ── BLOG: articles, product updates, news, and links shared from elsewhere ──────
// Written in Markdown in the admin and turned into HTML when saved. Pages are complete HTML
// served from here (www.cvmaster.live/blog is passed through to this server by Vercel), so
// search engines and link previews (WhatsApp, LinkedIn…) see the real title, text and image.
// A post can have translations (same group, another language); readers get their language,
// or English. "Link" posts share someone else's article: our own short summary and a link
// to the original, never a copy of it.
import express from 'express';
import { Marked } from 'marked';
import multer from 'multer';
import { query } from './db.js';
import { translate } from './push.js';
import { lockupThemed, markThemed } from '../brand/brand.mjs';

const SITE = 'https://www.cvmaster.live';
export const BLOG_LANGS = ['en', 'fr', 'es', 'de', 'it', 'pt', 'zh'];
export const CATEGORIES = { article: 'Articles', update: 'Product updates', news: 'News', link: 'From around the web' };

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = (u, { images = false } = {}) => {
  const s = String(u || '').trim();
  if (/^https:\/\//i.test(s) || /^\/(?!\/)/.test(s) || /^mailto:/i.test(s)) return s;
  if (images && /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(s)) return s;
  return '';
};

// Markdown → HTML: no raw HTML from the text, only safe links and images. Headings get an id
// so the "On this page" list can link to them.
let _headings = null;
const md = new Marked({ gfm: true });
md.use({ renderer: {
  html(t) { return esc(t.text); },
  heading(t) {
    const inner = this.parser.parseInline(t.tokens);
    const base = slugify(t.text);
    let id = base;
    for (let i = 2; _headings.ids.has(id); i++) id = `${base}-${i}`;
    _headings.ids.add(id);
    if (t.depth === 2) _headings.toc.push({ id, text: t.text.replace(/[*_`]/g, '') });
    return `<h${t.depth} id="${id}">${inner}</h${t.depth}>\n`;
  },
  link(t) {
    const href = safeUrl(t.href);
    const text = this.parser.parseInline(t.tokens);
    if (!href) return text;
    const ours = href.startsWith('/') || href.startsWith(SITE);
    return `<a href="${esc(href)}"${ours ? '' : ' target="_blank" rel="noopener nofollow"'}>${text}</a>`;
  },
  image(t) {
    const src = safeUrl(t.href, { images: true });
    if (!src) return '';
    return `<figure><img src="${esc(src)}" alt="${esc(t.text)}" loading="lazy">${t.title ? `<figcaption>${esc(t.title)}</figcaption>` : ''}</figure>`;
  },
} });
export const renderArticle = (text) => {
  _headings = { ids: new Set(), toc: [] };
  try { return { html: md.parse(String(text || '').slice(0, 200000)), toc: _headings.toc }; } finally { _headings = null; }
};
export const renderMarkdown = (text) => renderArticle(text).html;
const readingMin = (text) => Math.max(1, Math.round(String(text || '').split(/\s+/).filter(Boolean).length / 220));

export const slugify = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'post';

let _ready = null;
export function ensureBlog() {
  if (!_ready) _ready = (async () => {
    await query(`CREATE TABLE IF NOT EXISTS posts (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        group_id     UUID NOT NULL DEFAULT gen_random_uuid(),
        lang         TEXT NOT NULL DEFAULT 'en',
        slug         TEXT UNIQUE NOT NULL,
        title        TEXT NOT NULL,
        excerpt      TEXT NOT NULL DEFAULT '',
        body_md      TEXT NOT NULL DEFAULT '',
        body_html    TEXT NOT NULL DEFAULT '',
        cover_url    TEXT,
        category     TEXT NOT NULL DEFAULT 'article',
        source_name  TEXT,
        source_url   TEXT,
        status       TEXT NOT NULL DEFAULT 'draft',
        author       TEXT,
        views        INT NOT NULL DEFAULT 0,
        published_at TIMESTAMPTZ,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
    await query('CREATE INDEX IF NOT EXISTS posts_pub ON posts(status, published_at DESC)');
    await query(`CREATE TABLE IF NOT EXISTS post_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(), mime TEXT NOT NULL, data BYTEA NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
  })().catch(e => { _ready = null; throw e; });
  return _ready;
}

// Published posts for readers of `lang`: each post once, in their language if translated, else
// in English, else as written
export async function listPosts({ lang = 'en', category = null, limit = 20, offset = 0, q = '' } = {}) {
  await ensureBlog();
  const L = BLOG_LANGS.includes(lang) ? lang : 'en';
  const p = [L];
  let where = `status = 'published'`;
  if (category && CATEGORIES[category]) { p.push(category); where += ` AND category = $${p.length}`; }
  const words = String(q || '').trim().slice(0, 80);
  if (words) { p.push(`%${words.replace(/[\\%_]/g, '\\$&')}%`); where += ` AND (title ILIKE $${p.length} OR excerpt ILIKE $${p.length} OR body_md ILIKE $${p.length})`; }
  p.push(Math.min(50, Math.max(1, limit)), Math.max(0, offset));
  const { rows } = await query(`SELECT * FROM (
      SELECT DISTINCT ON (group_id) id, group_id, lang, slug, title, excerpt, cover_url, category, source_name, source_url, published_at, body_md, author
      FROM posts WHERE ${where}
      ORDER BY group_id, (lang = $1) DESC, (lang = 'en') DESC, published_at ASC) x
    ORDER BY published_at DESC LIMIT $${p.length - 1} OFFSET $${p.length}`, p);
  return rows.map(r => ({ ...publicCard(r) }));
}
const publicCard = (r) => ({
  slug: r.slug, lang: r.lang, title: r.title, excerpt: r.excerpt, cover: r.cover_url, category: r.category,
  sourceName: r.source_name, sourceUrl: r.source_url, publishedAt: r.published_at, readingMin: readingMin(r.body_md),
  author: r.author || 'CVMaster team', url: `${SITE}/blog/${r.slug}`,
});

async function postBySlug(slug) {
  await ensureBlog();
  const post = (await query(`SELECT * FROM posts WHERE slug = $1 AND status = 'published'`, [String(slug).slice(0, 120)])).rows[0];
  if (!post) return null;
  const versions = (await query(`SELECT lang, slug FROM posts WHERE group_id = $1 AND status = 'published'`, [post.group_id])).rows;
  return { post, versions };
}

// ── Pages (complete HTML, in the post's language) ──
const T = async (lang, s) => translate(lang, s);
const Ts = async (lang, list) => Object.fromEntries(await Promise.all(list.map(async s => [s, await T(lang, s)])));
const LOGO = markThemed({ id: 'blm', height: 30 });
const LOCKUP = (id) => lockupThemed({ id, height: 26 });
const ICON = {
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>',
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.69.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35zM12.05 21.78h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88zm8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.41z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M24 12.07C24 5.45 18.63.07 12 .07S0 5.45 0 12.07c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.38C19.61 23.03 24 18.06 24 12.07z"/></svg>',
  email: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
  link: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  rss: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1.2" fill="currentColor"/></svg>',
};
const CSS = `
:root{--logo-from:#14142B;--logo-to:#4338CA;--logo-text:#14142B;--bg:#fff;--bg2:#f7f7fc;--s:#fff;--b:#e8e8f1;--t:#14142b;--t2:#4a4a63;--t3:#6b6b84;--ac:#4338ca;--ac2:#6d63ff;--acl:#eef0ff}
@media (prefers-color-scheme:dark){:root:not(.light){--logo-from:#F3F4F6;--logo-to:#8B85FF;--logo-text:#F3F4F6;--bg:#0c0c10;--bg2:#111117;--s:#15151b;--b:#26262e;--t:#f3f4f6;--t2:#b3b7c2;--t3:#8b909c;--ac:#8b85ff;--ac2:#a5a0ff;--acl:#1f1d3d}}
.dark{--logo-from:#F3F4F6;--logo-to:#8B85FF;--logo-text:#F3F4F6;--bg:#0c0c10;--bg2:#111117;--s:#15151b;--b:#26262e;--t:#f3f4f6;--t2:#b3b7c2;--t3:#8b909c;--ac:#8b85ff;--ac2:#a5a0ff;--acl:#1f1d3d}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--t);font:16px/1.6 'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--ac)}img{max-width:100%}
.in{max-width:1160px;margin:0 auto;padding-left:24px;padding-right:24px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--ac);color:#fff!important;text-decoration:none;font-weight:700;padding:0 20px;height:42px;border-radius:999px;font-size:14.5px;border:0;cursor:pointer;font-family:inherit;white-space:nowrap}
.btn svg{width:17px;height:17px}.btn.ghost{background:var(--s);color:var(--t)!important;border:1px solid var(--b)}
.kicker{font-size:14px;font-weight:700;color:var(--ac);text-decoration:none}
.progress{position:fixed;top:0;left:0;height:3px;width:0;background:linear-gradient(90deg,var(--ac),var(--ac2));z-index:30}
/* Header */
.top{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--bg) 88%,transparent);-webkit-backdrop-filter:saturate(1.6) blur(12px);backdrop-filter:saturate(1.6) blur(12px);border-bottom:1px solid var(--b)}
.top .in{height:66px;display:flex;align-items:center;gap:16px}
.brand{display:flex;align-items:center;text-decoration:none}.brand svg{display:block;height:26px;width:auto}
.sep{width:1px;height:22px;background:var(--b)}.blog-l{font-weight:700;color:var(--t2);text-decoration:none;font-size:16px}
.top nav{margin-left:auto;display:flex;align-items:center;gap:24px}.top nav .nl{color:var(--t2);text-decoration:none;font-weight:600;font-size:14.5px}.top nav .nl:hover{color:var(--t)}
/* Blog home */
.hero{background:var(--bg2);border-bottom:1px solid var(--b)}
.hero .in{padding-top:56px}
.hero-row{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap}
.hero h1{font-size:clamp(36px,6vw,56px);line-height:1.04;letter-spacing:-.035em;margin:0}
.hero p{font-size:18px;color:var(--t2);margin:12px 0 0;max-width:560px}
.search{display:flex;align-items:center;gap:8px;background:var(--s);border:1px solid var(--b);border-radius:999px;padding:0 5px 0 16px;height:46px;width:min(360px,100%);color:var(--t3)}
.search svg{width:18px;height:18px;flex-shrink:0}.search input{flex:1;min-width:0;border:0;background:transparent;font:inherit;font-size:15px;color:var(--t);outline:0}
.search:focus-within{border-color:var(--ac);box-shadow:0 0 0 3px var(--acl)}.search .btn{height:36px;padding:0 16px;border-radius:999px;font-size:14px}
.cats{display:flex;gap:28px;margin-top:36px;overflow-x:auto;scrollbar-width:none}.cats::-webkit-scrollbar{display:none}
.cats a{padding:12px 0 14px;border-bottom:2px solid transparent;color:var(--t2);font-weight:600;text-decoration:none;white-space:nowrap;font-size:15px}
.cats a:hover{color:var(--t)}.cats a.on{color:var(--t);border-color:var(--ac)}
.page{padding-top:48px;padding-bottom:72px}.page .nlb{margin-top:80px}
.feat{display:grid;grid-template-columns:1.15fr 1fr;gap:48px;align-items:center;text-decoration:none;color:var(--t);margin-bottom:64px;padding-bottom:56px;border-bottom:1px solid var(--b)}
.feat h2{font-size:clamp(26px,3.2vw,40px);line-height:1.1;letter-spacing:-.03em;margin:10px 0 14px}
.feat p{font-size:18px;line-height:1.6;color:var(--t2);margin:0 0 18px}
.meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:14px;color:var(--t3)}.meta .dot{opacity:.6}
.feat:hover h2,.card:hover h3{text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:4px}
.feat.solo{border-bottom:0;padding-bottom:0;margin-bottom:0}
.more{display:inline-flex;align-items:center;gap:6px;font-weight:700;color:var(--ac);text-decoration:none}.more svg{width:16px;height:16px}
.img{display:block;overflow:hidden;aspect-ratio:16/9;background:linear-gradient(135deg,var(--acl),var(--bg2));border-radius:8px;position:relative}
.img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .35s ease}
.img .ph{position:absolute;inset:0;display:grid;place-items:center}.img .ph svg{width:22%;height:auto;opacity:.35}
.feat:hover .img img,.card:hover .img img{transform:scale(1.02)}
.sec{display:flex;align-items:baseline;justify-content:space-between;gap:16px;margin:0 0 22px;padding-bottom:14px;border-bottom:1px solid var(--b)}
.sec h2{font-size:22px;margin:0;letter-spacing:-.015em}
.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:40px 28px}
.card{display:flex;flex-direction:column;text-decoration:none;color:var(--t)}
.card .meta{margin-top:16px}.card h3{font-size:20px;line-height:1.3;margin:6px 0 8px;letter-spacing:-.015em}
.card p{color:var(--t2);font-size:15px;margin:0 0 16px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.by{display:flex;align-items:center;gap:10px;color:var(--t3);font-size:13.5px;margin-top:auto}.by b{color:var(--t);font-weight:700}
.av{width:30px;height:30px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;background:var(--acl);color:var(--ac);font-weight:800;font-size:12px;overflow:hidden}.av .logo-mark{width:68%;height:auto}
.empty{padding:70px 20px;text-align:center;color:var(--t3);font-size:16px}
.pager{display:flex;justify-content:space-between;gap:12px;margin-top:52px}
/* Newsletter */
.nlb{margin-top:24px;padding-top:28px;border-top:2px solid var(--t);display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start;color:var(--t)}
.nlb h2{font-size:24px;line-height:1.2;margin:0 0 8px;letter-spacing:-.02em}.nlb p{margin:0;color:var(--t2);font-size:16px;max-width:440px}
.nlb form{display:flex;gap:8px;margin-top:4px}.nlb input[type=email]{flex:1;min-width:0;height:46px;border-radius:999px;border:1px solid var(--b);padding:0 18px;font:inherit;font-size:15.5px;color:var(--t);background:var(--s);outline:0}
.nlb input[type=email]:focus{border-color:var(--ac)}
.nlb button{height:46px;border:0;border-radius:999px;padding:0 22px;background:var(--t);color:var(--bg);font:inherit;font-weight:700;font-size:15px;cursor:pointer}
.nlb small{display:block;margin-top:10px;color:var(--t3);font-size:13px}.nlb .msg{margin-top:4px;font-weight:600;font-size:15.5px;color:var(--t)}
.hp{position:absolute!important;left:-9999px!important;width:1px;height:1px;overflow:hidden}
/* Article */
.art-h{padding-top:40px}.art-h .hd{max-width:780px}
.crumbs{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:14px;color:var(--t3)}.crumbs a{color:var(--t3);text-decoration:none}.crumbs a:hover{color:var(--ac)}.crumbs a.kicker{color:var(--ac)}
.art-h h1{font-size:clamp(32px,5vw,52px);line-height:1.07;letter-spacing:-.035em;margin:16px 0 16px}
.dek{font-size:20px;line-height:1.55;color:var(--t2);margin:0 0 26px}
.byline{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:16px 0;border-top:1px solid var(--b);border-bottom:1px solid var(--b)}
.byline .who{display:flex;align-items:center;gap:12px}.byline .av{width:46px;height:46px;font-size:15px}.byline b{display:block;font-size:15.5px}.byline span{color:var(--t3);font-size:14px}
.share{display:flex;gap:8px;flex-wrap:wrap}
.share a,.share button{width:40px;height:40px;border-radius:50%;border:1px solid var(--b);background:var(--s);color:var(--t2);display:grid;place-items:center;cursor:pointer;padding:0;transition:color .15s,border-color .15s}
.share svg{width:17px;height:17px}.share a:hover,.share button:hover{color:var(--ac);border-color:var(--ac)}
.cover{margin-top:34px}.cover img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:10px;display:block;background:var(--acl)}
.art{display:grid;grid-template-columns:minmax(0,720px) 270px;gap:64px;justify-content:space-between;padding-top:48px;padding-bottom:56px}
.side .stick{position:sticky;top:96px}
.toc h4{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin:0 0 12px}
.toc ol{list-style:none;margin:0;padding:0;border-left:2px solid var(--b)}
.toc a{display:block;padding:7px 0 7px 16px;margin-left:-2px;border-left:2px solid transparent;color:var(--t2);text-decoration:none;font-size:14px;line-height:1.4}
.toc a:hover{color:var(--t)}.toc a.on{color:var(--ac);border-color:var(--ac);font-weight:700}
.side-cta{margin-top:30px;padding:22px;border-radius:10px;background:var(--bg2);border:1px solid var(--b)}.side-cta h4{margin:0 0 6px;font-size:17px;line-height:1.3}.side-cta p{margin:0 0 16px;color:var(--t2);font-size:14px;line-height:1.55}.side-cta .btn{width:100%}
.toc-m{display:none;border:1px solid var(--b);border-radius:14px;padding:0 18px;margin:0 0 30px;background:var(--bg2)}
.toc-m summary{font-weight:700;padding:14px 0;cursor:pointer;list-style:none;display:flex;justify-content:space-between}.toc-m summary::-webkit-details-marker{display:none}.toc-m summary:after{content:'+';color:var(--t3);font-weight:600}.toc-m[open] summary:after{content:'−'}
.toc-m ol{margin:0 0 14px;padding-left:20px}.toc-m li{margin:6px 0}.toc-m a{color:var(--t2);text-decoration:none}
.prose{font-size:18.5px;line-height:1.78;color:var(--t);overflow-wrap:break-word}
.prose h2{font-size:28px;line-height:1.25;letter-spacing:-.02em;margin:50px 0 14px;scroll-margin-top:90px}
.prose h3{font-size:21px;line-height:1.35;margin:36px 0 10px;scroll-margin-top:90px}
.prose>:first-child{margin-top:0}.prose p{margin:0 0 24px}
.prose a{color:var(--ac);text-decoration:underline;text-decoration-thickness:1.5px;text-underline-offset:3px}
.prose ul,.prose ol{padding-left:24px;margin:0 0 24px}.prose li{margin:8px 0;padding-left:4px}.prose li::marker{color:var(--ac);font-weight:700}
.prose blockquote{margin:40px 0;padding:2px 0 2px 26px;border-left:4px solid var(--ac);font-size:24px;line-height:1.45;font-weight:700;letter-spacing:-.015em;color:var(--t)}.prose blockquote p{margin:0}
.prose figure{margin:34px 0}.prose img{border-radius:14px;display:block}.prose figcaption{font-size:14px;color:var(--t3);margin-top:10px;text-align:center}
.prose code{background:var(--acl);padding:2px 6px;border-radius:6px;font-size:.88em}.prose pre{background:var(--bg2);border:1px solid var(--b);padding:16px;border-radius:14px;overflow:auto;font-size:15px}.prose pre code{background:none;padding:0}
.prose table{border-collapse:collapse;width:100%;margin:0 0 24px;font-size:16px;display:block;overflow-x:auto}.prose td,.prose th{border:1px solid var(--b);padding:10px 12px;text-align:left}.prose th{background:var(--bg2)}
.prose hr{border:0;border-top:1px solid var(--b);margin:44px 0}
.source{margin:30px 0;padding:22px;border:1px solid var(--b);border-radius:16px;background:var(--bg2)}.source b{display:block;margin-bottom:12px}
.langs{margin-top:28px;font-size:14px;color:var(--t3)}.langs a{margin-right:12px}
.end{margin-top:48px;padding-top:24px;border-top:1px solid var(--b);display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}.end b{font-size:16px}
.author{display:flex;gap:18px;align-items:flex-start;margin-top:26px;padding:24px;border-radius:10px;background:var(--bg2);border:1px solid var(--b)}
.author .av{width:58px;height:58px;font-size:18px}.author small{display:block;color:var(--t3);font-size:12px;text-transform:uppercase;letter-spacing:.08em;font-weight:700}.author b{display:block;font-size:17px;margin:2px 0 6px}.author p{margin:0;color:var(--t2);font-size:15px;line-height:1.6}
.cta-m{display:none;margin-top:30px;padding:26px;border-radius:10px;background:var(--bg2);border:1px solid var(--b);text-align:center}.cta-m h3{margin:0 0 6px;font-size:21px}.cta-m p{margin:0 0 16px;color:var(--t2)}
.related{background:var(--bg2);border-top:1px solid var(--b)}.related .in{padding-top:56px;padding-bottom:72px}.related .nlb{margin-top:64px}.related .nlb:first-child{margin-top:0}
.toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,20px);background:#14142b;color:#fff;padding:11px 18px;border-radius:12px;font-weight:700;font-size:14px;opacity:0;pointer-events:none;transition:all .25s;z-index:40}.toast.show{opacity:1;transform:translate(-50%,0)}
/* Footer */
.foot{border-top:1px solid var(--b)}.foot .cols{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:32px;padding-top:52px;padding-bottom:28px}
.foot p{color:var(--t3);font-size:14.5px;max-width:300px;margin:14px 0 0}
.foot h5{font-size:12.5px;text-transform:uppercase;letter-spacing:.08em;color:var(--t3);margin:4px 0 12px}
.foot .cols a:not(.brand){display:flex;align-items:center;gap:7px;color:var(--t2);text-decoration:none;font-size:14.5px;padding:4px 0}.foot .cols a:not(.brand):hover{color:var(--ac)}.foot .cols a:not(.brand) svg{width:15px;height:15px}
.foot .copy{border-top:1px solid var(--b);padding-top:20px;padding-bottom:28px;color:var(--t3);font-size:13.5px}
/* Inside the phone app: no site header, footer, sign-up or share buttons (the app has its own) */
.app .top,.app .foot,.app .nlb,.app .share,.app .end,.app .crumbs,.app .side-cta,.app .cta-m{display:none!important}.app .art-h{padding-top:22px}.app .art-h h1{margin-top:0}
@media (max-width:1000px){.art{grid-template-columns:minmax(0,1fr);gap:0}.side{display:none}.toc-m,.cta-m{display:block}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.top nav .nl{display:none}}
@media (max-width:820px){.feat{grid-template-columns:1fr;gap:22px}.nlb{grid-template-columns:1fr;gap:18px}.foot .cols{grid-template-columns:1fr 1fr}.foot .about{grid-column:1/-1}}
@media (max-width:620px){.in{padding-left:18px;padding-right:18px}.grid{grid-template-columns:1fr}.hero .in{padding-top:38px}.hero p{font-size:16.5px}.cats{margin-top:26px;gap:22px}
  .page{padding-top:30px}.feat{margin-bottom:44px;padding-bottom:40px}.art-h{padding-top:24px}.dek{font-size:18px}.cover{margin-top:24px}.cover img{border-radius:8px}.art{padding-top:32px}
  .prose{font-size:17.5px;line-height:1.75}.prose h2{font-size:24px;margin-top:40px}.prose blockquote{font-size:21px;padding-left:18px}.nlb form{flex-direction:column}.nlb input[type=email]{flex:none;width:100%}.nlb h2{font-size:22px}
  .top .in{height:60px}.top .btn{height:38px;padding:0 14px;font-size:14px}.sep,.blog-l{display:none}.byline .share{width:100%}.search{width:100%}}
@media (max-width:380px){.top .btn{display:none}}`;

// Little page script: reading progress, copy link, and which heading you're on
const JS = `(function(){
var bar=document.querySelector('.progress'),body=document.querySelector('.prose');
if(bar&&body){var f=function(){var r=body.getBoundingClientRect(),h=r.height-innerHeight*.6;bar.style.width=(h>0?Math.min(1,Math.max(0,-r.top/h)):0)*100+'%'};addEventListener('scroll',f,{passive:true});f()}
var toast=document.querySelector('.toast');
document.querySelectorAll('[data-copy]').forEach(function(b){b.addEventListener('click',function(){var u=b.getAttribute('data-copy');
var done=function(){if(toast){toast.classList.add('show');setTimeout(function(){toast.classList.remove('show')},1800)}};
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(u).then(done,function(){})}
else{var t=document.createElement('textarea');t.value=u;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();try{document.execCommand('copy');done()}catch(e){}document.body.removeChild(t)}})});
var links=[].slice.call(document.querySelectorAll('.toc a'));
if(links.length&&'IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)links.forEach(function(l){l.classList.toggle('on',l.getAttribute('href')==='#'+e.target.id)})})},{rootMargin:'0px 0px -75% 0px'});
links.forEach(function(l){var h=document.getElementById(l.getAttribute('href').slice(1));if(h)io.observe(h)})}
})();`;

const TEAM = 'CVMaster team';
const isTeam = (a) => !a || /cvmaster/i.test(a);
const avatar = (a) => `<span class="av">${isTeam(a) ? LOGO : esc(String(a).trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase())}</span>`;
const fmtDate = (d, lang) => { try { return new Date(d).toLocaleDateString({ en: 'en-GB', zh: 'zh-CN' }[lang] || lang, { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return ''; } };
const isoDate = (d) => { try { return new Date(d).toISOString(); } catch { return ''; } };

async function chrome(lang, { title, description, url, image, alternates = [], body, jsonld, app, theme, article = false }) {
  const t = await Ts(lang, ['Blog', 'Build my CV', 'Privacy', 'Terms', 'Contact', 'Free AI CV builder. Write, tailor and download a CV that gets you the interview.', 'Topics', 'Link copied', 'All posts', ...Object.values(CATEGORIES)]);
  const L = esc(lang);
  const cat = (k) => `<a href="${SITE}/blog?lang=${L}&amp;category=${k}">${esc(t[CATEGORIES[k]])}</a>`;
  return `<!DOCTYPE html><html lang="${L}" class="${app ? 'app' : ''} ${theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : ''}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title><meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">${alternates.map(a => `<link rel="alternate" hreflang="${esc(a.lang)}" href="${esc(a.url)}">`).join('')}
<meta property="og:site_name" content="CVMaster"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${esc(image || SITE + '/og-image.png')}"><meta property="og:type" content="${article ? 'article' : 'website'}">
<meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#4338ca"><link rel="icon" href="${SITE}/favicon.svg"><link rel="alternate" type="application/rss+xml" title="CVMaster blog" href="${SITE}/blog/feed.xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${CSS}</style>${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : ''}</head><body>
${article ? '<div class="progress"></div>' : ''}
<header class="top"><div class="in"><a class="brand" href="${SITE}/?lang=${L}" aria-label="CVMaster">${LOCKUP('blh')}</a><span class="sep"></span><a class="blog-l" href="${SITE}/blog?lang=${L}">${esc(t.Blog)}</a>
<nav>${['article', 'update', 'news'].map(k => `<a class="nl" href="${SITE}/blog?lang=${L}&amp;category=${k}">${esc(t[CATEGORIES[k]])}</a>`).join('')}<a class="btn" href="${SITE}/?lang=${L}">${esc(t['Build my CV'])}</a></nav></div></header>
${body}
<footer class="foot"><div class="in cols">
  <div class="about"><a class="brand" href="${SITE}/?lang=${L}" aria-label="CVMaster">${LOCKUP('blf')}</a><p>${esc(t['Free AI CV builder. Write, tailor and download a CV that gets you the interview.'])}</p></div>
  <div><h5>${esc(t.Topics)}</h5><a href="${SITE}/blog?lang=${L}">${esc(t['All posts'])}</a>${Object.keys(CATEGORIES).map(cat).join('')}</div>
  <div><h5>CVMaster</h5><a href="${SITE}/?lang=${L}">${esc(t['Build my CV'])}</a><a href="mailto:support@cvmaster.live">${esc(t.Contact)}</a><a href="${SITE}/blog/feed.xml">${ICON.rss} RSS</a></div>
  <div><h5>Legal</h5><a href="${SITE}/privacy">${esc(t.Privacy)}</a><a href="${SITE}/terms">${esc(t.Terms)}</a></div>
</div><div class="in copy">© ${new Date().getFullYear()} CVMaster</div></footer>
<div class="toast" role="status">${esc(t['Link copied'])}</div>
<script>${JS}</script>
</body></html>`;
}

// The newsletter box: a plain form (works without scripts), answered on the same page
async function newsletterBox(lang, back, state) {
  const t = await Ts(lang, ['Get CV tips in your inbox', 'Practical advice to write a better CV and land more interviews, plus what’s new in CVMaster.',
    'Your email address', 'Subscribe', 'No spam. Unsubscribe in one click, any time.',
    'Check your inbox: we’ve sent you a link to confirm.', 'You’re already subscribed. Thank you!', 'That didn’t work. Check your email address and try again.']);
  const msg = { ok: t['Check your inbox: we’ve sent you a link to confirm.'], already: t['You’re already subscribed. Thank you!'], error: t['That didn’t work. Check your email address and try again.'] }[state];
  return `<section class="nlb" id="subscribe"><div><h2>${esc(t['Get CV tips in your inbox'])}</h2><p>${esc(t['Practical advice to write a better CV and land more interviews, plus what’s new in CVMaster.'])}</p></div>
  <div>${state === 'ok' || state === 'already' ? `<div class="msg">${esc(msg)}</div>` : `<form method="post" action="/blog/subscribe">
    <input type="hidden" name="back" value="${esc(back)}"><input type="hidden" name="lang" value="${esc(lang)}">
    <label class="hp" aria-hidden="true">Website <input name="website" tabindex="-1" autocomplete="off"></label>
    <input type="email" name="email" required maxlength="200" autocomplete="email" placeholder="${esc(t['Your email address'])}" aria-label="${esc(t['Your email address'])}">
    <button type="submit">${esc(t.Subscribe)}</button></form>
    ${msg ? `<div class="msg">${esc(msg)}</div>` : `<small>${esc(t['No spam. Unsubscribe in one click, any time.'])}</small>`}`}</div></section>`;
}

const cardHtml = (p, { lang, app, cats, minRead }) => `<a class="card" href="${SITE}/blog/${esc(p.slug)}${app ? '?app=1' : ''}">
  <span class="img">${p.cover ? `<img src="${esc(p.cover)}" alt="" loading="lazy">` : `<span class="ph">${LOGO}</span>`}</span>
  <span class="meta"><span class="kicker">${esc(cats[p.category] || '')}</span><span class="dot">·</span><span>${esc(fmtDate(p.publishedAt, lang))}</span></span><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p>
  ${p.category !== 'link' ? `<span class="meta" style="margin-top:auto">${esc(minRead.replace('{n}', p.readingMin))}</span>` : p.sourceName ? `<span class="meta" style="margin-top:auto">${esc(p.sourceName)}</span>` : ''}</a>`;

async function articlePage(post, versions, { app, theme, subscribed }) {
  const L = post.lang;
  const t = await Ts(L, ['{n} min read', 'Read the full article on {source}', 'A CV that gets you the interview.',
    'Build it in minutes, tailor it to the job, and see how well it matches, before you apply.', 'Build my CV for free', 'Also in', 'Blog',
    'On this page', 'Share this article', 'Copy link', 'Email', 'Written by', 'Keep reading', 'All posts',
    'The CVMaster team writes practical, honest advice to help you build a stronger CV and get more interviews.', ...Object.values(CATEGORIES)]);
  const cats = Object.fromEntries(Object.entries(CATEGORIES).map(([k, v]) => [k, t[v]]));
  const url = `${SITE}/blog/${post.slug}`;
  const others = versions.filter(v => v.lang !== L);
  const LANG_NAME = { en: 'English', fr: 'Français', es: 'Español', de: 'Deutsch', it: 'Italiano', pt: 'Português', zh: '中文' };
  const { html, toc } = renderArticle(post.body_md);
  const author = post.author || TEAM;
  const minRead = t['{n} min read'];
  const host = post.source_url ? (() => { try { return new URL(post.source_url).hostname; } catch { return ''; } })() : '';
  const source = post.category === 'link' && post.source_url
    ? `<div class="source"><b>${esc(post.source_name || host)}</b><a class="btn" href="${esc(post.source_url)}" target="_blank" rel="noopener nofollow">${esc(t['Read the full article on {source}'].replace('{source}', post.source_name || host))} ↗</a></div>` : '';
  const u = encodeURIComponent(url), tt = encodeURIComponent(post.title);
  const share = `<div class="share">
    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${u}" target="_blank" rel="noopener" aria-label="LinkedIn" title="LinkedIn">${ICON.linkedin}</a>
    <a href="https://x.com/intent/post?url=${u}&amp;text=${tt}" target="_blank" rel="noopener" aria-label="X" title="X">${ICON.x}</a>
    <a href="https://wa.me/?text=${encodeURIComponent(post.title + ' ' + url)}" target="_blank" rel="noopener" aria-label="WhatsApp" title="WhatsApp">${ICON.whatsapp}</a>
    <a href="https://www.facebook.com/sharer/sharer.php?u=${u}" target="_blank" rel="noopener" aria-label="Facebook" title="Facebook">${ICON.facebook}</a>
    <a href="mailto:?subject=${tt}&amp;body=${u}" aria-label="${esc(t.Email)}" title="${esc(t.Email)}">${ICON.email}</a>
    <button type="button" data-copy="${esc(url)}" aria-label="${esc(t['Copy link'])}" title="${esc(t['Copy link'])}">${ICON.link}</button></div>`;
  // More to read: the same kind of post first, then the latest
  const pool = [...await listPosts({ lang: L, category: post.category, limit: 4 }), ...await listPosts({ lang: L, limit: 7 })];
  const related = pool.filter((p, i) => p.slug !== post.slug && pool.findIndex(x => x.slug === p.slug) === i && !versions.some(v => v.slug === p.slug)).slice(0, 3);
  const tocList = toc.map(h => `<li><a href="#${esc(h.id)}">${esc(h.text)}</a></li>`).join('');
  const body = `<main>
  <header class="in art-h"><div class="hd">
    <nav class="crumbs"><a href="${SITE}/blog?lang=${esc(L)}">${esc(t.Blog)}</a><span>›</span><a class="kicker" href="${SITE}/blog?lang=${esc(L)}&amp;category=${esc(post.category)}">${esc(cats[post.category] || cats.article)}</a></nav>
    <h1>${esc(post.title)}</h1>${post.excerpt ? `<p class="dek">${esc(post.excerpt)}</p>` : ''}
    <div class="byline"><div class="who">${avatar(author)}<div><b>${esc(author)}</b><span><time datetime="${isoDate(post.published_at)}">${esc(fmtDate(post.published_at, L))}</time> · ${esc(minRead.replace('{n}', readingMin(post.body_md)))}</span></div></div>${share}</div>
  </div></header>
  ${post.cover_url ? `<div class="in cover"><img src="${esc(post.cover_url)}" alt="" fetchpriority="high"></div>` : ''}
  <div class="in art"><article>
    ${toc.length > 1 ? `<details class="toc-m"><summary>${esc(t['On this page'])}</summary><ol>${tocList}</ol></details>` : ''}
    <div class="prose">${html}</div>${source}
    ${others.length ? `<div class="langs">${esc(t['Also in'])}: ${others.map(v => `<a href="${SITE}/blog/${esc(v.slug)}${app ? '?app=1' : ''}">${LANG_NAME[v.lang] || v.lang}</a>`).join('')}</div>` : ''}
    <div class="end"><b>${esc(t['Share this article'])}</b>${share}</div>
    ${post.category === 'link' ? '' : `<div class="author">${avatar(author)}<div><small>${esc(t['Written by'])}</small><b>${esc(author)}</b>${isTeam(author) ? `<p>${esc(t['The CVMaster team writes practical, honest advice to help you build a stronger CV and get more interviews.'])}</p>` : ''}</div></div>`}
    <div class="cta-m"><h3>${esc(t['A CV that gets you the interview.'])}</h3><p>${esc(t['Build it in minutes, tailor it to the job, and see how well it matches, before you apply.'])}</p><a class="btn" href="${SITE}/?lang=${esc(L)}">${esc(t['Build my CV for free'])}</a></div>
  </article>
  <aside class="side"><div class="stick">
    ${toc.length > 1 ? `<nav class="toc"><h4>${esc(t['On this page'])}</h4><ol>${tocList}</ol></nav>` : ''}
    <div class="side-cta"><h4>${esc(t['A CV that gets you the interview.'])}</h4><p>${esc(t['Build it in minutes, tailor it to the job, and see how well it matches, before you apply.'])}</p><a class="btn" href="${SITE}/?lang=${esc(L)}">${esc(t['Build my CV for free'])}</a></div>
  </div></aside></div>
  <section class="related"><div class="in">
    ${related.length ? `<div class="sec"><h2>${esc(t['Keep reading'])}</h2><a class="more" style="margin:0" href="${SITE}/blog?lang=${esc(L)}${app ? '&amp;app=1' : ''}">${esc(t['All posts'])} ${ICON.arrow}</a></div>
    <div class="grid">${related.map(p => cardHtml(p, { lang: L, app, cats, minRead })).join('')}</div>` : ''}
    ${await newsletterBox(L, `/blog/${post.slug}`, subscribed)}
  </div></section></main>`;
  return chrome(L, {
    title: `${post.title} | CVMaster`, description: post.excerpt || post.title, url, image: post.cover_url, app, theme, body, article: true,
    alternates: versions.map(v => ({ lang: v.lang, url: `${SITE}/blog/${v.slug}` })),
    jsonld: { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.excerpt, image: post.cover_url || `${SITE}/og-image.png`,
      datePublished: post.published_at, dateModified: post.updated_at, inLanguage: L, mainEntityOfPage: url,
      author: isTeam(author) ? { '@type': 'Organization', name: 'CVMaster', url: SITE } : { '@type': 'Person', name: author },
      publisher: { '@type': 'Organization', name: 'CVMaster', logo: { '@type': 'ImageObject', url: `${SITE}/icon-512.png` } } },
  });
}

const PER_PAGE = 12;
async function indexPage(lang, category, { app, theme, subscribed, q = '', page = 1 }) {
  const items = await listPosts({ lang, category, q, limit: PER_PAGE + 1, offset: (page - 1) * PER_PAGE });
  const hasMore = items.length > PER_PAGE;
  const posts = items.slice(0, PER_PAGE);
  const t = await Ts(lang, ['CVMaster blog', 'CV advice, job-hunting tips and what’s new in CVMaster.', 'All', 'No posts here yet.', '{n} min read',
    'Search articles', 'Search', 'Results for “{q}”', 'No posts match your search.', 'Latest', 'Read article', 'Latest posts', 'Newer posts', 'Older posts',
    ...Object.values(CATEGORIES)]);
  const cats = Object.fromEntries(Object.entries(CATEGORIES).map(([k, v]) => [k, t[v]]));
  const minRead = t['{n} min read'];
  const L = esc(lang);
  const link = (o = {}) => {
    const c = 'category' in o ? o.category : category, p = o.page || 1, s = 'q' in o ? o.q : q;
    return `${SITE}/blog?lang=${L}${c ? '&amp;category=' + c : ''}${s ? '&amp;q=' + encodeURIComponent(s) : ''}${p > 1 ? '&amp;page=' + p : ''}${app ? '&amp;app=1' : ''}`;
  };
  // The newest post gets the big spot on the first page of "All"
  const feature = !category && !q && page === 1 && posts.length ? posts[0] : null;
  const rest = feature ? posts.slice(1) : posts;
  const featHtml = feature ? `<a class="feat${rest.length ? '' : ' solo'}" href="${SITE}/blog/${esc(feature.slug)}${app ? '?app=1' : ''}">
      <span class="img">${feature.cover ? `<img src="${esc(feature.cover)}" alt="" fetchpriority="high">` : `<span class="ph">${LOGO}</span>`}</span>
      <div><div class="meta"><span class="kicker">${esc(cats[feature.category])}</span><span class="dot">·</span><span>${esc(fmtDate(feature.publishedAt, lang))}</span></div>
      <h2>${esc(feature.title)}</h2><p>${esc(feature.excerpt)}</p>
      <div class="meta">${esc(feature.author)}${feature.category !== 'link' ? ' · ' + esc(minRead.replace('{n}', feature.readingMin)) : ''}</div></div></a>` : '';
  const heading = q ? t['Results for “{q}”'].replace('{q}', q) : category ? cats[category] : t['Latest posts'];
  const body = `<main>
  <section class="hero"><div class="in">
    <div class="hero-row"><div><h1>${esc(t['CVMaster blog'])}</h1><p>${esc(t['CV advice, job-hunting tips and what’s new in CVMaster.'])}</p></div>
    <form class="search" method="get" action="${SITE}/blog" role="search">${ICON.search}<input type="hidden" name="lang" value="${L}">${app ? '<input type="hidden" name="app" value="1">' : ''}
      <input type="search" name="q" value="${esc(q)}" placeholder="${esc(t['Search articles'])}" aria-label="${esc(t['Search articles'])}"><button class="btn" type="submit">${esc(t.Search)}</button></form></div>
    <nav class="cats"><a class="${!category ? 'on' : ''}" href="${link({ category: null, q: '' })}">${esc(t.All)}</a>${Object.keys(CATEGORIES).map(k => `<a class="${category === k ? 'on' : ''}" href="${link({ category: k, q: '' })}">${esc(cats[k])}</a>`).join('')}</nav>
  </div></section>
  <div class="in page">
    ${featHtml}
    ${rest.length ? `<div class="sec"><h2>${esc(heading)}</h2></div><div class="grid">${rest.map(p => cardHtml(p, { lang, app, cats, minRead })).join('')}</div>`
      : !feature ? `${q || category ? `<div class="sec"><h2>${esc(heading)}</h2></div>` : ''}<div class="empty">${esc(q ? t['No posts match your search.'] : t['No posts here yet.'])}</div>` : ''}
    ${page > 1 || hasMore ? `<div class="pager">${page > 1 ? `<a class="btn ghost" href="${link({ page: page - 1 })}">← ${esc(t['Newer posts'])}</a>` : '<span></span>'}${hasMore ? `<a class="btn ghost" href="${link({ page: page + 1 })}">${esc(t['Older posts'])} →</a>` : ''}</div>` : ''}
    ${await newsletterBox(lang, '/blog', subscribed)}
  </div></main>`;
  return chrome(lang, { title: `${t['CVMaster blog']} | CVMaster`, description: t['CV advice, job-hunting tips and what’s new in CVMaster.'], url: `${SITE}/blog`, app, theme, body });
}

// ── Routes ──
export function registerBlog(app, { adminAuth, rateLimit, callAi, sendPush, subscribe, onError = () => {} }) {
  const imageUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 } });
  const html = (res, s, cache = true) => { res.set('Cache-Control', cache ? 'public, max-age=120, s-maxage=300' : 'private, no-store'); res.removeHeader('X-Robots-Tag'); res.type('html').send(s); };
  const opts = (req) => ({
    app: req.query.app === '1', theme: ['dark', 'light'].includes(req.query.theme) ? req.query.theme : null,
    subscribed: ['ok', 'already', 'error'].includes(req.query.subscribed) ? req.query.subscribed : null,
  });
  const langOf = (req) => (BLOG_LANGS.includes(req.query.lang) ? req.query.lang : 'en');

  // Readers (website, app)
  app.get('/api/posts', async (req, res) => {
    try {
      res.set('Cache-Control', 'public, max-age=60');
      res.json({ items: await listPosts({ lang: langOf(req), category: req.query.category || null, limit: Number(req.query.limit) || 20, offset: Number(req.query.offset) || 0 }) });
    } catch (e) { onError('posts', e); res.status(500).json({ error: 'Could not load the blog.' }); }
  });
  app.get('/blog', async (req, res) => {
    try {
      const o = { ...opts(req), q: String(req.query.q || '').trim().slice(0, 80), page: Math.min(500, Math.max(1, parseInt(req.query.page, 10) || 1)) };
      html(res, await indexPage(langOf(req), CATEGORIES[req.query.category] ? req.query.category : null, o), !o.subscribed);
    } catch (e) { onError('blog', e); res.status(500).send('The blog is unavailable right now.'); }
  });
  // The newsletter form on blog pages (a plain form, so it works through the www.cvmaster.live/blog pass-through)
  app.post('/blog/subscribe', rateLimit({ windowMs: 10 * 60 * 1000, max: 20 }), express.urlencoded({ extended: false, limit: '4kb' }), async (req, res) => {
    const back = /^\/blog(\/[a-z0-9-]{1,120})?$/.test(req.body?.back || '') ? req.body.back : '/blog';
    const lang = BLOG_LANGS.includes(req.body?.lang) ? req.body.lang : 'en';
    const go = (state) => res.redirect(303, `${SITE}${back}?lang=${lang}&subscribed=${state}#subscribe`);
    if (req.body?.website) return go('ok'); // a bot filled the hidden field
    try {
      const r = subscribe ? await subscribe(req.body?.email) : { ok: false };
      go(!r.ok ? 'error' : r.already ? 'already' : 'ok');
    } catch (e) { onError('blog subscribe', e); go('error'); }
  });
  app.get('/blog/feed.xml', async (req, res) => {
    try {
      const posts = await listPosts({ lang: langOf(req), limit: 30 });
      res.set('Cache-Control', 'public, max-age=600, s-maxage=600');
      res.type('application/rss+xml').send(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>CVMaster</title><link>${SITE}/blog</link><description>CV advice, job-hunting tips and what’s new in CVMaster.</description>
${posts.map(p => `<item><title>${esc(p.title)}</title><link>${p.url}</link><guid>${p.url}</guid><pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate><description>${esc(p.excerpt)}</description></item>`).join('\n')}
</channel></rss>`);
    } catch (e) { onError('feed', e); res.status(500).send(''); }
  });
  app.get('/blog/sitemap.xml', async (req, res) => {
    try {
      await ensureBlog();
      const rows = (await query(`SELECT slug, updated_at FROM posts WHERE status = 'published' ORDER BY published_at DESC LIMIT 5000`)).rows;
      res.set('Cache-Control', 'public, max-age=3600');
      res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${SITE}/blog</loc></url>${rows.map(r => `<url><loc>${SITE}/blog/${esc(r.slug)}</loc><lastmod>${new Date(r.updated_at).toISOString().slice(0, 10)}</lastmod></url>`).join('')}</urlset>`);
    } catch (e) { onError('sitemap', e); res.status(500).send(''); }
  });
  app.get('/blog/:slug', async (req, res) => {
    try {
      const found = await postBySlug(req.params.slug);
      if (!found) return res.redirect(302, `${SITE}/blog`);
      const o = opts(req);
      if (!o.subscribed) query('UPDATE posts SET views = views + 1 WHERE id = $1', [found.post.id]).catch(() => {});
      html(res, await articlePage(found.post, found.versions, o), !o.subscribed);
    } catch (e) { onError('blog post', e); res.status(500).send('This post is unavailable right now.'); }
  });
  app.get('/api/blog-images/:id', async (req, res) => {
    try {
      await ensureBlog();
      if (!/^[0-9a-f-]{36}$/i.test(req.params.id)) return res.status(404).end();
      const img = (await query('SELECT mime, data FROM post_images WHERE id = $1', [req.params.id])).rows[0];
      if (!img) return res.status(404).end();
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      res.type(img.mime).send(img.data);
    } catch { res.status(500).end(); }
  });

  // Admin
  const fields = (b) => {
    const category = CATEGORIES[b.category] ? b.category : 'article';
    const sourceUrl = category === 'link' ? safeUrl(b.sourceUrl) : '';
    return {
      title: String(b.title || '').trim().slice(0, 200), excerpt: String(b.excerpt || '').trim().slice(0, 400),
      body_md: String(b.body || '').slice(0, 200000), cover_url: safeUrl(b.cover) || null, category,
      lang: BLOG_LANGS.includes(b.lang) ? b.lang : 'en', source_name: category === 'link' ? String(b.sourceName || '').trim().slice(0, 100) || null : null,
      source_url: sourceUrl || null, author: String(b.author || '').trim().slice(0, 100) || null,
    };
  };
  const uniqueSlug = async (want, id = null) => {
    const base = slugify(want); let s = base;
    for (let i = 2; (await query('SELECT 1 FROM posts WHERE slug = $1 AND id IS DISTINCT FROM $2', [s, id])).rows.length; i++) s = `${base}-${i}`;
    return s;
  };
  const adminRow = (r) => ({ id: r.id, groupId: r.group_id, lang: r.lang, slug: r.slug, title: r.title, excerpt: r.excerpt, body: r.body_md, cover: r.cover_url,
    category: r.category, sourceName: r.source_name, sourceUrl: r.source_url, status: r.status, author: r.author, views: r.views,
    publishedAt: r.published_at, updatedAt: r.updated_at, url: `${SITE}/blog/${r.slug}` });

  app.get('/api/admin/posts', adminAuth, async (req, res) => {
    try { await ensureBlog(); res.json({ items: (await query('SELECT * FROM posts ORDER BY COALESCE(published_at, updated_at) DESC LIMIT 500')).rows.map(adminRow) }); }
    catch (e) { onError('admin posts', e); res.status(500).json({ error: 'Could not load posts.' }); }
  });
  app.post('/api/admin/posts/preview', adminAuth, (req, res) => res.json({ html: renderMarkdown(req.body?.body) }));
  app.post('/api/admin/posts', adminAuth, async (req, res) => {
    try {
      await ensureBlog();
      const f = fields(req.body || {});
      if (!f.title) return res.status(400).json({ error: 'Give the post a title.' });
      if (f.category === 'link' && !f.source_url) return res.status(400).json({ error: 'Add the link to the original article (https://…).' });
      const slug = await uniqueSlug(req.body?.slug || f.title);
      const group = /^[0-9a-f-]{36}$/i.test(req.body?.groupId || '') ? req.body.groupId : null;
      const r = (await query(`INSERT INTO posts (group_id, lang, slug, title, excerpt, body_md, body_html, cover_url, category, source_name, source_url, author)
          VALUES (COALESCE($1::uuid, gen_random_uuid()), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [group, f.lang, slug, f.title, f.excerpt, f.body_md, renderMarkdown(f.body_md), f.cover_url, f.category, f.source_name, f.source_url, f.author])).rows[0];
      res.json(adminRow(r));
    } catch (e) { onError('create post', e); res.status(500).json({ error: 'Could not save the post.' }); }
  });
  app.put('/api/admin/posts/:id', adminAuth, async (req, res) => {
    try {
      await ensureBlog();
      const old = (await query('SELECT * FROM posts WHERE id = $1', [req.params.id])).rows[0];
      if (!old) return res.status(404).json({ error: 'Post not found.' });
      const f = fields(req.body || {});
      if (!f.title) return res.status(400).json({ error: 'Give the post a title.' });
      if (f.category === 'link' && !f.source_url) return res.status(400).json({ error: 'Add the link to the original article (https://…).' });
      const status = ['draft', 'published'].includes(req.body?.status) ? req.body.status : old.status;
      if (status === 'published' && !f.excerpt) return res.status(400).json({ error: 'Add a short summary before publishing (it shows on cards and in link previews).' });
      const slug = req.body?.slug && slugify(req.body.slug) !== old.slug ? await uniqueSlug(req.body.slug, old.id) : old.slug;
      const r = (await query(`UPDATE posts SET lang = $1, slug = $2, title = $3, excerpt = $4, body_md = $5, body_html = $6, cover_url = $7, category = $8,
          source_name = $9, source_url = $10, author = $11, status = $12,
          published_at = CASE WHEN $12 = 'published' THEN COALESCE(published_at, NOW()) ELSE published_at END, updated_at = NOW()
          WHERE id = $13 RETURNING *`,
        [f.lang, slug, f.title, f.excerpt, f.body_md, renderMarkdown(f.body_md), f.cover_url, f.category, f.source_name, f.source_url, f.author, status, old.id])).rows[0];
      // Newly published, with "tell app users": a push to every phone
      let pushed = null;
      if (status === 'published' && old.status !== 'published' && req.body?.notify === true) {
        pushed = await sendPush('all', { title: r.title, body: r.excerpt, link: `/blog/${r.slug}`, type: 'blog' }, { translate: false }).catch(e => ({ error: e.message }));
      }
      res.json({ ...adminRow(r), pushed });
    } catch (e) { onError('update post', e); res.status(500).json({ error: 'Could not save the post.' }); }
  });
  app.delete('/api/admin/posts/:id', adminAuth, async (req, res) => {
    try { await ensureBlog(); await query('DELETE FROM posts WHERE id = $1', [req.params.id]); res.json({ ok: true }); }
    catch (e) { onError('delete post', e); res.status(500).json({ error: 'Could not delete the post.' }); }
  });
  app.post('/api/admin/posts/images', adminAuth, imageUpload.single('image'), async (req, res) => {
    try {
      await ensureBlog();
      const f = req.file;
      if (!f || !/^image\/(png|jpe?g|webp|gif)$/.test(f.mimetype)) return res.status(400).json({ error: 'Choose a PNG, JPG, WebP or GIF image.' });
      const r = (await query('INSERT INTO post_images (mime, data) VALUES ($1, $2) RETURNING id', [f.mimetype, f.buffer])).rows[0];
      res.json({ url: `https://api.cvmaster.live/api/blog-images/${r.id}` });
    } catch (e) { onError('post image', e); res.status(500).json({ error: 'Could not upload the image.' }); }
  });
  // A translation drafted by AI (same group, another language), to check before publishing
  app.post('/api/admin/posts/:id/translate', adminAuth, rateLimit({ windowMs: 60 * 1000, max: 6 }), async (req, res) => {
    try {
      await ensureBlog();
      const to = req.body?.lang;
      if (!BLOG_LANGS.includes(to)) return res.status(400).json({ error: 'Choose a language.' });
      const src = (await query('SELECT * FROM posts WHERE id = $1', [req.params.id])).rows[0];
      if (!src) return res.status(404).json({ error: 'Post not found.' });
      const existing = (await query('SELECT * FROM posts WHERE group_id = $1 AND lang = $2', [src.group_id, to])).rows[0];
      if (existing) return res.json(adminRow(existing));
      const NAMES = { en: 'British English', fr: 'French', es: 'Spanish', de: 'German', it: 'Italian', pt: 'European Portuguese', zh: 'Simplified Chinese' };
      const out = await callAi(JSON.stringify({ title: src.title, excerpt: src.excerpt, body: src.body_md }), undefined,
        `Translate this blog post for CVMaster (a CV builder) into ${NAMES[to]}. Keep the Markdown exactly (headings, lists, links, images); translate the text only, naturally, as a native writer would. Do not translate URLs, product names or "CVMaster". Reply with JSON only: {"title":"…","excerpt":"…","body":"…"}`, 8000);
      const j = JSON.parse(String(out).replace(/^```(?:json)?\s*|\s*```$/g, '').trim());
      const slug = await uniqueSlug(`${j.title || src.title}`);
      const r = (await query(`INSERT INTO posts (group_id, lang, slug, title, excerpt, body_md, body_html, cover_url, category, source_name, source_url, author)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [src.group_id, to, slug, String(j.title || src.title).slice(0, 200), String(j.excerpt || '').slice(0, 400), String(j.body || ''), renderMarkdown(j.body || ''),
          src.cover_url, src.category, src.source_name, src.source_url, src.author])).rows[0];
      res.json(adminRow(r));
    } catch (e) { onError('translate post', e); res.status(500).json({ error: 'The translation didn’t work. Please try again.' }); }
  });
}
