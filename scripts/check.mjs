import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const root = fileURLToPath(new URL('../', import.meta.url));
const errors = [];
const read = (name) => readFile(path.join(root, name), 'utf8');
function flatten(object, prefix = '') {
  return Object.entries(object).flatMap(([key, value]) => {
    const name = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'object' && value !== null ? flatten(value, name) : [[name, value]];
  });
}
const zh = JSON.parse(await read('lang/zh.json'));
const en = JSON.parse(await read('lang/en.json'));
const zhKeys = new Map(flatten(zh));
const enKeys = new Map(flatten(en));
for (const [a, b, language] of [[zhKeys, enKeys, 'en'], [enKeys, zhKeys, 'zh']]) {
  for (const key of a.keys()) if (!b.has(key)) errors.push(`Missing ${language} translation: ${key}`);
}
const config = JSON.parse(await read('site.config.json'));
if (!['XC', 'XC-star3'].includes(config.author)) errors.push('Public author must use XC or XC-star3');
const siteConfig = { window: {} };
vm.runInNewContext(await read('assets/js/site-config.js'), siteConfig);
if (siteConfig.window.SiteConfig.blogUrl !== (config.blogUrl ? new URL(config.blogUrl).href : '')) errors.push('Stale site-config.js; run npm run generate');
const sandbox = { window: {} };
for (const name of ['site-data.js', 'fallback-zh.js']) {
  vm.runInNewContext(await read(`assets/js/${name}`), sandbox, { filename: name });
}
if (JSON.stringify(sandbox.window.SiteDefaultLocale) !== JSON.stringify(zh)) errors.push('Stale fallback-zh.js; run npm run generate');
const get = (object, key) => key.split('.').reduce((value, part) => value?.[part], object);
async function localReference(from, reference) {
  if (!reference || /^(?:[a-z]+:|\/\/)/i.test(reference)) return;
  const [pathname, fragment] = reference.split('#');
  const target = path.resolve(path.dirname(from), decodeURIComponent(pathname.split('?')[0]) || path.basename(from));
  try { await access(target); }
  catch { errors.push(`${path.relative(root, from)}: missing ${reference}`); return; }
  if (fragment && target.endsWith('.html')) {
    const { document } = parseHTML(await readFile(target, 'utf8'));
    if (!document.getElementById(decodeURIComponent(fragment))) errors.push(`${path.relative(root, from)}: missing anchor ${reference}`);
  }
}
const files = ['index.html'];
for (const dir of ['pages/projects', 'pages/posts']) {
  for (const name of await readdir(path.join(root, dir))) if (name.endsWith('.html')) files.push(`${dir}/${name}`);
}
for (const name of files) {
  const file = path.join(root, name);
  const { document } = parseHTML(await read(name));
  const ids = new Set();
  for (const el of document.querySelectorAll('[id]')) {
    if (ids.has(el.id)) errors.push(`${name}: duplicate id ${el.id}`);
    ids.add(el.id);
  }
  for (const el of document.querySelectorAll('[data-i18n], [data-title-i18n]')) {
    const key = el.getAttribute('data-i18n') || el.getAttribute('data-title-i18n');
    if (!zhKeys.has(key) || !enKeys.has(key)) errors.push(`${name}: missing translation ${key}`);
  }
  for (const el of document.querySelectorAll('[href], [src]')) {
    for (const attr of ['href', 'src']) if (el.hasAttribute(attr)) await localReference(file, el.getAttribute(attr));
  }
  for (const el of document.querySelectorAll('[srcset]')) {
    for (const item of el.getAttribute('srcset').split(',')) await localReference(file, item.trim().split(/\s+/)[0]);
  }
  if (document.querySelectorAll('h1').length !== 1) errors.push(`${name}: expected exactly one h1`);
  if (!document.querySelector('meta[name="description"]')?.content) errors.push(`${name}: missing description`);
  const placeholder = document.body.hasAttribute('data-blog-placeholder');
  const url = placeholder ? config.blogUrl || new URL('pages/posts/index.html', config.url).href : new URL(name === 'index.html' ? '' : name, config.url).href;
  if (document.querySelector('link[rel="canonical"]')?.href !== url) errors.push(`${name}: incorrect canonical`);
  if (document.querySelector('meta[property="og:url"]')?.content !== url) errors.push(`${name}: incorrect og:url`);
  try {
    const schema = JSON.parse(document.getElementById('page-schema')?.textContent || 'null');
    if (schema?.url !== url) errors.push(`${name}: incorrect JSON-LD URL`);
  } catch { errors.push(`${name}: invalid JSON-LD`); }
}
function inspect(value) {
  if (Array.isArray(value)) { value.forEach(inspect); return; }
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    if ((key.endsWith('Key') || ['key', 'category'].includes(key)) && typeof item === 'string' && item.includes('.')) {
      for (const [lang, data] of [['zh', zh], ['en', en]]) if (get(data, item) === undefined) errors.push(`Data: missing ${lang} ${item}`);
    }
    inspect(item);
  }
}
inspect(sandbox.window.SiteData);
for (const project of sandbox.window.SiteData.PROJECTS) {
  for (const key of ['link', 'image', 'imageSmall']) if (project[key]) await localReference(path.join(root, 'index.html'), project[key]);
}
for (const name of await readdir(path.join(root, 'assets/js'))) {
  if (name.endsWith('.js')) {
    try { new vm.Script(await read(`assets/js/${name}`), { filename: name }); }
    catch (error) { errors.push(error.message); }
  }
}
const sitemap = await read('sitemap.xml');
for (const name of files) {
  const url = new URL(name === 'index.html' ? '' : name, config.url).href;
  if (name.startsWith('pages/posts/')) {
    if (sitemap.includes(url)) errors.push(`Paused blog should not appear in sitemap: ${name}`);
  } else if (!sitemap.includes(url)) errors.push(`Sitemap missing ${name}`);
}
if (!(await read('robots.txt')).includes(new URL('sitemap.xml', config.url).href)) errors.push('Incorrect robots.txt sitemap');
const readme = await read('README.md');
for (const match of readme.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
  if (!/^[a-z]+:/i.test(match[1])) await localReference(path.join(root, 'README.md'), match[1]);
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Checked ${files.length} pages, ${zhKeys.size} bilingual keys, resources, static content, SEO, data and JavaScript syntax.`);
