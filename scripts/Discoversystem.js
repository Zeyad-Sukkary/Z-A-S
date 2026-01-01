(function () {
  'use strict';

  // ---------- Helpers ----------
  function safeLog(...args) { if (console && console.log) console.log(...args); }
  function safeError(...args) { if (console && console.error) console.error(...args); }

  function showSkeletons(container, count) {
    if (!container) return;
    const cards = [];
    for (let i = 0; i < count; i++) {
      cards.push(`
        <div class="col-md-6 mb-3">
          <div class="row g-0 border border-1 rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 placeholder-glow" aria-hidden="true">
            <div class="col p-4 d-flex flex-column position-static">
              <strong class="placeholder col-4 mb-2"></strong>
              <h3 class="placeholder col-6 mb-1"></h3>
              <p class="placeholder col-8 mb-auto"></p>
              <a class="placeholder btn disabled mt-2"></a>
            </div>
            <div class="col-auto d-none d-lg-block">
              <div class="placeholder" style="width:200px; height:320px;"></div>
            </div>
          </div>
        </div>
      `.trim());
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'row';
    wrapper.innerHTML = cards.join('');
    container.innerHTML = '';
    container.appendChild(wrapper);
  }

  function safeParseMarkdown(text) {
    if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
      try { return marked.parse(text || ''); } catch (e) { safeError('marked.parse failed', e); return text || ''; }
    }
    // fallback: escape basic HTML entities and return plain text
    return (text || '').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  }

  function parseDate(str) {
    if (!str) return 0;
    // try common formats: dd/mm/yy or dd/mm/yyyy or ISO
    if (/^\d{2}\/\d{2}\/\d{2,4}$/.test(str)) {
      const parts = str.split('/');
      const d = parts[0].padStart(2,'0'), m = parts[1].padStart(2,'0'), y = parts[2].length === 2 ? '20' + parts[2] : parts[2];
      const iso = `${y}-${m}-${d}`;
      return new Date(iso).getTime() || 0;
    }
    // try Date constructor fallback
    const t = new Date(str).getTime();
    return isNaN(t) ? 0 : t;
  }

  // ---------- Main Fetch + Render ----------
  // DOM elements
  const container = document.getElementById('article-preview-container');
  const sortDropdown = document.getElementById('sortOptions');
  const authorFilter = document.getElementById('authorFilter');
  const categoryNav = document.getElementById('categoryNav');
  const noArticlesMsg = document.getElementById('noArticlesMsg');
  const searchBar = document.getElementById('searchbar');

  // Defensive checks for required DOM elements
  if (!container) { safeError('Missing container: #article-preview-container'); return; }
  // Optional elements: don't abort if missing; just disable related features
  const hasSort = !!sortDropdown;
  const hasAuthorFilter = !!authorFilter;
  const hasCategoryNav = !!categoryNav;
  const hasNoArticlesMsg = !!noArticlesMsg;
  const hasSearch = !!searchBar;

  // Show initial skeletons quickly
  showSkeletons(container, 6);

  // IntersectionObserver setup with graceful fallback
  const observerSupported = typeof IntersectionObserver !== 'undefined';
  const observer = observerSupported ? new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      try {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Unobserve to avoid repeated callbacks
          observer.unobserve(entry.target);
        }
      } catch (e) {
        safeError('Observer callback error', e);
      }
    });
  }, { threshold: 0.12 }) : null;

  // Active filter state
  const activeFilters = { author: null, category: null };

  // Fetch published index
  fetch('articles/index.json')
    .then(response => {
      if (!response.ok) throw new Error('index.json fetch failed: ' + response.status);
      return response.json();
    })
    .then(data => {
      if (!data || !Array.isArray(data.published)) {
        throw new Error('index.json malformed or missing "published" array');
      }

      // Fetch article JSONs in parallel
      const articlePromises = data.published.map(slug =>
        fetch(`articles/${slug}.json`)
          .then(r => r.ok ? r.json() : Promise.reject(new Error('Article fetch failed: ' + slug)))
          .catch(err => {
            safeError('Failed loading article', slug, err);
            return null;
          })
      );

      return Promise.all(articlePromises)
        .then(articles => ({ indexData: data, articles }));
    })
    .then(({ indexData, articles }) => {
      const validArticles = (articles || [])
        .filter(Boolean)
        .filter(a => {
          const ok = a && a.title && a.slug && a.date && a.content && a.authors;
          if (!ok) safeError('Malformed article skipped', a && a.slug);
          return ok;
        });

      // Populate UI controls safely
      populateCategoryNav(validArticles);
      populateAuthorDropdown(validArticles);

      // initial render: prefer user's selected sort if present, else 'date' if available
      const sortVal = hasSort ? (sortDropdown.value || 'date') : 'date';
      applyFiltersAndSort(sortVal);

      // wire up events if UI controls exist
      if (hasCategoryNav) {
        categoryNav.addEventListener('click', e => {
          const target = e.target;
          if (target && target.tagName === 'A') {
            e.preventDefault();
            // toggle active class safely
            const links = categoryNav.querySelectorAll('.nav-link');
            links.forEach(a => a.classList && a.classList.remove('active'));
            target.classList && target.classList.add('active');

            activeFilters.category = (target.dataset && target.dataset.category) === 'none' ? null : (target.dataset && target.dataset.category);
            applyFiltersAndSort(hasSort ? sortDropdown.value : 'date');
          }
        });
      }

      if (hasAuthorFilter) {
        authorFilter.addEventListener('change', () => {
          const v = (authorFilter.value || '').replace('author-', '');
          activeFilters.author = v === 'none' ? null : v;
          applyFiltersAndSort(hasSort ? sortDropdown.value : 'date');
        });
      }

      if (hasSort) {
        sortDropdown.addEventListener('change', () => applyFiltersAndSort(sortDropdown.value));
      }

      if (hasSearch) {
        searchBar.addEventListener('input', () => applyFiltersAndSort(hasSort ? sortDropdown.value : 'date'));
      }

      // --------------- Inner functions ---------------
      function populateAuthorDropdown(list) {
        if (!hasAuthorFilter) return;
        const authors = list.map(a => (a && a.authors) ? String(a.authors).trim() : '').filter(Boolean);
        const unique = Array.from(new Set(authors)).sort();
        authorFilter.innerHTML = `<option value="none" selected>None</option>`;
        unique.forEach(name => {
          const opt = document.createElement('option');
          opt.value = `author-${name.toLowerCase()}`;
          opt.textContent = name;
          authorFilter.appendChild(opt);
        });
        if (unique.length <= 1 && authorFilter.parentElement) authorFilter.parentElement.style.display = 'none';
      }

      function createNavItem(name, val, active = false) {
        const li = document.createElement('li');
        li.className = 'fade-in nav-item p-2 mx-1 visible';
        const a = document.createElement('a');
        a.className = `link p-2 nav-link${active ? ' active' : ''}`;
        a.href = '#';
        a.textContent = name;
        a.dataset.category = val;
        li.appendChild(a);
        return li;
      }

      function populateCategoryNav(list) {
        if (!hasCategoryNav) return;
        categoryNav.innerHTML = '';
        const cats = [...new Set(list.flatMap(a => {
          if (!a) return [];
          if (Array.isArray(a.categories)) return a.categories;
          if (a.categories) return [a.categories];
          return [];
        }))].filter(Boolean).sort();
        categoryNav.appendChild(createNavItem('All', 'none', true));
        cats.forEach(c => categoryNav.appendChild(createNavItem(c, c.toLowerCase())));
      }

      function applyFiltersAndSort(sortBy) {
        // Keep UX fluid: show skeletons while computing
        showSkeletons(container, 4);

        let filtered = [...validArticles];

        // author filter (use activeFilters.author if set, else authorFilter.value if present)
        const authVal = activeFilters.author || (hasAuthorFilter ? (authorFilter.value || '').replace('author-', '') : 'none');
        if (authVal && authVal !== 'none') {
          filtered = filtered.filter(a => String(a.authors || '').toLowerCase() === authVal);
        }

        // category
        if (activeFilters.category) {
          filtered = filtered.filter(a => {
            const cats = Array.isArray(a.categories) ? a.categories : (a.categories ? [a.categories] : []);
            return cats.map(c => String(c).toLowerCase()).includes(activeFilters.category);
          });
        }

        // search
        const term = hasSearch ? (searchBar.value || '').trim().toLowerCase() : '';
        if (term) {
          filtered = filtered.filter(a =>
            (String(a.title || '')).toLowerCase().includes(term) ||
            (String(a.content || '')).toLowerCase().includes(term) ||
            (String(a.authors || '')).toLowerCase().includes(term) ||
            JSON.stringify(a.categories || []).toLowerCase().includes(term)
          );
        }

        // sort
        switch ((sortBy || 'date')) {
          case 'date':
            filtered.sort((a,b) => parseDate(b.date) - parseDate(a.date));
            break;
          case 'trending':
            filtered = filtered.filter(a => a.trending);
            break;
          case 'title':
            filtered.sort((a,b) => String(a.title || '').localeCompare(String(b.title || '')));
            break;
          case 'author':
            filtered.sort((a,b) => String(a.authors || '').localeCompare(String(b.authors || '')));
            break;
          case 'category':
            filtered.sort((a,b) => {
              const A = (Array.isArray(a.categories) ? a.categories.join(' ') : (a.categories || '')).toLowerCase();
              const B = (Array.isArray(b.categories) ? b.categories.join(' ') : (b.categories || '')).toLowerCase();
              return A.localeCompare(B);
            });
            break;
        }

        renderArticles(filtered);
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { /* ignore */ }
      }

      function renderArticles(list) {
        container.innerHTML = '';
        if (!list || list.length === 0) {
          if (hasNoArticlesMsg) noArticlesMsg.classList.remove('nonedisplay');
          return;
        }
        if (hasNoArticlesMsg) noArticlesMsg.classList.add('nonedisplay');

        for (let i = 0; i < list.length; i += 2) {
          const row = document.createElement('div');
          row.className = 'row mb-2';
          for (let j = i; j < i + 2 && j < list.length; j++) {
            const art = list[j];
            // create safe text preview
            const txt = (function () {
              try {
                const d = document.createElement('div');
                d.innerHTML = art.content || '';
                // use marked if available, else plain text fallback
                const parsed = safeParseMarkdown(d.textContent || '');
                // strip tags if marked produced HTML — we only want text preview
                const tmp = document.createElement('div');
                tmp.innerHTML = parsed;
                return (tmp.textContent || tmp.innerText || '').slice(0, 300) + '…';
              } catch (e) {
                safeError('Preview parse error', e);
                return (String(art.content || '')).slice(0, 300) + '…';
              }
            })();

            const col = document.createElement('div');
            col.className = 'col-md-6';
            const coverSrc = art.cover ? String(art.cover) : '/path/to/default-image.jpg';
            // escape values lightly (not fully secure sanitization; assume slug safe)
            const safeTitle = String(art.title || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            const safeCategories = [].concat(art.categories || []).join(' | ');
            const safeDate = String(art.date || '');

            col.innerHTML = `
              <div class="row g-0 border border-1 rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative fade-in">
                <div class="col p-4 d-flex flex-column position-static">
                  <div class="card-meta d-flex justify-content-between align-items-baseline mb-2">
                    <strong class="category-text d-inline-block">${safeCategories}</strong>
                    <p class="category-text mb-0">${safeDate}</p>
                  </div>
                  <h3 class="mb-3 card-title-discover" style="color: var(--maintext);">${safeTitle}</h3>
                  <div class="card-text card-text-discover mb-auto">${txt}</div>
                  <a href="/Z-A-S/article.html?slug=${encodeURIComponent(art.slug || '')}" class="icon-link link gap-1 icon-link-hover stretched-link" aria-label="Read more about ${safeTitle}">
                    Read more <svg class="bi" aria-hidden="true"><use xlink:href="#chevron-right"/></svg>
                  </a>
                </div>
                <div class="col-auto d-none d-lg-block">
                  <img src="${coverSrc}" width="200" height="320" style="object-fit:cover;" alt="Thumbnail">
                </div>
              </div>`;

            // Observe the card for fade-in, with safe null checks
            try {
              const el = col.querySelector('.fade-in');
              if (el) {
                if (observer) {
                  observer.observe(el);
                } else {
                  // fallback: ensure visible immediately (no IntersectionObserver support)
                  el.classList.add('visible');
                }
              }
            } catch (e) { safeError('Observe failed', e); }

            row.appendChild(col);
          }
          container.appendChild(row);
        }
      }

    })
    .catch(err => {
      showSkeletons(container, 2);
      safeError('Error loading articles:', err);
      // optionally show a friendly on-page message
      if (hasNoArticlesMsg) {
        noArticlesMsg.classList.remove('nonedisplay');
        noArticlesMsg.textContent = 'Could not load articles right now. Try again later.';
      }
    });

})();