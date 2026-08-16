(function () {
  'use strict';

  function safeError(...args) { if (console && console.error) console.error(...args); }

  function showSkeletons(container, count) {
    if (!container) return;
    const cards = Array.from({ length: count }).map(() => `
      <div class="col-12 col-lg-6 mb-3">
        <article class="discover-card-skeleton placeholder-glow" aria-hidden="true">
          <div class="discover-card-body">
            <span class="placeholder col-4 mb-3"></span>
            <span class="placeholder col-9 mb-3"></span>
            <span class="placeholder col-12 mb-2"></span>
            <span class="placeholder col-10 mb-4"></span>
            <span class="placeholder col-5"></span>
          </div>
          <div class="discover-card-media placeholder"></div>
        </article>
      </div>
    `).join('');

    const wrapper = document.createElement('div');
    wrapper.className = 'row g-4';
    wrapper.innerHTML = cards;
    container.innerHTML = '';
    container.appendChild(wrapper);
  }

  function safeParseMarkdown(text) {
    if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
      try { return marked.parse(text || ''); } catch (e) { safeError('marked.parse failed', e); return text || ''; }
    }
    return (text || '').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  }

  function parseDate(str) {
    if (!str) return 0;
    if (/^\d{2}\/\d{2}\/\d{2,4}$/.test(str)) {
      const parts = str.split('/');
      const d = parts[0].padStart(2,'0'), m = parts[1].padStart(2,'0'), y = parts[2].length === 2 ? '20' + parts[2] : parts[2];
      const iso = `${y}-${m}-${d}`;
      return new Date(iso).getTime() || 0;
    }
    const t = new Date(str).getTime();
    return isNaN(t) ? 0 : t;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('article-preview-container');
    const sortDropdown = document.getElementById('sortOptions');
    const authorFilter = document.getElementById('authorFilter');
    const categoryNav = document.getElementById('categoryNav');
    const noArticlesMsg = document.getElementById('noArticlesMsg');

    if (!container) return;

    const hasSort = !!sortDropdown;
    const hasAuthorFilter = !!authorFilter;
    const hasCategoryNav = !!categoryNav;
    const hasNoArticlesMsg = !!noArticlesMsg;

    showSkeletons(container, 6);

    const observerSupported = typeof IntersectionObserver !== 'undefined';
    const observer = observerSupported ? new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        try {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        } catch (e) {
          safeError('Observer error', e);
        }
      });
    }, { threshold: 0.1 }) : null;

    const activeFilters = { author: null, categories: new Set() };

    // Check URL query parameters for initial search term
    const urlParams = new URLSearchParams(window.location.search);
    const initialSearchQuery = urlParams.get('search') || urlParams.get('query') || '';

    fetch('articles/index.json')
      .then(res => {
        if (!res.ok) throw new Error('index.json fetch failed: ' + res.status);
        return res.json();
      })
      .then(data => {
        if (!data || !Array.isArray(data.published)) throw new Error('Malformed index.json');

        const articlePromises = data.published.map(slug =>
          fetch(`articles/${slug}.json`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        );

        return Promise.all(articlePromises);
      })
      .then(articles => {
        const validArticles = (articles || []).filter(a => a && a.title && a.slug && a.date && a.content && a.authors);

        populateCategoryNav(validArticles);
        populateAuthorDropdown(validArticles);

        // Pre-populate search input if initial query param exists
        const searchInput = document.getElementById('searchbar');
        if (searchInput && initialSearchQuery) {
          searchInput.value = initialSearchQuery;
        }

        const initSort = hasSort ? (sortDropdown.value || 'date') : 'date';
        applyFiltersAndSort(initSort);

        if (hasCategoryNav) {
          categoryNav.addEventListener('click', e => {
            const target = e.target;
            if (target && target.tagName === 'A') {
              e.preventDefault();
              const category = target.dataset.category;

              if (category === 'none') {
                activeFilters.categories.clear();
              } else if (e.ctrlKey || e.metaKey) {
                if (activeFilters.categories.has(category)) {
                  activeFilters.categories.delete(category);
                } else {
                  activeFilters.categories.add(category);
                }
              } else {
                activeFilters.categories.clear();
                activeFilters.categories.add(category);
              }

              refreshCategoryNavState();
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

        // Real-Time Search Event Listener
        document.addEventListener('input', (e) => {
          if (e.target && e.target.id === 'searchbar') {
            applyFiltersAndSort(hasSort ? sortDropdown.value : 'date');
          }
        });

        function populateAuthorDropdown(list) {
          if (!hasAuthorFilter) return;
          const authors = list.map(a => String(a.authors).trim()).filter(Boolean);
          const unique = Array.from(new Set(authors)).sort();
          authorFilter.innerHTML = `<option value="none" selected>Filter by Author (All)</option>`;
          unique.forEach(name => {
            const opt = document.createElement('option');
            opt.value = `author-${name.toLowerCase()}`;
            opt.textContent = name;
            authorFilter.appendChild(opt);
          });
          if (unique.length <= 1 && authorFilter.parentElement) {
            authorFilter.parentElement.style.display = 'none';
          }
        }

        function createNavItem(name, val, active = false) {
          const li = document.createElement('li');
          li.className = 'fade-in nav-item p-1 mx-1 visible';
          const a = document.createElement('a');
          a.className = `link p-2 nav-link${active ? ' active' : ''}`;
          a.href = '#';
          a.textContent = name;
          a.dataset.category = val;
          a.title = val === 'none' ? 'Show all categories' : 'Ctrl-click to combine categories';
          li.appendChild(a);
          return li;
        }

        function populateCategoryNav(list) {
          if (!hasCategoryNav) return;
          categoryNav.innerHTML = '';
          const cats = [...new Set(list.flatMap(a => {
            if (Array.isArray(a.categories)) return a.categories;
            if (a.categories) return [a.categories];
            return [];
          }))].filter(Boolean).sort();

          categoryNav.appendChild(createNavItem('All', 'none', true));
          cats.forEach(c => categoryNav.appendChild(createNavItem(c, c.toLowerCase())));
        }

        function refreshCategoryNavState() {
          if (!hasCategoryNav) return;
          categoryNav.querySelectorAll('.nav-link').forEach(link => {
            const category = link.dataset.category;
            const isAll = category === 'none';
            const isActive = isAll ? activeFilters.categories.size === 0 : activeFilters.categories.has(category);
            link.classList.toggle('active', isActive);
            link.setAttribute('aria-pressed', isActive ? 'true' : 'false');
          });
        }

        function applyFiltersAndSort(sortBy) {
          let filtered = [...validArticles];

          // Author filter
          const authVal = activeFilters.author || (hasAuthorFilter ? (authorFilter.value || '').replace('author-', '') : 'none');
          if (authVal && authVal !== 'none') {
            filtered = filtered.filter(a => String(a.authors || '').toLowerCase() === authVal);
          }

          // Category filter. Multiple selected categories use "any of these" matching.
          if (activeFilters.categories.size) {
            filtered = filtered.filter(a => {
              const cats = Array.isArray(a.categories) ? a.categories : (a.categories ? [a.categories] : []);
              return cats.some(c => activeFilters.categories.has(String(c).toLowerCase()));
            });
          }

          // Real-time Search filter
          const searchInputEl = document.getElementById('searchbar');
          const term = searchInputEl ? (searchInputEl.value || '').trim().toLowerCase() : '';
          if (term) {
            filtered = filtered.filter(a =>
              String(a.title || '').toLowerCase().includes(term) ||
              String(a.content || '').toLowerCase().includes(term) ||
              String(a.authors || '').toLowerCase().includes(term) ||
              JSON.stringify(a.categories || []).toLowerCase().includes(term)
            );
          }

          // Sorting
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
            row.className = 'row mb-3 stagger-children';
            for (let j = i; j < i + 2 && j < list.length; j++) {
              const art = list[j];
              const txt = (function () {
                try {
                  const d = document.createElement('div');
                  d.innerHTML = art.content || '';
                  const parsed = safeParseMarkdown(d.textContent || '');
                  const tmp = document.createElement('div');
                  tmp.innerHTML = parsed;
                  return (tmp.textContent || tmp.innerText || '').slice(0, 260) + '…';
                } catch (e) {
                  return (String(art.content || '')).slice(0, 260) + '…';
                }
              })();

              const col = document.createElement('div');
              col.className = 'col-md-6 mb-3';
              const coverSrc = art.cover ? String(art.cover) : 'pics/default-image.webp';
              const safeTitle = String(art.title || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');
              const safeCategories = [].concat(art.categories || []).join(' | ');
              const safeDate = String(art.date || '');

              col.innerHTML = `
                <div class="row g-0 border border-1 rounded overflow-hidden flex-md-row shadow-sm h-md-250 position-relative fade-in">
                  <div class="col p-4 d-flex flex-column position-static">
                    <div class="card-meta d-flex justify-content-between align-items-baseline mb-2">
                      <strong class="category-text d-inline-block">${safeCategories}</strong>
                      <p class="category-text mb-0">${safeDate}</p>
                    </div>
                    <h3 class="mb-3 card-title-discover">${safeTitle}</h3>
                    <div class="card-text card-text-discover mb-auto">${txt}</div>
                    <div class="mt-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
                      <a href="article.html?slug=${encodeURIComponent(art.slug || '')}" class="icon-link link gap-1 icon-link-hover" aria-label="Read article ${safeTitle}">
                        Read more &rarr;
                      </a>
                      ${typeof renderMarkReadButton === 'function' ? renderMarkReadButton(art.slug || '', 'btn-sm') : ''}
                    </div>
                    ${typeof renderReadStatus === 'function' ? renderReadStatus(art.slug || '', 'mt-3') : ''}
                  </div>
                  <div class="col-auto d-none d-lg-block">
                    <img src="${coverSrc}" width="200" height="320" style="object-fit:cover;" alt="${safeTitle}">
                  </div>
                </div>`;

              try {
                const el = col.querySelector('.fade-in');
                if (el) {
                  if (observer) observer.observe(el);
                  else el.classList.add('visible');
                }
                if (typeof bindMarkReadButtons === 'function') bindMarkReadButtons(col);
              } catch (e) {}

              row.appendChild(col);
            }
            container.appendChild(row);
          }
          if (typeof staggerFadeChildren === 'function') staggerFadeChildren(container);
        }

      })
      .catch(err => {
        container.innerHTML = '';
        safeError('Error loading discover articles:', err);
        if (hasNoArticlesMsg) {
          noArticlesMsg.classList.remove('nonedisplay');
          noArticlesMsg.innerHTML = '<p class="h5 mb-0">Could not load articles right now. Please try again later.</p>';
        }
      });
  });

})();
