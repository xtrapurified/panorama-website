// Builds the search-engine pages of panoramafilms.tv from the data inside index.html.
// Run from the repo root after any change to projects:  node tools/seo/build.mjs  (then python3 tools/seo/og.py for new share images)
// Writes: work/<slug>/index.html (one crawlable page per published project), work/index.html,
//         sr/index.html (Serbian), uae/index.html (UAE institutions), 404.html, sitemap.xml, _redirects,
//         and the WORK slug map inside index.html (between the SEO:WORK markers).
// Never invents facts: every title, client, year, service, credit and description comes from index.html.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SITE = 'https://panoramafilms.tv';
const TODAY = new Date().toISOString().slice(0, 10);
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

/* ---------- read the site's own data ---------- */
const grab = (re, what) => { const m = html.match(re); if (!m) throw new Error('not found: ' + what); return m[1]; };
const F = Function(`return ${grab(/const F = (\{[\s\S]*?\n\});/, 'F')}`)();
const arr = name => Function(`return ${grab(new RegExp(`const ${name} = (\\[[^\\]]*\\])`), name)}`)();
const DRAFTS = arr('DRAFTS'), INDEX = arr('INDEX');
const LIST = arr('LIST').filter(k => !DRAFTS.includes(k));
const HIDDEN = Function(`return ${grab(/const HIDDEN = \[([^\]]*?),\s*\.\.\./, 'HIDDEN').replace(/^/, '[') + ']'}`)();
const PJ = JSON.parse(grab(/<script[^>]*id="pjdata"[^>]*>([\s\S]*?)<\/script>/, 'pjdata'));
const CR = JSON.parse(grab(/<script[^>]*id="crdata"[^>]*>([\s\S]*?)<\/script>/, 'crdata'));
const ORDER = [...LIST, ...INDEX].filter(k => !HIDDEN.includes(k) && F[k]);

