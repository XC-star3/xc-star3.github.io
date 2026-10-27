(() => {
  const { qs, clear, t, sitePath, renderSpanTags } = window.SiteShared;
  const { PROJECTS, OPEN_SOURCE_ITEMS, TIMELINE_EVENTS, AWARDS, TECH_STACK, CONTACT_LINKS } = window.SiteData;
  function renderProjectTags(tags) {
    if (!Array.isArray(tags)) return '';
    return `<div class="project-tags">${renderSpanTags(tags, 'project-tag')}</div>`;
  }

  function renderProjectThumbnail(project) {
    if (project.image) {
      const small = sitePath(project.imageSmall || project.image);
      const large = sitePath(project.image);
      const srcset = project.imageSmall ? `${small} 800w, ${large} 1600w` : '';
      return `
        <div class="project-thumbnail">
          <img
            src="${small}"
            ${srcset ? `srcset="${srcset}"` : ''}
            sizes="(max-width: 820px) 100vw, (max-width: 1080px) 50vw, 560px"
            alt="${t(project.imageAltKey)}"
            loading="lazy"
            decoding="async"
            style="object-position: ${project.imagePosition || 'center'}"
          >
        </div>
      `;
    }

    const icon = project.placeholder?.icon || 'fas fa-file-lines';
    const label = project.placeholder?.labelKey ? t(project.placeholder.labelKey) : t('projects.mediaReserved');
    const hint = project.placeholder?.hintKey ? t(project.placeholder.hintKey) : t('projects.mediaHint');

    return `
      <div class="project-thumbnail project-thumbnail-placeholder" role="img" aria-label="${t(project.titleKey)}">
        <span class="project-thumbnail-icon"><i class="${icon}"></i></span>
        <strong class="project-thumbnail-label">${label}</strong>
        <span class="project-thumbnail-hint">${hint}</span>
      </div>
    `;
  }

  function initContactLinks() {
    const container = qs('.intro-contact-links');
    if (!container) return;
    clear(container);

    CONTACT_LINKS.forEach((contact) => {
      const label = t(contact.key);
      const item = document.createElement('a');
      item.className = 'intro-contact-link';
      item.href = contact.link;
      if (contact.link.startsWith('http')) {
        item.target = '_blank';
        item.rel = 'noopener noreferrer';
      }
      item.title = label;
      item.setAttribute('aria-label', label);
      item.innerHTML = `<i class="${contact.icon}"></i>`;
      container.appendChild(item);
    });
  }

  function initProjects() {
    const grid = qs('.projects-grid');
    if (!grid) return;
    clear(grid);

    PROJECTS.forEach((project) => {
      const card = document.createElement('article');
      card.className = `card project-card${project.wide ? ' project-card--wide' : ''}`;
      card.innerHTML = `
        <div class="project-thumbnail-wrapper">
          ${renderProjectThumbnail(project)}
        </div>
        <div class="project-info">
          <div class="project-topline">
            <span class="project-meta">${t(project.metaKey)}</span>
            ${
              project.awardKey
                ? `<span class="project-award"><i class="fas fa-trophy" aria-hidden="true"></i>${t(project.awardKey)}</span>`
                : ''
            }
          </div>
          <h3>${t(project.titleKey)}</h3>
          <p>${t(project.descKey)}</p>
          ${renderProjectTags(project.tags)}
          <a href="${sitePath(project.link)}" class="project-link">${t('projects.viewDetail')}</a>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function initOpenSource() {
    const grid = qs('.opensource-grid');
    if (!grid) return;
    clear(grid);

    OPEN_SOURCE_ITEMS.forEach((item) => {
      const tags = t(`${item.key}.tags`) || [];
      let actions = '';

      if (item.linkCode) {
        actions += `<a href="${item.linkCode}" target="_blank" rel="noopener noreferrer" class="os-btn"><i class="fab fa-github"></i> ${t('opensource.btnCode')}</a>`;
      }
      if (item.linkDoc) {
        actions += `<a href="${item.linkDoc}" target="_blank" rel="noopener noreferrer" class="os-btn"><i class="fas fa-book"></i> ${t('opensource.btnDoc')}</a>`;
      }

      const row = document.createElement('article');
      row.className = 'os-card';
      row.innerHTML = `
        <div class="os-main">
          <div class="os-header">
            <h3 class="os-title">${t(`${item.key}.title`)}</h3>
            <div class="os-tags">${renderSpanTags(tags, 'os-tag')}</div>
          </div>
          <p class="os-desc">${t(`${item.key}.desc`)}</p>
        </div>
        <div class="os-actions">${actions}</div>
      `;
      grid.appendChild(row);
    });
  }

  function initTimeline() {
    const container = qs('.timeline-container');
    if (!container) return;
    clear(container);

    TIMELINE_EVENTS.forEach((key) => {
      const item = document.createElement('article');
      item.className = 'timeline-item';
      item.innerHTML = `
        <div class="timeline-dot"></div>
        <span class="timeline-date">${t(`${key}.date`)}</span>
        <div class="timeline-content">
          <h3>${t(`${key}.title`)}</h3>
          <p>${t(`${key}.desc`)}</p>
        </div>
      `;
      container.appendChild(item);
    });
  }

  function initAwards() {
    const mount = qs('.awards-list');
    if (!mount) return;
    clear(mount);

    AWARDS.forEach((key) => {
      const item = document.createElement('li');
      item.className = 'award-item';
      item.innerHTML = `
        <span class="award-date">${t(`${key}.date`)}</span>
        <span class="award-title">${t(`${key}.title`)}</span>
        <span class="award-level">${t(`${key}.level`)}</span>
      `;
      mount.appendChild(item);
    });
  }

  function initTechStack() {
    const container = qs('.skills-wrapper');
    if (!container) return;
    clear(container);

    TECH_STACK.forEach((group) => {
      const col = document.createElement('section');
      col.className = 'skill-category';
      col.innerHTML = `
        <h3>${t(group.category)}</h3>
        <div class="skill-list">
          ${group.items.map((item) => `<div class="skill-badge"><i class="${item.icon}"></i> ${item.name}</div>`).join('')}
        </div>
      `;
      container.appendChild(col);
    });
  }

  window.SiteHome = {
    render() {
      initContactLinks();
      initProjects();
      initOpenSource();
      initTimeline();
      initAwards();
      initTechStack();
    },
  };
})();
