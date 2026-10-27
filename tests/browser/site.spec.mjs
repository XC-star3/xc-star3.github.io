import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Icon CDN availability must not determine whether local site tests pass.
  await page.route('https://cdn.bootcdn.net/**', (route) => route.fulfill({ contentType: 'text/css', body: '' }));
});

test('first visits use light even on dark systems and explicit choices persist across pages', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  for (const url of ['/', ...[1, 2, 3, 4].map((n) => `/pages/projects/project${n}.html`), '/pages/posts/index.html']) {
    await page.goto(`${url}?nointro=1&noreveal=1`);
    await expect.poll(() => page.evaluate(() => window.SiteInitialized)).toBe(true);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  }
  await page.locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.goto('/?nointro=1&noreveal=1');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('navigation follows the current section and clears when returning to the top', async ({ page }) => {
  await page.goto('/?nointro=1&noreveal=1');
  await expect.poll(() => page.evaluate(() => window.SiteInitialized)).toBe(true);
  const awardsLink = page.locator('.nav-links a[href="#awards"]');
  await awardsLink.click();
  await expect(awardsLink).toHaveAttribute('aria-current', 'location');
  await page.locator('.logo').click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator('.nav-links a.active')).toHaveCount(0);
  await page.evaluate(() => document.getElementById('awards').scrollIntoView());
  await expect(awardsLink).toHaveClass(/active/);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator('.nav-links a.active')).toHaveCount(0);
  await expect(page.locator('.nav-links a[aria-current]')).toHaveCount(0);
});

test('blocked storage and failed locale requests preserve readable content', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, 'getItem', { value() { throw new Error('Storage denied'); } });
    Object.defineProperty(Storage.prototype, 'setItem', { value() { throw new Error('Storage denied'); } });
  });
  await page.route('**/lang/*.json', (route) => route.abort());
  await page.goto('/?nointro=1&noreveal=1');
  await expect(page.locator('.project-card')).toHaveCount(4);
  await page.locator('.lang-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.locator('h1')).toContainText('XC');
  await page.locator('.theme-toggle').click();
  expect(errors).toEqual([]);
});

test('delayed English response cannot undo a newer Chinese selection', async ({ page }) => {
  let release;
  const pending = new Promise((resolve) => { release = resolve; });
  await page.route('**/lang/en.json', async (route) => {
    await pending;
    await route.continue();
  });
  await page.goto('/?nointro=1&noreveal=1');
  // Start the request without awaiting the deliberately delayed response.
  await page.evaluate(() => { window.i18n.changeLang('en'); });
  await expect.poll(() => page.evaluate(() => window.i18n.requestedLang())).toBe('en');
  await page.locator('.lang-toggle').click();
  release();
  await page.waitForResponse('**/lang/en.json');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.locator('h1')).toContainText('XC');
});

test('language choice survives navigation to the blog notice', async ({ page }) => {
  await page.goto('/?nointro=1&noreveal=1');
  await page.locator('.lang-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.goto('/pages/posts/index.html');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('h1')).toHaveText('The blog is still in development');
  await page.locator('.lang-toggle').click();
  await expect(page.locator('h1')).toHaveText('博客网站还在开发');
});

test('blog notice is readable with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.route('https://cdn.bootcdn.net/**', (route) => route.fulfill({ body: '' }));
  await page.goto('/pages/posts/index.html');
  await expect(page.locator('h1')).toHaveText('博客网站还在开发');
  await expect(page.locator('main')).toContainText('独立博客正在搭建中');
  await page.goto('/');
  await expect(page.locator('.project-card')).toHaveCount(4);
  await expect(page.locator('h1')).toBeVisible();
  await context.close();
});

test('all pages initialize without exceptions or missing local resources', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (new URL(response.url()).hostname === '127.0.0.1' && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  for (const url of ['/', ...[1, 2, 3, 4].map((n) => `/pages/projects/project${n}.html`),
    '/pages/posts/index.html']) {
    await page.goto(`${url}?nointro=1&noreveal=1`);
    await expect(page.locator('h1')).toBeVisible();
    expect((await page.locator('main').innerText()).length).toBeGreaterThan(50);
  }
  expect(errors).toEqual([]);
});

test('blog entry opens the development notice', async ({ page }) => {
  await page.goto('/?nointro=1&noreveal=1');
  await page.locator('.nav-links [data-blog-link]').click();
  await expect(page.locator('h1')).toHaveText('博客网站还在开发');
});

test('a configured external blog is linked directly and the notice redirects', async ({ page }) => {
  await page.route('**/assets/js/site-config.js', (route) => route.fulfill({
    contentType: 'application/javascript', body: 'window.SiteConfig = {blogUrl:"https://blog.example.com/"};',
  }));
  await page.route('https://blog.example.com/', (route) => route.fulfill({ contentType: 'text/html', body: '<h1>External blog</h1>' }));
  await page.goto('/?nointro=1&noreveal=1');
  await expect(page.locator('.nav-links [data-blog-link]')).toHaveAttribute('href', 'https://blog.example.com/');
  await expect(page.locator('.intro-actions [data-blog-link]')).toHaveAttribute('href', 'https://blog.example.com/');
  await page.locator('.intro-actions [data-blog-link]').click();
  await expect(page).toHaveURL('https://blog.example.com/');
  await page.goto('/pages/posts/index.html');
  await expect(page).toHaveURL('https://blog.example.com/');
});

test('forced introduction supports keyboard exit and restores page access', async ({ page }) => {
  await page.goto('/?intro=1');
  await expect(page.locator('.opening-panel')).toBeVisible();
  await page.locator('.opening-panel').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-opening-skip]')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('[data-opening-enter]')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-opening-skip]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#opening-sequence')).toBeHidden();
  await expect(page.locator('main')).not.toHaveAttribute('inert', '');
});

test('single-page introduction closes automatically after four seconds', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.clock.install();
  await page.goto('/?intro=1');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await page.locator('.opening-viewport').evaluate((el) =>
    getComputedStyle(el).color === getComputedStyle(document.body).color)).toBe(true);
  await expect(page.locator('#opening-sequence')).toHaveClass(/is-visible/);
  await expect(page.locator('.opening-slide')).toHaveCount(1);
  await expect(page.locator('#opening-progress-count')).toHaveText('04 s');
  await page.clock.fastForward(2000);
  // Rerendering translated content must not restart the countdown.
  await page.evaluate(() => window.i18n.changeLang('zh'));
  await page.clock.fastForward(2350);
  await expect(page.locator('#opening-sequence')).toBeHidden();
  await expect(page.locator('main')).not.toHaveAttribute('inert', '');
  await expect(page.locator('body')).not.toHaveClass(/opening-active/);
  await expect(page.locator('.logo')).toBeFocused();
  await expect(page.locator('h1')).toBeVisible();
});

test('mobile pages stay within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const url of ['/', '/pages/posts/index.html', '/pages/projects/project2.html']) {
    await page.goto(`${url}?nointro=1&noreveal=1`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});