const slugify = t => [...t].map(c => /[đĐ]/.test(c) ? 'd' : c.normalize('NFD')[0]).join('')
  .toLowerCase().replace(/[’'`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const SLUG = Object.fromEntries(ORDER.map(k => [k, slugify(F[k].title)]));
if (new Set(Object.values(SLUG)).size !== ORDER.length) throw new Error('duplicate slugs');

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const same = (a, b) => slugify(a || '').includes(slugify(b || '')) && !!b;
const clientOf = k => (same(F[k].title, F[k].client) ? '' : F[k].client);
const still = k => `/media/${F[k].img ? F[k].img : 'stills/' + (F[k].still || k)}.webp`;
const ogImg = k => fs.existsSync(path.join(ROOT, `media/og/${SLUG[k]}.jpg`)) ? `${SITE}/media/og/${SLUG[k]}.jpg` : SITE + still(k);
const clip = (s, n) => { s = String(s).replace(/\s+/g, ' ').trim(); if (s.length <= n) return s; s = s.slice(0, n - 1); return s.slice(0, s.lastIndexOf(' ')).replace(/[,;:–—-]$/, '') + '…'; };
const intro = k => (PJ[k]?.intro || []).map(p => p.replace(/^\*\s*/, '').trim()).filter(Boolean);
const url = k => `/work/${SLUG[k]}/`;
const ld = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;

/* markets, for the two landing pages (taken from each project's client) */
const UAE = ['hotf', 'ask', 'astro', 'orchard', 'docu', 'p13', 'sport', 'ten', 'p08', 'p15', 'p17', 'p18', 'p21', 'p30'].filter(k => ORDER.includes(k));
const SRB = ['p36', 'p35', 'p25', 'p19', 'p12', 'p24', 'p29', 'p28', 'p26', 'p31', 'p23', 'p20'].filter(k => ORDER.includes(k));
const REGION = ['p09', 'p10', 'p07'].filter(k => ORDER.includes(k));

/* the three people at the core (bios word for word from the homepage) */
const TEAM = [
  { name: 'Andrija Kovač', role: 'Creative Director', sr: 'Kreativni direktor', img: 'andrija-4',
    bio: 'Co-founder of Panorama Films Collective and director of photography, exploring the space between film, photography and design. He has directed and shot short films, video essays and branded films for companies, NGOs, startups, artists and activist groups.',
    srBio: 'Suosnivač kolektiva Panorama Films i direktor fotografije koji istražuje prostor između filma, fotografije i dizajna. Režirao je i snimao kratke filmove, video eseje i brend filmove za kompanije, nevladine organizacije, startape, umetnike i aktivističke grupe.' },
  { name: 'Mina Strugar', role: 'Producer', sr: 'Producentkinja', img: 'mina-4',
    bio: 'Creative producer and audio engineer, leading projects and creative development. She has created museum experiences and worked on theatre productions. Her research focuses on spatial sound and sound design.',
    srBio: 'Kreativna producentkinja i audio inženjerka koja vodi projekte i kreativni razvoj. Stvarala je muzejska iskustva i radila na pozorišnim produkcijama. U istraživanju se bavi prostornim zvukom i dizajnom zvuka.' },
  { name: 'Marija Kovačina', role: 'Editorial Director', sr: 'Urednica i montažerka', img: 'marija-2',
    bio: 'Film editor, multimedia artist and musician. She has edited and directed documentaries, art films and short experimental works, screened and awarded at international festivals.',
    srBio: 'Filmska montažerka, multimedijalna umetnica i muzičarka. Montirala je i režirala dokumentarne filmove, umetničke filmove i kratka eksperimentalna dela, prikazivana i nagrađivana na međunarodnim festivalima.' },
];
const SAME_AS = ['https://www.instagram.com/panoramafilms.tv/', 'https://vimeo.com/panoramafilmstv', 'https://www.youtube.com/@panoramafilmstv'];
const ORG = {
  '@type': 'Organization', '@id': `${SITE}/#org`, name: 'Panorama Films', alternateName: ['Panorama Films Collective', 'Панорама Филмс'],
  url: `${SITE}/`, logo: `${SITE}/media/icons/icon-512.png`, image: `${SITE}/media/og/home.jpg`,
  description: 'Independent creative storytelling studio from Belgrade, Serbia, making documentaries, series, campaigns and brand films for institutions, foundations, NGOs and brands in the UAE, Europe and Serbia.',
  slogan: 'Seeing the bigger picture.',
  address: { '@type': 'PostalAddress', addressLocality: 'Belgrade', addressCountry: 'RS' },
  areaServed: [{ '@type': 'Country', name: 'United Arab Emirates' }, { '@type': 'Country', name: 'Serbia' }, { '@type': 'Place', name: 'Worldwide' }],
  knowsAbout: ['Documentary film production', 'Docuseries', 'Brand films', 'Campaign films', 'Event films', 'Cinematography', 'Aerial cinematography', 'Film editing', 'Sound design', 'Script writing', 'Creative direction'],
  sameAs: SAME_AS,   /* no email here: the address is never written in page source */
  founder: TEAM.slice(0, 1).map(p => ({ '@id': `${SITE}/#${slugify(p.name)}` })),
  employee: TEAM.map(p => ({ '@id': `${SITE}/#${slugify(p.name)}` })),
};
const PEOPLE = TEAM.map(p => ({ '@type': 'Person', '@id': `${SITE}/#${slugify(p.name)}`, name: p.name, jobTitle: p.role, description: p.bio,
  image: `${SITE}/media/team/${p.img}.webp`, worksFor: { '@id': `${SITE}/#org` } }));

/* ---------- shared page frame ---------- */
const CSS = `@font-face{font-family:"Untitled Sans";src:url(/media/fonts/UntitledSans-Regular.woff2) format("woff2");font-weight:400;font-display:swap}
@font-face{font-family:"Untitled Sans";src:url(/media/fonts/UntitledSans-Medium.woff2) format("woff2");font-weight:500;font-display:swap}
:root{--bg:#050505;--fg:#ededeb;--mid:#8a8a87;--rule:#262624;--red:#e2231a;--m:clamp(16px,3.2vw,48px);--sans:"Untitled Sans","Helvetica Neue",Helvetica,Arial,sans-serif;color-scheme:dark}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--fg);font:400 17px/1.5 var(--sans);-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}a:hover,a:focus-visible{text-decoration:underline;text-decoration-color:var(--red);text-underline-offset:.18em}
.w{padding:0 var(--m);max-width:1680px;margin:0 auto}
header{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:22px 0;font-size:20px;letter-spacing:-.02em}
header .wm{font-weight:500;font-size:22px}header .wm sup{font-size:.5em;margin-left:.1em}
header nav{display:flex;gap:clamp(14px,2.4vw,32px);flex-wrap:wrap}
@media (max-width:600px){header{flex-direction:column;align-items:flex-start;gap:10px;font-size:16px}header .wm{font-size:20px}}
.lab{font-size:12px;letter-spacing:.02em;color:var(--mid);text-transform:none}
.lab b{font-weight:400;color:var(--red)}
h1{font-weight:500;font-size:clamp(38px,5.4vw,88px);line-height:1.02;letter-spacing:-.055em;margin:clamp(40px,7vw,110px) 0 .25em;max-width:18ch}
h2{font-weight:500;font-size:clamp(26px,3vw,46px);line-height:1.06;letter-spacing:-.05em;margin:0 0 .6em;max-width:24ch}
h3{font-weight:500;font-size:20px;letter-spacing:-.03em;margin:0 0 .3em}
p{margin:0 0 1em;max-width:62ch}
.lead{font-size:clamp(19px,1.6vw,24px);line-height:1.35;letter-spacing:-.02em;color:var(--fg);max-width:40ch}
.meta{display:flex;flex-wrap:wrap;gap:6px 28px;color:var(--mid);margin:0 0 28px}
.meta span b{font-weight:400;color:var(--fg)}
section{padding:clamp(40px,6vw,96px) 0;border-top:1px solid var(--rule)}
.player{position:relative;aspect-ratio:16/9;background:#000;margin:8px 0 40px;overflow:hidden}
.player iframe,.player video,.player img{position:absolute;inset:0;width:100%;height:100%;border:0;object-fit:cover}
.grid2{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:clamp(16px,2vw,32px);row-gap:32px}
.c-main{grid-column:1/span 7}.c-side{grid-column:9/span 4}
@media (max-width:860px){.c-main,.c-side{grid-column:1/-1}}
.stamp{display:inline-block;background:var(--red);color:#000;padding:3px 8px;font-size:13px;margin:0 0 20px}
dl.cr{margin:0 0 28px}dl.cr dt{color:var(--red);font-size:12px;margin:18px 0 6px}dl.cr dd{margin:0}
.crrow{display:flex;gap:12px;padding:4px 0;border-bottom:1px solid var(--rule)}.crrow span:first-child{color:var(--mid);min-width:44%}
.films{list-style:none;padding:0;margin:0}.films li{display:flex;gap:16px;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--rule)}
.films li .mid{color:var(--mid);white-space:nowrap}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:36px clamp(16px,2vw,32px);list-style:none;padding:0;margin:0}
.cards img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;background:#111;margin-bottom:10px}
.cards .t{font-weight:500;letter-spacing:-.02em}.cards .c{color:var(--mid)}
.team{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:32px}
.team img{width:100%;aspect-ratio:4/5;object-fit:cover;filter:grayscale(1) brightness(.75);margin-bottom:12px}
.clients{columns:3 220px;column-gap:32px;list-style:none;padding:0;margin:0}.clients li{padding:3px 0;break-inside:avoid}
.ask{font-weight:500;font-size:clamp(34px,4.6vw,76px);line-height:1.02;letter-spacing:-.055em;margin:0 0 .4em}
.ask a{display:inline-block}.ask .r{color:var(--mid)}
.pn{display:flex;justify-content:space-between;gap:24px}.pn a{max-width:45%}
footer{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:28px 0 40px;color:var(--mid);font-size:13px;border-top:1px solid var(--rule)}
.svc{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:28px 32px}
.svc p{color:var(--mid)}`;

const MAIL_JS = `<script>document.querySelectorAll('[data-mail]').forEach(function(a){var m=['hello','panoramafilms.tv'].join('@');a.href='mailto:'+m+(a.dataset.mail?'?subject='+encodeURIComponent(a.dataset.mail):'');if(a.dataset.show!==undefined)a.textContent=m;});</script>`;

function page({ lang = 'en', title, desc, canon, og, alt = [], body, schema = [], navLang }) {
  const t = lang === 'sr'
    ? { work: 'Radovi', studio: 'Studio', contact: 'Kontakt', other: 'English', otherHref: '/' }
    : { work: 'Work', studio: 'Studio', contact: 'Get in touch', other: 'Srpski', otherHref: '/sr/' };
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}${canon}">
${alt.map(([l, h]) => `<link rel="alternate" hreflang="${l}" href="${SITE}${h}">`).join('\n')}
<meta property="og:type" content="website"><meta property="og:site_name" content="Panorama Films"><meta property="og:locale" content="${lang === 'sr' ? 'sr_RS' : 'en_US'}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${SITE}${canon}">
<meta property="og:image" content="${esc(og)}"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="48x48"><link rel="icon" href="/media/icons/favicon-32.png" type="image/png" sizes="32x32"><link rel="apple-touch-icon" href="/media/icons/apple-touch-icon.png">
<link rel="preload" href="/media/fonts/UntitledSans-Medium.woff2" as="font" type="font/woff2" crossorigin>
<style>${CSS}</style>
${schema.map(ld).join('\n')}
</head><body><div class="w">
<header><a class="wm" href="${lang === 'sr' ? '/sr/' : '/'}">Panorama Films<sup>®</sup></a>
<nav><a href="${lang === 'sr' ? '/sr/#radovi' : '/work/'}">${t.work}</a><a href="${lang === 'sr' ? '/sr/#studio' : '/#studio'}">${t.studio}</a><a href="${lang === 'sr' ? '/sr/#kontakt' : '/#contact'}">${t.contact}</a><a href="${navLang || t.otherHref}" hreflang="${lang === 'sr' ? 'en' : 'sr'}" lang="${lang === 'sr' ? 'en' : 'sr'}">${t.other}</a></nav></header>
<main>
${body}
</main>
<footer><span>Studio Panorama Films · Belgrade, Serbia · ${lang === 'sr' ? 'Beograd · Dubai · ceo svet' : 'Belgrade · Dubai · Worldwide'}</span>
<span><a href="https://www.instagram.com/panoramafilms.tv/" rel="me">Instagram</a> · <a href="https://vimeo.com/panoramafilmstv" rel="me">Vimeo</a> · <a href="https://www.youtube.com/@panoramafilmstv" rel="me">YouTube</a> · <a data-mail="" href="${lang === 'sr' ? '/sr/#kontakt' : '/#contact'}">Email</a></span></footer>
</div>${MAIL_JS}</body></html>
`;
}

const ask = lang => lang === 'sr'
  ? `<section id="kontakt"><p class="ask"><a data-mail="Upit za film" href="/sr/#kontakt">Hajde da napravimo film zajedno.</a><br><span class="r">Pišite nam.</span></p>
<p class="lab"><a data-mail="Upit za film" data-show href="/sr/#kontakt">hello [at] panoramafilms.tv</a> · <a href="https://www.instagram.com/panoramafilms.tv/">@panoramafilms.tv</a></p></section>`
  : `<section id="contact"><p class="ask"><a data-mail="Film enquiry" href="/#contact">Let’s make a film together.</a><br><span class="r">Get in touch.</span></p>
<p class="lab"><a data-mail="Film enquiry" data-show href="/#contact">hello [at] panoramafilms.tv</a> · <a href="https://www.instagram.com/panoramafilms.tv/">@panoramafilms.tv</a></p></section>`;

const card = (k, lang) => `<li><a href="${url(k)}"><img src="${still(k)}" alt="${esc(F[k].title)}${clientOf(k) ? ' — ' + esc(clientOf(k)) : ''}" loading="lazy" width="640" height="360"><span class="t">${esc(F[k].title)}</span></a><br><span class="c">${esc(clientOf(k) || F[k].client)}${F[k].year ? ' · ' + esc(F[k].year) : ''}</span></li>`;

/* ---------- films of a project ---------- */
const filmLink = f => f.yt ? `https://www.youtube.com/watch?v=${f.yt}` : f.v ? `https://vimeo.com/${f.v}${f.h ? '/' + f.h : ''}` : f.file ? `/media/${f.file}.mp4` : null;
const embed = f => f.yt ? `https://www.youtube-nocookie.com/embed/${f.yt}` : f.v ? `https://player.vimeo.com/video/${f.v}${f.h ? '?h=' + f.h + '&' : '?'}dnt=1` : null;
function films(k) {
  const main = { t: F[k].mainT || F[k].title, yt: F[k].yt, v: F[k].v, h: F[k].h, file: F[k].file };
  const out = [], seen = new Set();
  const add = (f, g) => { const id = f.yt || f.v || f.file; if (!id || seen.has(id)) return; seen.add(id); out.push({ ...f, g }); };
  add(main, null);
  (PJ[k]?.groups || []).forEach(g => (g.films || []).forEach(f => add(f, g)));
  return out;
}
const groupYear = g => (g?.meta || []).find(([a]) => /^year$/i.test(a))?.[1] || '';

/* ---------- project pages ---------- */
function projectPage(k, i) {
  const f = F[k], p = PJ[k] || {}, c = CR[k] || {}, fl = films(k), cl = clientOf(k);
  const paras = intro(k);
  const desc = clip(f.line ? `${f.line} ${paras[0] || ''}` : paras[0] || `${f.title}, a film for ${f.client}${f.year ? ' (' + f.year + ')' : ''} by Panorama Films, Belgrade.`, 158);
  const title = `${f.title}${cl ? ' — ' + cl : ''} | Panorama Films`;
  const m = fl[0];
  const player = m ? (m.file
    ? `<div class="player"${f.ar ? ` style="aspect-ratio:${f.ar}"` : ''}><video controls preload="none" playsinline poster="${still(k)}" src="/media/${m.file}.mp4"></video></div>`
    : `<div class="player"${f.ar ? ` style="aspect-ratio:${f.ar};max-width:calc(100vh * ${f.ar})"` : ''}><iframe src="${embed(m)}" title="${esc(m.t)}" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`)
    : `<div class="player"><img src="${still(k)}" alt="${esc(f.title)}"></div>`;
  const photos = (p.imgs || []).length ? `<ul class="cards">${p.imgs.map((x, j) => `<li><img src="/media/proj/${p.slug}/${String(j).padStart(2, '0')}.webp" alt="${esc(f.title)}, photo ${j + 1}" loading="lazy"></li>`).join('')}</ul>` : '';
  const blocks = (c.blocks || []);
  const ordered = c.type === 'service' ? [...blocks.filter(b => b.ext), ...blocks.filter(b => !b.ext)] : blocks;
  const credits = ordered.map(b => `<dt>For ${esc(b.h || 'External')}</dt><dd>${b.rows.map(([r, n]) => `<div class="crrow"><span>${esc(r)}</span><span>${esc(n)}</span></div>`).join('')}</dd>`).join('');
  const prev = ORDER[(i - 1 + ORDER.length) % ORDER.length], next = ORDER[(i + 1) % ORDER.length];
  const related = (UAE.includes(k) ? UAE : SRB.includes(k) ? SRB : ORDER).filter(x => x !== k).slice(0, 3);
  const people = blocks.filter(b => !b.ext).flatMap(b => b.rows.flatMap(([r, n]) => n.split(/,\s*/).map(name => ({ '@type': 'Person', name, jobTitle: r }))));
  const schema = [
    { '@context': 'https://schema.org', '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Panorama Films', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Work', item: `${SITE}/work/` },
        { '@type': 'ListItem', position: 3, name: f.title, item: `${SITE}${url(k)}` }] },
      { '@type': 'CreativeWork', '@id': `${SITE}${url(k)}#work`, name: f.title, headline: f.title, description: desc, url: `${SITE}${url(k)}`,
        image: ogImg(k), inLanguage: 'en', ...(/^\d{4}$/.test(f.year) ? { dateCreated: f.year } : {}),
        ...(c.type === 'service' ? { contributor: { '@id': `${SITE}/#org` } } : { creator: { '@id': `${SITE}/#org` }, producer: { '@id': `${SITE}/#org` } }),
        ...(f.client && f.client !== 'Panorama Films' ? { sourceOrganization: { '@type': 'Organization', name: f.client } } : {}),
        ...(people.length ? { contributor: people } : {}),
        ...(fl.length ? { video: fl.map(x => ({ '@type': 'VideoObject', name: x.t, description: clip(x.g ? `${x.t} — ${f.title}` : desc, 200),
          thumbnailUrl: x.yt ? `https://i.ytimg.com/vi/${x.yt}/hqdefault.jpg` : ogImg(k), ...(embed(x) ? { embedUrl: embed(x) } : { contentUrl: SITE + filmLink(x) }), url: filmLink(x).startsWith('/') ? SITE + filmLink(x) : filmLink(x) })) } : {}) },
      { ...ORG, '@context': undefined }] }];
  const body = `<p class="lab"><a href="/work/">Work</a> / ${esc(f.n || String(i + 1).padStart(2, '0'))}</p>
<h1>${esc(f.title)}</h1>
${f.line ? `<p class="lead">${esc(f.line)}</p>` : ''}
<div class="meta">${f.client ? `<span>Client <b>${esc(f.client)}</b></span>` : ''}${f.year ? `<span>Year <b>${esc(f.year)}</b></span>` : ''}${f.roles ? `<span>Services <b>${esc(f.roles)}</b></span>` : ''}</div>
${player}
<div class="grid2"><div class="c-main">
${c.type === 'service' && c.note ? `<p class="stamp">${esc(c.note)}</p>` : c.type === 'own' ? '<p class="lab"><b>A Panorama Films project</b></p>' : ''}
${paras.map(x => `<p>${esc(x)}</p>`).join('\n')}
${(p.notes || []).map(n => `<h3>“${esc(n.quote)}”</h3><p class="lab">${esc(n.label)}</p><p>${esc(n.lead)}</p><p>${esc(n.body)}</p>`).join('\n')}
${photos}
${fl.length > 1 ? `<h2 style="margin-top:48px">Films ${fl.length}</h2><ul class="films">${fl.map(x => `<li><a href="${filmLink(x)}" rel="noopener">${esc(x.t)}</a><span class="mid">${esc(groupYear(x.g))}</span></li>`).join('')}</ul>` : ''}
<p class="lab" style="margin-top:32px"><a href="/#${encodeURIComponent(p.slug || '')}">Watch on the full site →</a></p>
</div><aside class="c-side">${credits ? `<h3>Credits</h3><dl class="cr">${credits}</dl>` : ''}</aside></div>
<section><p class="lab">More work</p><ul class="cards">${related.map(x => card(x)).join('')}</ul></section>
<section class="pn"><a href="${url(prev)}"><span class="lab">← Previous</span><br>${esc(F[prev].title)}</a><a href="${url(next)}" style="text-align:right"><span class="lab">Next →</span><br>${esc(F[next].title)}</a></section>
${ask('en')}`;
  return page({ title, desc, canon: url(k), og: ogImg(k), body, schema });
}

