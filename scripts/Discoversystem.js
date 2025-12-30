// ─── Skeleton Helper ─────────────────────────────────────────────────────
function showSkeletons(container, count) {
  const cards = [];
  for (let i = 0; i < count; i++) {
    cards.push(`
      <div class="col-md-6 mb-3">
        <div class="row g-0 border-1 rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 placeholder-glow" aria-hidden="true">
          <div class="col p-4 d-flex flex-column position-static">
            <strong class="placeholder col-4 mb-2"></strong>
            <h3 class="placeholder col-6 mb-1"></h3>
            <p class="placeholder col-8 mb-auto"></p>
            <a class="placeholder col-3 mt-2 btn disabled"></a>
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

// ─── Main Fetch + Render ─────────────────────────────────────────────────
fetch('articles/index.json')
  .then(response => response.json())
  .then(data => {
    const container      = document.getElementById('article-preview-container');
    const sortDropdown   = document.getElementById('sortOptions');
    const authorFilter   = document.getElementById('authorFilter');
    const categoryNav    = document.getElementById('categoryNav');
    const noArticlesMsg  = document.getElementById('noArticlesMsg');
    const searchBar      = document.getElementById('searchbar');
    const activeFilters  = { author: null, category: null };

    // ▶️ Show 4 skeleton cards immediately
    showSkeletons(container, 6);

    // Fetch all article JSONs
    const articlePromises = data.published.map(slug =>
      fetch(`articles/${slug}.json`)
        .then(r => r.json())
        .catch(() => null)
    );

    Promise.all(articlePromises)
      .then(articles => {
        const validArticles = articles.filter(a => {
          const ok = a?.title && a?.slug && a?.date && a?.content && a?.authors;
          if (!ok) console.error('Malformed article:', a);
          return ok;
        });

        // Populate filters/nav
        populateCategoryNav(validArticles);
        populateAuthorDropdown(validArticles);

        // Initial render
        applyFiltersAndSort(sortDropdown.value);

        // ─── Inner functions ──────────────────────────────────────────
        function populateAuthorDropdown(list) {
          const allAuthors = [...new Set(list.map(a => a.authors.trim()))].sort();
          authorFilter.innerHTML = `<option value="none" selected>None</option>`;
          allAuthors.forEach(name => {
            const opt = document.createElement('option');
            opt.value = `author-${name.toLowerCase()}`;
            opt.textContent = name;
            authorFilter.appendChild(opt);
          });
          if (allAuthors.length <= 1) authorFilter.parentElement.style.display = 'none';
        }

        function createNavItem(name, val, active = false) {
          const li = document.createElement('li');
          li.className = 'fade-in nav-item p-2 mx-1 visible';
          const a  = document.createElement('a');
          a.className = `link p-2 nav-link${active ? ' active' : ''}`;
          a.href = '#'; a.textContent = name; a.dataset.category = val;
          li.appendChild(a);
          return li;
        }

        function populateCategoryNav(list) {
          categoryNav.innerHTML = '';
          const cats = [...new Set(list.flatMap(a =>
            Array.isArray(a.categories) ? a.categories : [a.categories]
          ))].filter(Boolean).sort();
          categoryNav.appendChild(createNavItem('All', 'none', true));
          cats.forEach(c => categoryNav.appendChild(createNavItem(c, c.toLowerCase())));
        }

        function applyFiltersAndSort(sortBy) {
          // Show skeletons *while* we compute/filter (optional UX bump)
          showSkeletons(container, 4);

          let filtered = [...validArticles];
          // -- author
          const authVal = authorFilter.value.replace('author-', '');
          if (authVal !== 'none') filtered = filtered.filter(a => a.authors.toLowerCase() === authVal);
          // -- category
          if (activeFilters.category) {
            filtered = filtered.filter(a => {
              const cats = Array.isArray(a.categories) ? a.categories : [a.categories];
              return cats.map(c => c.toLowerCase()).includes(activeFilters.category);
            });
          }
          // -- search
          const term = searchBar.value.trim().toLowerCase();
          if (term) filtered = filtered.filter(a =>
            a.title.toLowerCase().includes(term) ||
            a.content.toLowerCase().includes(term) ||
            a.authors.toLowerCase().includes(term) ||
            JSON.stringify(a.categories).toLowerCase().includes(term)
          );
          // -- sort
          switch (sortBy) {
            case 'date':     filtered.sort((a,b)=>parseDate(b.date)-parseDate(a.date)); break;
            case 'trending': filtered = filtered.filter(a=>a.trending);               break;
            case 'title':    filtered.sort((a,b)=>a.title.localeCompare(b.title));    break;
            case 'author':   filtered.sort((a,b)=>a.authors.localeCompare(b.authors));break;
            case 'category': filtered.sort((a,b)=>{
              const A = (Array.isArray(a.categories)?a.categories.join(' '):a.categories).toLowerCase();
              const B = (Array.isArray(b.categories)?b.categories.join(' '):b.categories).toLowerCase();
              return A.localeCompare(B);
            }); break;
          }

          renderArticles(filtered);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function renderArticles(list) {
          container.innerHTML = '';
          if (list.length === 0) {
            noArticlesMsg.classList.remove('nonedisplay');
            return;
          }
          noArticlesMsg.classList.add('nonedisplay');

          for (let i = 0; i < list.length; i += 2) {
            const row = document.createElement('div');
            row.className = 'row mb-2';
            for (let j = i; j < i + 2 && j < list.length; j++) {
              const art = list[j];
              const txt = (() => {
                const d = document.createElement('div');
                d.innerHTML = art.content;
                return (marked.parse(d.textContent || '')).slice(0, 130) + '…';
              })();

              const col = document.createElement('div');
              col.className = 'col-md-6';
              col.innerHTML = `
                <div class="row g-0 border-1 rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative slide-in-left">
                  <div class="col p-4 d-flex flex-column position-static">
                    <strong class="d-inline-block mb-2 category-text">${[].concat(art.categories).join(' | ')}</strong>
                    <h3 class="mb-0" style="color: var(--maintext);">${art.title}</h3>
                    <p class="mb-1 text-body-secondary ">${art.date}</p>
                    <p class="card-text mb-auto">${txt}</p>
                    <a href="/Z-A-S/article.html?slug=${art.slug}" class="icon-link link gap-1 icon-link-hover stretched-link">
                      Read more <svg class="bi" aria-hidden="true"><use xlink:href="#chevron-right"/></svg>
                    </a>
                  </div>
                  <div class="col-auto d-none d-lg-block">
                    <img src="${art.cover||'/path/to/default-image.jpg'}" width="200" height="320" style="object-fit:cover;" alt="Thumbnail">
                  </div>
                </div>`;
              observer.observe(col.querySelector('.slide-in-left'));
              row.appendChild(col);
            }
            container.appendChild(row);
            triggerSlideInAnimations();
          }
        }

        function parseDate(str) {
          const [d,m,y] = str.split('/');
          return new Date(`20${y}-${m}-${d}`).getTime();
        }

        function triggerSlideInAnimations() {
          document.querySelectorAll('.slide-in-left').forEach(el=>el.classList.add('visible'));
        }

        // ── Event listeners ───────────────────────────────────────────────
        categoryNav.addEventListener('click', e => {
          if (e.target.tagName==='A') {
            e.preventDefault();
            categoryNav.querySelectorAll('.nav-link').forEach(a=>a.classList.remove('active'));
            e.target.classList.add('active');
            activeFilters.category = e.target.dataset.category==='none' ? null : e.target.dataset.category;
            applyFiltersAndSort(sortDropdown.value);
          }
        });
        authorFilter.addEventListener('change', () => {
          const v = authorFilter.value.replace('author-','');
          activeFilters.author = v==='none' ? null : v;
          applyFiltersAndSort(sortDropdown.value);
        });
        sortDropdown.addEventListener('change', ()=>applyFiltersAndSort(sortDropdown.value));
        searchBar.addEventListener('input', ()=>applyFiltersAndSort(sortDropdown.value));
      })
      .catch(err => console.error('Error loading articles:', err));
  })
  .catch(err => console.error('Error fetching index.json:', err));
// ─── Intersection Observer for animations ─────────────────────────────
