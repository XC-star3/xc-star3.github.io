import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.resolve(root, '_site');
if (path.dirname(output) !== path.resolve(root)) throw new Error('Build directory must stay within the project');
await rm(output, { recursive: true, force: true });
await mkdir(output);
for (const name of ['index.html', 'assets', 'lang', 'pages', 'robots.txt', 'sitemap.xml', '.nojekyll']) {
  await cp(path.join(root, name), path.join(output, name), { recursive: true });
}
console.log('Built public site in _site/; development files are excluded.');
