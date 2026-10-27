(() => {
  const { qs, qsa, localized } = window.SiteShared;
  const opening = window.SiteOpening;
  let syncOpeningSequence = () => {};
  function initBlogLinks() {
    const url = window.SiteConfig?.blogUrl;
    if (!url) return;
    qsa('[data-blog-link]').forEach((link) => { link.href = url; });
    if (document.body.hasAttribute('data-blog-placeholder')) window.location.replace(url);
  }
  function initThemeToggle() {
    const toggleBtn = qs('.theme-toggle');
    const htmlEl = document.documentElement;
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      const currentTheme = htmlEl.getAttribute('data-theme');
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light';

      htmlEl.setAttribute('data-theme', nextTheme);
      window.SiteStorage.set('theme', nextTheme);
    });
  }

  function initLangToggle() {
    const toggleBtn = qs('.lang-toggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      const next = window.i18n.requestedLang() === 'en' ? 'zh' : 'en';
      window.i18n.changeLang(next);
    });
  }

  function initOpeningSequence() {
    const overlay = qs('#opening-sequence');
    if (!overlay || !opening) return;

    const panel = qs('.opening-panel', overlay);
    const track = qs('#opening-track', overlay);
    const hint = qs('#opening-hint', overlay);
    const count = qs('#opening-progress-count', overlay);
    const fill = qs('#opening-progress-fill', overlay);
    const enterBtn = qs('[data-opening-enter]', overlay);
    const skipBtn = qs('[data-opening-skip]', overlay);
    const chrome = [qs('.site-nav'), qs('main'), qs('footer')];
    let active = false;
    let timeout;
    let interval;
    let deadline = 0;

    function updateCountdown() {
      const remaining = active ? Math.max(0, deadline - performance.now()) : opening.durationMs;
      const seconds = Math.ceil(remaining / 1000);
      count.textContent = `${String(seconds).padStart(2, '0')} s`;
      hint.textContent = localized(opening.ui.hint).replace('{seconds}', seconds);
      fill.style.width = `${remaining / opening.durationMs * 100}%`;
    }

    function render() {
      const { slide, ui } = opening;
      track.innerHTML = `
        <article class="opening-slide">
          <div class="opening-stage">
            <p class="opening-kicker">${localized(slide.kicker)}</p>
            <h2 class="opening-title">${localized(slide.title)}</h2>
            <p class="opening-subtitle">${localized(slide.subtitle)}</p>
            <p class="opening-lede">${localized(slide.lede)}</p>
            <ol class="opening-points">
              ${localized(slide.points).map((point, index) => `
                <li class="opening-point">
                  <span class="opening-point-index">${String(index + 1).padStart(2, '0')}</span>
                  <span class="opening-point-text">${point}</span>
                </li>`).join('')}
            </ol>
            <div class="opening-stage-tags">
              ${localized(slide.tags).map((tag) => `<span class="opening-aside-tag">${tag}</span>`).join('')}
            </div>
          </div>
        </article>`;
      panel.setAttribute('aria-label', localized(ui.dialogLabel));
      skipBtn.textContent = localized(ui.skip);
      enterBtn.textContent = localized(ui.enter);
      updateCountdown();
    }

    function close() {
      if (!active) return;
      active = false;
      window.clearTimeout(timeout);
      window.clearInterval(interval);
      overlay.classList.remove('is-visible');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('opening-active');
      chrome.forEach((el) => { el.inert = false; el.removeAttribute('aria-hidden'); });
      qs('.logo').focus({ preventScroll: true });
      window.setTimeout(() => { overlay.hidden = true; }, 320);
    }

    skipBtn.addEventListener('click', close);
    enterBtn.addEventListener('click', close);
    overlay.addEventListener('keydown', (event) => {
      if (!active) return;
      if (event.key === 'Tab') {
        const buttons = [skipBtn, enterBtn];
        const index = buttons.indexOf(document.activeElement);
        const next = event.shiftKey ? (index <= 0 ? 1 : 0) : (index + 1) % 2;
        event.preventDefault();
        buttons[next].focus();
      } else if (['Escape', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        close();
      }
    });

    syncOpeningSequence = render;
    render();
    if (!document.documentElement.classList.contains('opening-pending')) return;
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.remove('opening-pending');
    document.body.classList.add('opening-active');
    chrome.forEach((el) => { el.inert = true; el.setAttribute('aria-hidden', 'true'); });
    active = true;
    window.requestAnimationFrame(() => {
      if (!active) return;
      overlay.classList.add('is-visible');
      panel.focus({ preventScroll: true });
      deadline = performance.now() + opening.durationMs;
      updateCountdown();
      timeout = window.setTimeout(close, opening.durationMs);
      interval = window.setInterval(updateCountdown, 1000);
    });
  }

  function initPointerParticles() {
    const canvas = qs('.mouse-particles');
    if (!canvas) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (reducedMotion || coarsePointer || window.innerWidth < 640) {
      canvas.remove();
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles = [];
    let rafId = 0;
    let lastX = 0;
    let lastY = 0;
    let lastSpawnAt = 0;

    function particleColors(alpha) {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      return isDark
        ? {
            core: `rgba(141, 180, 255, ${alpha})`,
            glow: `rgba(141, 180, 255, ${alpha * 0.18})`,
          }
        : {
            core: `rgba(39, 88, 165, ${alpha})`,
            glow: `rgba(39, 88, 165, ${alpha * 0.16})`,
          };
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn(x, y, count, intensity) {
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 0.3 + Math.random() * intensity;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - 0.15,
          life: 18 + Math.random() * 12,
          maxLife: 18 + Math.random() * 12,
          size: 7 + Math.random() * 10,
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const particle = particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.985;
        particle.vy = particle.vy * 0.988 + 0.005;
        particle.life -= 1;

        if (particle.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = particle.life / particle.maxLife;
        const radius = particle.size * alpha;
        const colors = particleColors(alpha * 0.92);
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, radius);
        gradient.addColorStop(0, colors.core);
        gradient.addColorStop(1, colors.glow);

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = window.requestAnimationFrame(tick);
    }

    function handlePointerMove(event) {
      const now = performance.now();
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      const speed = Math.hypot(dx, dy);
      lastX = event.clientX;
      lastY = event.clientY;

      if (now - lastSpawnAt < 18) return;
      const count = Math.min(5, Math.max(1, Math.round(speed / 26)));
      spawn(event.clientX, event.clientY, count, 0.9);
      lastSpawnAt = now;
    }

    function handlePointerDown(event) {
      spawn(event.clientX, event.clientY, 10, 1.4);
    }

    resize();
    tick();

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        window.cancelAnimationFrame(rafId);
      } else {
        rafId = window.requestAnimationFrame(tick);
      }
    });
  }

  function initSmoothScroll() {
    document.addEventListener('click', (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.getElementById(decodeURIComponent(href.slice(1)));
      if (!target) return;
      event.preventDefault();
      history.pushState(null, '', href);
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 88,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  }

  function initSectionSpy() {
    const items = qsa('.nav-links a[href^="#"]').map((link) => ({
      link,
      section: document.getElementById(link.getAttribute('href').slice(1)),
    })).filter((item) => item.section);
    if (!items.length) return;

    function update() {
      const marker = Math.max(qs('.site-nav').getBoundingClientRect().bottom + 24, window.innerHeight * 0.3);
      let current = window.scrollY > 0 && items.find(({ section }) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= marker && rect.bottom > marker;
      });
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        current = items.at(-1);
      }
      items.forEach((item) => {
        const active = item === current;
        item.link.classList.toggle('active', active);
        if (active) item.link.setAttribute('aria-current', 'location');
        else item.link.removeAttribute('aria-current');
      });
    }

    let scheduled = false;
    function schedule() {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(() => { scheduled = false; update(); });
    }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('i18nLoaded', schedule);
    update();
  }

  let cleanRevealMotion = () => {};
  function initRevealMotion() {
    cleanRevealMotion();
    const targets = [
      ...qsa('.projects-grid .card'),
      ...qsa('.opensource-grid .os-card'),
      ...qsa('.timeline-container .timeline-item'),
      ...qsa('.awards-list .award-item'),
      ...qsa('.skills-wrapper .skill-category'),
      ...qsa('.project-detail-card'),
    ];

    if (!targets.length) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const skipReveal = new URLSearchParams(window.location.search).get('noreveal') === '1';
    targets.forEach((el, index) => {
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', `${(index % 6) * 60}ms`);
    });

    const revealAll = () => {
      targets.forEach((el) => el.classList.add('is-visible'));
    };

    if (reducedMotion || skipReveal || typeof IntersectionObserver === 'undefined') {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries, instance) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          instance.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px',
      },
    );

    targets.forEach((el) => observer.observe(el));

    // Print / headless full-page capture never scroll, so IO never fires.
    window.addEventListener('beforeprint', revealAll);
    const timer = window.setTimeout(() => {
      targets.forEach((el) => {
        if (!el.classList.contains('is-visible')) {
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      });
    }, 2800);
    cleanRevealMotion = () => {
      observer.disconnect();
      window.clearTimeout(timer);
      window.removeEventListener('beforeprint', revealAll);
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initLangToggle();
    initBlogLinks();
    initOpeningSequence();
    initPointerParticles();
    initSmoothScroll();
    initSectionSpy();
    window.SiteInitialized = true;
    renderContent();
  });

  function renderContent() {
    syncOpeningSequence();
    window.SiteHome?.render();
    initRevealMotion();
  }
  window.addEventListener('i18nLoaded', () => {
    if (window.SiteInitialized) renderContent();
  });
})();
