import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

test('committed static pages and locale fallback match their sources; generation is repeatable', async () => {
  const files = ['index.html', 'assets/js/fallback-zh.js', 'assets/js/site-config.js', 'sitemap.xml', 'robots.txt', '.nojekyll'];
  for (const dir of ['pages/posts', 'pages/projects']) {
    for (const name of await readdir(path.join(root, dir))) if (name.endsWith('.html')) files.push(`${dir}/${name}`);
  }
  const before = new Map(await Promise.all(files.map(async (file) => [file, await readFile(path.join(root, file), 'utf8')])));
  execFileSync(process.execPath, ['scripts/generate.mjs'], { cwd: root });
  for (const file of files) {
    assert.equal(await readFile(path.join(root, file), 'utf8'), before.get(file), `${file} is stale: run npm run generate and include its output`);
  }
});