/* ---------- work index ---------- */
function workIndex() {
  const body = `<h1>Work</h1>
<p class="lead">Documentaries, docuseries, campaigns, event films and brand films by Panorama Films, for institutions, foundations, NGOs and brands in the UAE, Europe and Serbia.</p>
<section><ul class="cards">${ORDER.map(k => card(k)).join('')}</ul></section>${ask('en')}`;
  const schema = [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Work — Panorama Films', url: `${SITE}/work/`,
    mainEntity: { '@type': 'ItemList', itemListElement: ORDER.map((k, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}${url(k)}`, name: F[k].title })) } }];
  return page({ title: 'Work — Documentaries, Campaigns & Brand Films | Panorama Films', desc: `${ORDER.length} projects by Panorama Films for the Dubai Future Foundation, Museum of the Future, World Government Summit, Open Society Foundations and more.`, canon: '/work/', og: `${SITE}/media/og/home.jpg`, body, schema });
}

/* ---------- UAE landing ---------- */
const UAE_CLIENTS = ['Dubai Future Foundation', 'Museum of the Future', 'World Government Summit', 'Mohammed bin Rashid School of Government (MBRSG)', 'EXPO 2020 Dubai', 'Dubai Future Forum', 'Dubai Future Week', 'World Sports Summit', 'Dubai Sports Council', 'Abu Dhabi Fund for Development', 'World Drone Prix', 'Edge Dubai'];
function uaePage() {
  const body = `<p class="lab">United Arab Emirates · <span lang="ar" dir="rtl">الإمارات العربية المتحدة</span></p>
<h1>Films for UAE government entities, foundations and summits.</h1>
<p class="lead">Panorama Films makes documentaries, docuseries, campaign films and event films for institutions in Dubai and Abu Dhabi — from the first question to the final frame: research, interviews, script, shoot and edit under one creative direction.</p>
<section><p class="lab">Selected UAE work</p><ul class="cards">${UAE.map(k => card(k)).join('')}</ul></section>
<section class="grid2"><div class="c-main"><h2>One studio, first question to final frame.</h2>
<p>We stay with a film from the first question to the final frame: the research and the interviews, the script, the shoot and the cut, so nothing gets lost between hands.</p>
<p>Our work in the Emirates spans the Dubai Future Forum, the docuseries What Does the Future Hold? for the Dubai Future Foundation, Crew-6 astronauts at the Museum of the Future, the World Government Summit, EXPO 2020 Dubai, the World Sports Summit and Dubai Future Week. We work with a small core team in Belgrade and a crew of cinematographers, editors and sound designers who travel wherever the film is.</p>
<p>Services: concept, script, creative direction, direction, production, cinematography, aerial cinematography, editing, sound production, animation and design.</p></div>
<div class="c-side"><h3>Clients in the UAE</h3><ul class="clients" style="columns:1">${UAE_CLIENTS.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div></section>
<section id="studio"><p class="lab">The core team</p><div class="team">${TEAM.map(p => `<div><img src="/media/team/${p.img}.webp" alt="${esc(p.name)}, ${esc(p.role)} at Panorama Films" loading="lazy"><h3>${esc(p.name)}</h3><p class="lab">${esc(p.role)}</p><p>${esc(p.bio)}</p></div>`).join('')}</div></section>
${ask('en')}`;
  const schema = [{ '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': `${SITE}/uae/`, url: `${SITE}/uae/`, name: 'Film production for UAE government entities — Panorama Films', about: { '@id': `${SITE}/#org` },
      mainEntity: { '@type': 'ItemList', itemListElement: UAE.map((k, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}${url(k)}`, name: F[k].title })) } },
    { '@type': 'Service', name: 'Documentary and campaign film production for government entities', serviceType: 'Video production', provider: { '@id': `${SITE}/#org` }, areaServed: [{ '@type': 'City', name: 'Dubai' }, { '@type': 'City', name: 'Abu Dhabi' }, { '@type': 'Country', name: 'United Arab Emirates' }] },
    ORG, ...PEOPLE] }];
  return page({ title: 'Documentary & Campaign Film Production for UAE Government Entities | Panorama Films',
    desc: 'Documentaries, docuseries, campaign and event films for the Dubai Future Foundation, Museum of the Future, World Government Summit and EXPO 2020 Dubai.',
    canon: '/uae/', og: `${SITE}/media/og/uae.jpg`, body, schema });
}

/* ---------- Serbian landing (copy: proposal, for Andrija to approve) ---------- */
const SR_SVC = [
  ['Kratki dokumentarni filmovi', 'Portreti stvarnih ljudi, zajednica i krajeva — priče o neopevanim herojima, tradicijama koje nestaju i promenama koje kreću odozdo.'],
  ['Filmovi o nasleđu', 'Lične i porodične priče snimljene sa pažnjom, kao vremenska kapsula za porodicu ili pojedinca.'],
  ['Filmovi o procesu i iza kulisa', 'Zanat, rad, umetnost i kako stvari nastaju — za etične brendove i nevladine organizacije.'],
  ['Portreti mesta', 'Filmski portreti predela, gradova i arhitekture, uz poetski glas ili ambijentalni zvuk.'],
  ['Etičko brend pripovedanje', 'Kratki filmovi za odgovorne kompanije: priče osnivača, stvarna iskustva korisnika, kampanje.'],
  ['Participativni video', 'Filmovi nastali zajedno sa zajednicom, radionice i obuke za nevladine organizacije.'],
];
const SR_CLIENTS = ['Telekom Srbija', 'Open Society Foundations', 'Goethe-Institut', 'British Council', 'UN Women', 'Civil Rights Defenders', 'SHARE Fondacija', 'BIRN', 'Centar za ženske studije', 'Fondacija za zaštitu ptica grabljivica', 'Nacionalni park Fruška Gora', 'Beogradski sajam', 'European Western Balkans', 'Privredna komora Srbije', 'NIS Gazpromneft', 'Nelt', 'Telenor fondacija', 'Hemofarm fondacija', 'SOS Dečija sela', 'Univerzitet umetnosti u Beogradu', 'Nova Iskra', 'NUNS', 'Startit', 'Strawberry Energy', 'Galerija 12', 'Švedska ambasada u Srbiji', 'Ambasada Republike Koreje u Srbiji', 'Firefly Production', 'Milenijum osiguranje', 'Internet Society Serbia', 'Lovefest', 'Festival uličnih svirača Novi Sad'];
function srPage() {
  const body = `<p class="lab">Beograd · Dubai · ceo svet</p>
<h1>Produkcija dokumentarnih, brend i kampanjskih filmova iz Beograda.</h1>
<p class="lead">Panorama Films je nezavisni studio za kreativno pripovedanje iz Beograda. Pravimo dokumentarne filmove, serijale, kampanje i brend filmove — od istraživanja i scenarija do snimanja, montaže i zvuka.</p>
<section id="radovi"><p class="lab">Radovi u Srbiji i regionu</p><ul class="cards">${[...SRB, ...REGION].map(k => card(k, 'sr')).join('')}</ul></section>
<section><p class="lab">Međunarodni radovi</p><h2>Filmovi za Dubai Future Foundation, Muzej budućnosti i Svetski samit vlada.</h2><ul class="cards">${UAE.slice(0, 6).map(k => card(k, 'sr')).join('')}</ul><p class="lab" style="margin-top:28px"><a href="/work/">Svi radovi →</a></p></section>
<section class="grid2" id="studio"><div class="c-main"><h2>Jedan studio, od prvog pitanja do poslednjeg kadra.</h2>
<p>Ostajemo uz film od prvog pitanja do poslednjeg kadra: istraživanje i intervjui, scenario, snimanje i montaža, tako da se ništa ne izgubi usput.</p>
<p>Naš rad je ukorenjen u stvarnom svetu — mesta koja možete da osetite, ljudi s kojima se povezujete i priče koje traju. Istražujemo nauku, tehnologiju, kulturu i ljudske priče oko njih, uz filmove po narudžbini za globalne brendove, nevladine organizacije i institucije, i sopstvene projekte.</p>
<p>Snimali smo u pustinjama, megalopolisima, šumama, izbegličkim kampovima, laboratorijama, kuhinjama i porodičnim domovima.</p>
<p><b style="font-weight:500">Usluge:</b> koncept, scenario, kreativna režija, režija, produkcija, servisna produkcija, kamera i direktor fotografije, snimanje dronom, montaža, dizajn zvuka, animacija i dizajn.</p></div>
<div class="c-side"><h3>Klijenti i partneri</h3><ul class="clients" style="columns:1">${SR_CLIENTS.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div></section>
<section><p class="lab">Šta pravimo</p><div class="svc">${SR_SVC.map(([h, t]) => `<div><h3>${esc(h)}</h3><p>${esc(t)}</p></div>`).join('')}</div></section>
<section><p class="lab">Tim</p><div class="team">${TEAM.map(p => `<div><img src="/media/team/${p.img}.webp" alt="${esc(p.name)}, ${esc(p.sr)}, Panorama Films" loading="lazy"><h3>${esc(p.name)}</h3><p class="lab">${esc(p.sr)}</p><p>${esc(p.srBio)}</p></div>`).join('')}</div>
<p style="margin-top:28px">Panorama Films kolektiv je otvoren krug snimatelja, montažera, dizajnera zvuka i producenata. Mali smo namerno, da bismo bili blizu rada.</p></section>
${ask('sr')}`;
  const schema = [{ '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': `${SITE}/sr/`, url: `${SITE}/sr/`, inLanguage: 'sr-Latn', name: 'Panorama Films — produkcija dokumentarnih i brend filmova, Beograd', about: { '@id': `${SITE}/#org` } },
    { '@type': 'Service', name: 'Video i filmska produkcija', serviceType: 'Produkcija dokumentarnih, brend i kampanjskih filmova', provider: { '@id': `${SITE}/#org` }, areaServed: [{ '@type': 'City', name: 'Beograd' }, { '@type': 'Country', name: 'Srbija' }] },
    ORG, ...PEOPLE] }];
  return page({ lang: 'sr', title: 'Video produkcija Beograd — dokumentarni, brend i kampanjski filmovi | Panorama Films',
    desc: 'Studio za video i filmsku produkciju iz Beograda: dokumentarni filmovi, serijali, kampanje i brend filmovi za institucije, fondacije, NVO i kompanije.',
    canon: '/sr/', og: `${SITE}/media/og/home.jpg`, alt: [['sr', '/sr/'], ['en', '/'], ['x-default', '/']], body, schema });
}

function notFound() {
  return page({ title: 'Page not found | Panorama Films', desc: 'This page does not exist.', canon: '/404', og: `${SITE}/media/og/home.jpg`,
    body: `<h1>This page isn’t here.</h1><p class="lead">It may have moved when the site was rebuilt. The films are all on the <a href="/work/">Work</a> page.</p><section><ul class="cards">${ORDER.slice(0, 6).map(k => card(k)).join('')}</ul></section>` })
    .replace('<meta name="description"', '<meta name="robots" content="noindex"><meta name="description"');
}

/* ---------- write ---------- */
const w = (p, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true }); fs.writeFileSync(path.join(ROOT, p), s); };
fs.rmSync(path.join(ROOT, 'work'), { recursive: true, force: true });
ORDER.forEach((k, i) => w(`work/${SLUG[k]}/index.html`, projectPage(k, i)));
w('work/index.html', workIndex());
w('uae/index.html', uaePage());
w('sr/index.html', srPage());
w('404.html', notFound());

