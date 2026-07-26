document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('favorites-preview-container');
  const noFavsMsg = document.getElementById('noFavoritesMsg');

  if (!container || !noFavsMsg) return;

  function getFavoriteEntries() {
    try {
      return getFavorites();
    } catch {
      return [];
    }
  }

  function renderEmptyState() {
    container.innerHTML = '';
    noFavsMsg.textContent = "You haven't added any favorites yet.";
    noFavsMsg.classList.remove('nonedisplay');
  }

  function showSkeletons(count) {
    const cards = Array.from({ length: Math.max(count, 1) }).map(() => `
      <div class="col-12 col-lg-6">
        <article class="favorite-card favorite-card-skeleton placeholder-glow" aria-hidden="true">
          <div class="favorite-card-media placeholder"></div>
          <div class="favorite-card-body">
            <span class="placeholder col-4 mb-3"></span>
            <span class="placeholder col-9 mb-3"></span>
            <span class="placeholder col-12 mb-2"></span>
            <span class="placeholder col-10 mb-4"></span>
            <span class="placeholder col-5"></span>
          </div>
        </article>
      </div>
    `).join('');

    container.innerHTML = `<div class="row g-4 favorites-grid">${cards}</div>`;
  }

  function truncateHTML(html, maxChars = 220) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    let count = 0;

    function walk(node) {
      if (count >= maxChars) {
        node.remove();
        return;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        const remaining = maxChars - count;
        if (node.textContent.length > remaining) {
          node.textContent = `${node.textContent.slice(0, remaining)}...`;
          count = maxChars;
        } else {
          count += node.textContent.length;
        }
        return;
      }

      [...node.childNodes].forEach(walk);
    }

    [...wrapper.childNodes].forEach(walk);
    return wrapper.innerHTML;
  }

  function articlePreview(content) {
    const html = (typeof marked !== 'undefined' && marked.parse)
      ? marked.parse(content || '')
      : (content || '');
    return truncateHTML(html);
  }

  function favoriteCard(art, isFullWidth = false) {
    const col = document.createElement('div');
    col.className = isFullWidth ? 'col-12' : 'col-12 col-lg-6';

    col.innerHTML = `
      <article class="favorite-card fade-in h-100" data-favorite-card="${art.slug}">
        <div class="favorite-card-actions">
          ${renderFavoriteButton(art.slug, 'favorite-card-btn')}
        </div>
        <a href="article.html?slug=${encodeURIComponent(art.slug)}" class="favorite-card-media-link" aria-label="Read ${art.title || 'article'}">
          <img src="${art.cover || 'pics/default-image.webp'}" class="favorite-card-media" alt="${art.title || ''}">
        </a>
        <div class="favorite-card-body">
          <strong class="category-text">${[].concat(art.categories || []).join(' | ')}</strong>
          <h2 class="favorite-card-title">${art.title || 'Untitled'}</h2>
          <div class="favorite-meta d-flex flex-column gap-1 small">
            <span>${art.date || 'Unknown date'}</span>
            <span>${art.authors || 'Unknown author'}</span>
            <span class="saved-since">${formatSavedSince(art.savedAt)}</span>
          </div>
          <div class="article-preview favorite-card-preview">${articlePreview(art.content)}</div>
          <a href="article.html?slug=${encodeURIComponent(art.slug)}" class="btn button mt-auto align-self-start">Read</a>
        </div>
      </article>
    `;

    bindFavoriteButtons(col);
    return col;
  }

  function renderFavoriteGrid(list, target) {
    const grid = document.createElement('div');
    grid.className = 'row g-4 favorites-grid';

    list.forEach((art, index) => {
      const isLastOdd = list.length % 2 === 1 && index === list.length - 1;
      grid.appendChild(favoriteCard(art, isLastOdd));
    });

    target.appendChild(grid);
  }

  function renderFavorites(list) {
    container.innerHTML = '';

    if (!list.length) {
      renderEmptyState();
      return;
    }

    noFavsMsg.classList.add('nonedisplay');

    if (list.length <= 3) {
      renderFavoriteGrid(list, container);
      initFadeObserver();
      return;
    }

    renderFavoriteGrid(list.slice(0, 3), container);

    const toggleWrap = document.createElement('div');
    toggleWrap.className = 'd-flex justify-content-center my-4';
    toggleWrap.innerHTML = `
      <button class="btn btn-outline-themed" type="button" data-bs-toggle="collapse" data-bs-target="#moreFavorites" aria-expanded="false" aria-controls="moreFavorites">
        Show ${list.length - 3} more favorite${list.length - 3 === 1 ? '' : 's'}
      </button>
    `;
    container.appendChild(toggleWrap);

    const collapse = document.createElement('div');
    collapse.id = 'moreFavorites';
    collapse.className = 'collapse favorites-collapse';
    renderFavoriteGrid(list.slice(3), collapse);
    container.appendChild(collapse);

    initFadeObserver();
  }

  function loadFavorites() {
    const favEntries = getFavoriteEntries();
    if (!favEntries.length) {
      renderEmptyState();
      return;
    }

    noFavsMsg.classList.add('nonedisplay');
    showSkeletons(Math.min(favEntries.length, 6));

    const savedAtBySlug = new Map(favEntries.map(entry => [entry.slug, entry.savedAt || null]));

    Promise.all(
      favEntries.map(({ slug }) =>
        fetch(`articles/${encodeURIComponent(slug)}.json`)
          .then(r => r.ok ? r.json().then(d => ({ ...d, slug, savedAt: savedAtBySlug.get(slug) || null })) : null)
          .catch(() => null)
      )
    )
      .then(list => renderFavorites((list || []).filter(Boolean)))
      .catch(() => {
        container.innerHTML = '';
        noFavsMsg.classList.remove('nonedisplay');
        noFavsMsg.textContent = 'Could not load favorites right now. Please try again later.';
      });
  }

  function initFadeObserver() {
    if (typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }

  document.addEventListener('favorites:changed', () => loadFavorites());
  loadFavorites();
});
