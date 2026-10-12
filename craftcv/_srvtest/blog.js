// ── BLOG: articles, product updates, news, and links shared from elsewhere ──────
// Written in Markdown in the admin and turned into HTML when saved. Pages are complete HTML
// served from here (www.cvmaster.live/blog is passed through to this server by Vercel), so
// search engines and link previews (WhatsApp, LinkedIn…) see the real title, text and image.
// A post can have translations (same group, another language); readers get their language,
// or English. "Link" posts share someone else's article: our own short summary and a link
// to the original, never a copy of it.
import { Marked } from 'marked';
import multer from 'multer';
import { query } from './db.js';
import { translate } from './push.js';

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

// Markdown → HTML: no raw HTML from the text, only safe links and images
const md = new Marked({ gfm: true });
md.use({ renderer: {
  html(t) { return esc(t.text); },
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
export const renderMarkdown = (text) => md.parse(String(text || '').slice(0, 200000));
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
export async function listPosts({ lang = 'en', category = null, limit = 20, offset = 0 } = {}) {
  await ensureBlog();
  const L = BLOG_LANGS.includes(lang) ? lang : 'en';
  const p = [L];
  let where = `status = 'published'`;
  if (category && CATEGORIES[category]) { p.push(category); where += ` AND category = $${p.length}`; }
  p.push(Math.min(50, Math.max(1, limit)), Math.max(0, offset));
  const { rows } = await query(`SELECT * FROM (
      SELECT DISTINCT ON (group_id) id, group_id, lang, slug, title, excerpt, cover_url, category, source_name, source_url, published_at, body_md
      FROM posts WHERE ${where}
      ORDER BY group_id, (lang = $1) DESC, (lang = 'en') DESC, published_at ASC) x
    ORDER BY published_at DESC LIMIT $${p.length - 1} OFFSET $${p.length}`, p);
  return rows.map(r => ({ ...publicCard(r) }));
}
const publicCard = (r) => ({
  slug: r.slug, lang: r.lang, title: r.title, excerpt: r.excerpt, cover: r.cover_url, category: r.category,
  sourceName: r.source_name, sourceUrl: r.source_url, publishedAt: r.published_at, readingMin: readingMin(r.body_md),
  url: `${SITE}/blog/${r.slug}`,
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
const LOGO = `<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><rect width="24" height="24" rx="7" fill="#4338CA"/><rect x="6" y="4" width="12" height="16" rx="2" fill="#fff"/><path d="M9 12.5l2 2 4-4.5" stroke="#4338CA" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CSS = `
:root{--bg:#f5f5fa;--s:#fff;--b:#e4e4ee;--t:#14142b;--t2:#4a4a63;--t3:#6b6b84;--ac:#4338ca;--acl:#eef0ff}
@media (prefers-color-scheme:dark){:root:not(.light){--bg:#0c0c10;--s:#15151b;--b:#26262e;--t:#f3f4f6;--t2:#a8adb7;--t3:#8b909c;--ac:#8b85ff;--acl:#1f1d3d}}
.dark{--bg:#0c0c10;--s:#15151b;--b:#26262e;--t:#f3f4f6;--t2:#a8adb7;--t3:#8b909c;--ac:#8b85ff;--acl:#1f1d3d}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{margin:0;background:var(--bg);color:var(--t);font:16px/1.6 'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
a{color:var(--ac)}
.top{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--s) 92%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--b)}
.top .in{max-width:1080px;margin:0 auto;padding:12px 20px;display:flex;align-items:center;gap:14px}
.brand{display:flex;align-items:center;gap:9px;font-weight:800;font-size:18px;color:var(--t);text-decoration:none}.brand span{color:var(--ac)}
.top nav{margin-left:auto;display:flex;align-items:center;gap:16px}.top nav a{color:var(--t2);text-decoration:none;font-weight:600;font-size:14.5px}
.btn{display:inline-flex;align-items:center;justify-content:center;background:var(--ac);color:#fff!important;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:10px;font-size:14.5px}
.wrap{max-width:760px;margin:0 auto;padding:34px 20px 60px}
.kicker{font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--ac)}
h1{font-size:clamp(28px,5vw,40px);line-height:1.15;letter-spacing:-.02em;margin:8px 0 10px}
.meta{color:var(--t3);font-size:14px}
.cover{width:100%;border-radius:16px;margin:24px 0 6px;display:block;aspect-ratio:16/9;object-fit:cover;background:var(--acl)}
.prose{font-size:17px;line-height:1.75;color:var(--t)}.prose h2{font-size:24px;line-height:1.3;margin:34px 0 8px;letter-spacing:-.01em}.prose h3{font-size:19px;margin:26px 0 6px}
.prose p{margin:0 0 18px}.prose ul,.prose ol{padding-left:22px;margin:0 0 18px}.prose li{margin:4px 0}
.prose blockquote{margin:22px 0;padding:6px 0 6px 18px;border-left:3px solid var(--ac);color:var(--t2);font-style:italic}
.prose figure{margin:24px 0}.prose img{max-width:100%;border-radius:12px;display:block}.prose figcaption{font-size:13.5px;color:var(--t3);margin-top:6px;text-align:center}
.prose code{background:var(--acl);padding:2px 6px;border-radius:6px;font-size:.9em}.prose pre{background:var(--acl);padding:14px;border-radius:12px;overflow:auto}
.prose table{border-collapse:collapse;width:100%;margin:0 0 18px}.prose td,.prose th{border:1px solid var(--b);padding:8px 10px;text-align:left}
.source{margin:26px 0;padding:18px;border:1px solid var(--b);border-radius:14px;background:var(--s)}.source b{display:block;margin-bottom:10px}
.cta{margin:40px 0 0;padding:26px;border-radius:18px;background:var(--acl);text-align:center}.cta h3{margin:0 0 6px;font-size:21px}.cta p{margin:0 0 16px;color:var(--t2)}
.langs{margin-top:22px;font-size:13.5px;color:var(--t3)}.langs a{margin-right:10px}
.tabs{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0 24px}.tabs a{padding:7px 14px;border:1px solid var(--b);border-radius:99px;text-decoration:none;color:var(--t2);font-weight:600;font-size:14px;background:var(--s)}.tabs a.on{background:var(--ac);border-color:var(--ac);color:#fff}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}
.card{display:flex;flex-direction:column;background:var(--s);border:1px solid var(--b);border-radius:16px;overflow:hidden;text-decoration:none;color:var(--t)}
.card img,.card .ph{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;background:linear-gradient(135deg,var(--acl),var(--s))}
.card .b{padding:16px 18px 20px;display:flex;flex-direction:column;gap:6px}.card h2{font-size:18.5px;line-height:1.3;margin:0}.card p{margin:0;color:var(--t2);font-size:14.5px}
.empty{padding:40px;text-align:center;color:var(--t3)}
.foot{border-top:1px solid var(--b);padding:22px 20px;text-align:center;color:var(--t3);font-size:13.5px}.foot a{color:var(--t3);margin:0 8px}
.app .top,.app .foot,.app .cta{display:none}.app .wrap{padding-top:18px}
@media (max-width:560px){.top nav a.hide{display:none}.wrap{padding:24px 18px 50px}.prose{font-size:16.5px}}`;

async function chrome(lang, { title, description, url, image, alternates = [], body, jsonld, app, theme }) {
  const [tBlog, tBuild, tPrivacy, tTerms] = await Promise.all(['Blog', 'Build my CV', 'Privacy', 'Terms'].map(s => T(lang, s)));
  return `<!DOCTYPE html><html lang="${esc(lang)}" class="${app ? 'app' : ''} ${theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : ''}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">${alternates.map(a => `<link rel="alternate" hreflang="${esc(a.lang)}" href="${esc(a.url)}">`).join('')}
<meta property="og:site_name" content="CVMaster"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${esc(image || SITE + '/og-image.png')}"><meta property="og:type" content="${jsonld ? 'article' : 'website'}">
<meta name="twitter:card" content="summary_large_image"><link rel="icon" href="${SITE}/favicon.svg"><link rel="alternate" type="application/rss+xml" title="CVMaster" href="${SITE}/blog/feed.xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>${CSS}</style>${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : ''}</head><body>
<header class="top"><div class="in"><a class="brand" href="${SITE}/?lang=${esc(lang)}">${LOGO}CV<span>Master</span></a>
<nav><a class="hide" href="${SITE}/blog?lang=${esc(lang)}">${esc(tBlog)}</a><a class="btn" href="${SITE}/?lang=${esc(lang)}">${esc(tBuild)}</a></nav></div></header>
${body}
<footer class="foot">© CVMaster · <a href="${SITE}/privacy">${esc(tPrivacy)}</a><a href="${SITE}/terms">${esc(tTerms)}</a><a href="${SITE}/blog/feed.xml">RSS</a></footer>
</body></html>`;
}

const fmtDate = (d, lang) => { try { return new Date(d).toLocaleDateString({ en: 'en-GB', zh: 'zh-CN' }[lang] || lang, { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return ''; } };

async function articlePage(post, versions, { app, theme }) {
  const L = post.lang;
  const [kicker, minRead, readOn, ctaT, ctaP, ctaB, alsoIn] = await Promise.all([
    T(L, CATEGORIES[post.category] || 'Articles'), T(L, '{n} min read'), T(L, 'Read the full article on {source}'),
    T(L, 'A CV that gets you the interview.'), T(L, 'Build it in minutes, tailor it to the job, and see how well it matches, before you apply.'), T(L, 'Build my CV for free'),
    T(L, 'Also in'),
  ]);
  const url = `${SITE}/blog/${post.slug}`;
  const others = versions.filter(v => v.lang !== L);
  const LANG_NAME = { en: 'English', fr: 'Français', es: 'Español', de: 'Deutsch', it: 'Italiano', pt: 'Português', zh: '中文' };
  const source = post.category === 'link' && post.source_url
    ? `<div class="source"><b>${esc(post.source_name || new URL(post.source_url).hostname)}</b><a class="btn" href="${esc(post.source_url)}" target="_blank" rel="noopener nofollow">${esc(readOn.replace('{source}', post.source_name || new URL(post.source_url).hostname))} ↗</a></div>` : '';
  const body = `<main class="wrap"><article>
    <div class="kicker">${esc(kicker)}</div><h1>${esc(post.title)}</h1>
    <div class="meta">${esc(fmtDate(post.published_at, L))} · ${esc(minRead.replace('{n}', readingMin(post.body_md)))}</div>
    ${post.cover_url ? `<img class="cover" src="${esc(post.cover_url)}" alt="">` : ''}
    <div class="prose">${post.body_html}</div>${source}
    ${others.length ? `<div class="langs">${esc(alsoIn)}: ${others.map(v => `<a href="${SITE}/blog/${esc(v.slug)}${app ? '?app=1' : ''}">${LANG_NAME[v.lang] || v.lang}</a>`).join('')}</div>` : ''}
  </article>
  <div class="cta"><h3>${esc(ctaT)}</h3><p>${esc(ctaP)}</p><a class="btn" href="${SITE}/?lang=${esc(L)}">${esc(ctaB)}</a></div></main>`;
  return chrome(L, {
    title: `${post.title} | CVMaster`, description: post.excerpt || post.title, url, image: post.cover_url, app, theme, body,
    alternates: versions.map(v => ({ lang: v.lang, url: `${SITE}/blog/${v.slug}` })),
    jsonld: { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.excerpt, image: post.cover_url || `${SITE}/og-image.png`,
      datePublished: post.published_at, dateModified: post.updated_at, inLanguage: L, mainEntityOfPage: url,
      author: { '@type': 'Organization', name: post.author || 'CVMaster' }, publisher: { '@type': 'Organization', name: 'CVMaster', logo: { '@type': 'ImageObject', url: `${SITE}/icon-512.png` } } },
  });
}

async function indexPage(lang, category, { app, theme }) {
  const posts = await listPosts({ lang, category, limit: 30 });
  const [tTitle, tSub, tAll, tEmpty, minRead] = await Promise.all([
    T(lang, 'CVMaster blog'), T(lang, 'CV advice, job-hunting tips and what’s new in CVMaster.'), T(lang, 'All'), T(lang, 'No posts here yet.'), T(lang, '{n} min read')]);
  const cats = await Promise.all(Object.entries(CATEGORIES).map(async ([k, v]) => [k, await T(lang, v)]));
  const q = (c) => `${SITE}/blog?lang=${lang}${c ? '&category=' + c : ''}${app ? '&app=1' : ''}`;
  const body = `<main class="wrap" style="max-width:1080px">
    <h1>${esc(tTitle)}</h1><p class="meta" style="font-size:16px">${esc(tSub)}</p>
    <nav class="tabs"><a class="${!category ? 'on' : ''}" href="${q('')}">${esc(tAll)}</a>${cats.map(([k, v]) => `<a class="${category === k ? 'on' : ''}" href="${q(k)}">${esc(v)}</a>`).join('')}</nav>
    ${posts.length ? `<div class="grid">${posts.map(p => `<a class="card" href="${SITE}/blog/${esc(p.slug)}${app ? '?app=1' : ''}">
      ${p.cover ? `<img src="${esc(p.cover)}" alt="" loading="lazy">` : '<div class="ph"></div>'}
      <div class="b"><div class="kicker">${esc((cats.find(c => c[0] === p.category) || [])[1] || '')}</div><h2>${esc(p.title)}</h2><p>${esc(p.excerpt)}</p>
      <div class="meta">${esc(fmtDate(p.publishedAt, lang))}${p.category !== 'link' ? ' · ' + esc(minRead.replace('{n}', p.readingMin)) : ''}</div></div></a>`).join('')}</div>`
      : `<div class="empty">${esc(tEmpty)}</div>`}
  </main>`;
  return chrome(lang, { title: `${tTitle} | CVMaster`, description: tSub, url: `${SITE}/blog`, app, theme, body });
}

// ── Routes ──
export function registerBlog(app, { adminAuth, rateLimit, callAi, sendPush, onError = () => {} }) {
  const imageUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 } });
  const html = (res, s) => { res.set('Cache-Control', 'public, max-age=120, s-maxage=300'); res.removeHeader('X-Robots-Tag'); res.type('html').send(s); };
  const opts = (req) => ({ app: req.query.app === '1', theme: ['dark', 'light'].includes(req.query.theme) ? req.query.theme : null });
  const langOf = (req) => (BLOG_LANGS.includes(req.query.lang) ? req.query.lang : 'en');

  // Readers (website, app)
  app.get('/api/posts', async (req, res) => {
    try {
      res.set('Cache-Control', 'public, max-age=60');
      res.json({ items: await listPosts({ lang: langOf(req), category: req.query.category || null, limit: Number(req.query.limit) || 20, offset: Number(req.query.offset) || 0 }) });
    } catch (e) { onError('posts', e); res.status(500).json({ error: 'Could not load the blog.' }); }
  });
  app.get('/blog', async (req, res) => {
    try { html(res, await indexPage(langOf(req), CATEGORIES[req.query.category] ? req.query.category : null, opts(req))); }
    catch (e) { onError('blog', e); res.status(500).send('The blog is unavailable right now.'); }
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
      query('UPDATE posts SET views = views + 1 WHERE id = $1', [found.post.id]).catch(() => {});
      html(res, await articlePage(found.post, found.versions, opts(req)));
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