const urls = [['/', '1.0'], ['/work/', '0.9'], ['/uae/', '0.9'], ['/sr/', '0.9'], ...ORDER.map(k => [url(k), '0.7'])];
w('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(([u, pr]) => `  <url><loc>${SITE}${u}</loc><lastmod>${TODAY}</lastmod><priority>${pr}</priority>${u === '/' || u === '/sr/' ? `
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/"/><xhtml:link rel="alternate" hreflang="sr" href="${SITE}/sr/"/><xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>` : ''}</url>`).join('\n')}
</urlset>
`);

/* old Cargo addresses (panoramafilms.tv/<Page>) that Google still knows → the new project pages */
const red = new Map();
const key = k => k;
Object.entries(Function(`return ${grab(/const SLUG_ALIAS = (\{[^}]*\})/, 'SLUG_ALIAS')}`)()).forEach(([old, k]) => red.set('/' + old, k));
Object.keys(F).forEach(k => { [PJ[k]?.slug, F[k].page].filter(Boolean).forEach(s => red.set('/' + s, k)); });
const lines = ['# generated by tools/seo/build.mjs — old Cargo pages and short paths → current pages', '/contact-form /#contact 301', '/contact /#contact 301', '/about /#studio 301', '/info /#studio 301', '/srpski /sr/ 301', '/rs /sr/ 301', '/en / 301'];
for (const [from, k] of red) {
  const to = ORDER.includes(key(k)) ? url(key(k)) : '/work/';
  if (from.toLowerCase() !== to.replace(/\/$/, '').toLowerCase()) lines.push(`${from} ${to} 301`);
}
w('_redirects', lines.join('\n') + '\n');

/* the slug map the homepage uses for its project links */
const MAP = `/* SEO:WORK — generated by tools/seo/build.mjs; each project's crawlable page is /work/<slug>/ */\nconst WORK = ${JSON.stringify(SLUG)};\n/* /SEO:WORK */`;
html = /\/\* SEO:WORK[\s\S]*?\/\* \/SEO:WORK \*\//.test(html)
  ? html.replace(/\/\* SEO:WORK[\s\S]*?\/\* \/SEO:WORK \*\//, MAP)
  : html.replace('const ext = f =>', MAP + '\nconst ext = f =>');
/* the no-JavaScript list of every project, for crawlers and readers without scripts */
const NOS = `<!-- SEO:NOSCRIPT --><noscript><div class="page" style="padding:120px 0 24px"><p class="lab">The films on this page need JavaScript to load. Every film has its own page, listed below, and is on <a href="https://vimeo.com/panoramafilmstv">Vimeo</a>. Write to hello [at] panoramafilms.tv.</p><ul>${ORDER.map(k => `<li><a href="${url(k)}">${esc(F[k].title)}</a> — ${esc(F[k].client)}${F[k].year ? ', ' + esc(F[k].year) : ''}</li>`).join('')}</ul><p><a href="/work/">All work</a> · <a href="/uae/">UAE</a> · <a href="/sr/" hreflang="sr">Srpski</a></p></div></noscript><!-- /SEO:NOSCRIPT -->`;
html = /<!-- SEO:NOSCRIPT -->[\s\S]*?<!-- \/SEO:NOSCRIPT -->/.test(html)
  ? html.replace(/<!-- SEO:NOSCRIPT -->[\s\S]*?<!-- \/SEO:NOSCRIPT -->/, NOS)
  : html.replace(/<noscript><p class="page lab"[\s\S]*?<\/noscript>/, NOS);
/* homepage structured data */
const HOME_LD = `<!-- SEO:LD -->${ld({ '@context': 'https://schema.org', '@graph': [
  { '@type': 'WebSite', '@id': `${SITE}/#site`, url: `${SITE}/`, name: 'Panorama Films', inLanguage: 'en', publisher: { '@id': `${SITE}/#org` } },
  ORG, ...PEOPLE,
  { '@type': 'ItemList', name: 'Featured films', itemListElement: LIST.slice(0, 7).map((k, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}${url(k)}`, name: F[k].title })) }] })}<!-- /SEO:LD -->`;
html = /<!-- SEO:LD -->[\s\S]*?<!-- \/SEO:LD -->/.test(html) ? html.replace(/<!-- SEO:LD -->[\s\S]*?<!-- \/SEO:LD -->/, HOME_LD) : html.replace('</head>', HOME_LD + '</head>');
fs.writeFileSync(path.join(ROOT, 'index.html'), html);
/* sources for the 1200×630 share images (tools/seo/og.py) */
w('tools/seo/og-sources.json', JSON.stringify({ home: '/media/stills/reel.webp', uae: still('astro'), ...Object.fromEntries(ORDER.map(k => [SLUG[k], still(k)])) }, null, 1));
console.log(`ok: ${ORDER.length} project pages, work, uae, sr, 404, sitemap (${urls.length} urls), _redirects (${lines.length - 1} rules)`);
