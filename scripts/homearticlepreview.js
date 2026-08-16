// ─── Skeleton Helpers ────────────────────────────────────────────────────
function showSkeletons(container, count, isTrending = false) {
  if (!container) return;
  const cards = [];
  for (let i = 0; i < count; i++) {
    if (isTrending) {
      cards.push(`
        <div class="col">
          <div class="card card-cover h-100 text-bg-dark rounded-4 shadow-lg placeholder-glow" aria-hidden="true">
            <div class="d-flex flex-column h-100 p-5 pb-3">
              <h3 class="display-6 fw-bold"><span class="placeholder col-8"></span></h3>
              <ul class="list-unstyled mt-auto">
                <li><span class="placeholder col-4"></span></li>
                <li><span class="placeholder col-3 mt-2"></span></li>
                <li><span class="placeholder col-5 mt-1"></span></li>
              </ul>
            </div>
          </div>
        </div>
      `.trim());
    } else {
      cards.push(`
        <div class="col-md-4 mb-4">
          <div class="card placeholder-glow" aria-hidden="true">
            <div class="card-img-top placeholder" style="height:225px;"></div>
            <div class="card-body">
              <strong class="placeholder col-6 mb-2"></strong>
              <h5 class="placeholder col-7 mb-2"></h5>
              <p class="placeholder col-9 mb-3"></p>
              <div class="d-flex justify-content-between">
                <small class="placeholder col-4"></small>
                <small class="placeholder col-4"></small>
              </div>
            </div>
          </div>
        </div>
      `.trim());
    }
  }
  const wrapper = document.createElement('div');
  wrapper.className = isTrending ? 'row row-cols-1 row-cols-md-3 g-4' : 'row';
  wrapper.innerHTML = cards.join('');
  container.innerHTML = '';
  container.appendChild(wrapper);
}

function showFeaturedSkeletons(container, count = 3) {
  if (!container) return;
  const indicators = Array.from({length: count}, (_, i) =>
    `<button type="button" data-bs-target="#featuredCarousel" data-bs-slide-to="${i}"
       class="${i===0?'active':''}" aria-current="${i===0?'true':''}"
       aria-label="Slide ${i+1}"></button>`
  ).join('');

  const slides = Array.from({length: count}, (_, i) => `
    <div class="carousel-item ${i===0?'active':''}">
      <div class="bd-placeholder-img placeholder-glow"
           style="width:100%; height:360px; background:#ddd;"></div>
      <div class="carousel-caption d-none d-md-block">
        <h5><span class="placeholder col-6"></span></h5>
        <p><span class="placeholder col-8"></span></p>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div id="featuredCarousel" class="carousel slide" data-bs-ride="false">
      <div class="carousel-indicators">${indicators}</div>
      <div class="carousel-inner">${slides}</div>
      <button class="carousel-control-prev" type="button"
              data-bs-target="#featuredCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button"
              data-bs-target="#featuredCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const featuredContainer  = document.getElementById('featuredContainer');
  const trendingContainer  = document.getElementById('trendingContainer');
  const latestContainer    = document.getElementById('article-preview-container');
  const noArticlesMsg      = document.getElementById('noArticlesMsg');
  const continueList       = document.getElementById('continue-reading-list');

  if (featuredContainer) showFeaturedSkeletons(featuredContainer, 3);
  if (trendingContainer) showSkeletons(trendingContainer, 3, true);
  if (latestContainer) showSkeletons(latestContainer, 6);

  fetch('articles/index.json')
    .then(res => res.json())
    .then(data => {
      return Promise.all(
        (data.published || []).map(slug =>
          fetch(`articles/${slug}.json`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
      );
    })
    .then(raw => {
      const valid = raw.filter(a =>
        a && a.title && a.slug && a.cover && a.date && a.content && a.authors
      );

      function renderContinueReading(allArticles) {
        if (!continueList) return;
        const history = typeof getReadHistory === 'function' ? getReadHistory() : [];
        const bySlug = new Map(allArticles.map(article => [article.slug, article]));
        const unreadHistory = history
          .filter(entry => !entry.markedRead && bySlug.has(entry.slug))
          .map(entry => ({ ...bySlug.get(entry.slug), ...entry }));

        let source = unreadHistory;
        if (!source.length) {
          const readSlugs = new Set(history.filter(entry => entry.markedRead).map(entry => entry.slug));
          source = [...allArticles]
            .filter(article => !readSlugs.has(article.slug))
            .sort((a, b) => (typeof parseArticleDate === 'function' ? parseArticleDate(b.date) - parseArticleDate(a.date) : new Date(b.date) - new Date(a.date)))
            .slice(0, 5);
        }

        if (!source.length) {
          continueList.innerHTML = '<p class="mb-0">No unread articles available right now.</p>';
          return;
        }

        continueList.innerHTML = source.slice(0, 5).map(article => `
          <article class="continue-reading-item fade-in">
            <a href="article.html?slug=${encodeURIComponent(article.slug)}" class="text-decoration-none">
              <img src="${article.cover || 'pics/default-image.webp'}" alt="${article.title || ''}">
              <div>
                <h3 class="h6 mb-1">${article.title || 'Untitled article'}</h3>
                <small>${article.date || 'Unknown date'}</small>
                ${typeof renderReadStatus === 'function' ? renderReadStatus(article.slug, 'mt-2') : ''}
              </div>
            </a>
          </article>
        `).join('');

        if (typeof staggerFadeChildren === 'function') staggerFadeChildren(continueList);
      }

      renderContinueReading(valid);

      // FEATURED CAROUSEL
      if (featuredContainer) {
        const featuredList = valid.filter(a => a.featured);
        const pickFeat = featuredList.sort(() => 0.5 - Math.random()).slice(0, 3);
        if (pickFeat.length) {
          const featsInd = pickFeat.map((_,i) => `
            <button type="button" data-bs-target="#featuredCarousel" data-bs-slide-to="${i}"
                    class="${i===0?'active':''}" aria-current="${i===0?'true':''}"
                    aria-label="Slide ${i+1}"></button>
          `).join('');

          const featsSl = pickFeat.map((art,i) => `
            <div class="carousel-item ${i===0?'active':''}">
              <img src="${art.cover}" class="d-block w-100"
                   style="height:390px;object-fit:cover;" alt="${art.title}">
              <div class="carousel-caption d-none d-md-block bg-dark bg-opacity-50 p-3 rounded">
                <h5 class="text-white">${art.title}</h5>
                <p>${art.excerpt || ''}</p>
                <a href="article.html?slug=${encodeURIComponent(art.slug)}" class="btn button">Read Article</a>
              </div>
            </div>
          `).join('');

          featuredContainer.innerHTML = `
            <div id="featuredCarousel" class="carousel slide featured-carousel" data-bs-ride="carousel" data-bs-interval="7000">
              <div class="carousel-indicators">${featsInd}</div>
              <div class="carousel-inner rounded-3 overflow-hidden shadow-lg">${featsSl}</div>
              <button class="carousel-control-prev text-white" type="button"
                      data-bs-target="#featuredCarousel" data-bs-slide="prev">
                <span class="carousel-control-prev-icon"></span>
                <span class="visually-hidden">Previous</span>
              </button>
              <button class="carousel-control-next text-white" type="button"
                      data-bs-target="#featuredCarousel" data-bs-slide="next">
                <span class="carousel-control-next-icon"></span>
                <span class="visually-hidden">Next</span>
              </button>
            </div>
          `;

          if (typeof bootstrap !== 'undefined' && bootstrap.Carousel) {
            new bootstrap.Carousel(
              featuredContainer.querySelector('#featuredCarousel'),
              { ride: true }
            );
          }
        } else {
          featuredContainer.innerHTML = '<p class="text-center text-muted">No featured articles.</p>';
        }
      }

      // TRENDING GRID
      if (trendingContainer) {
        const trendList = valid.filter(a => a.trending);
        const pickTrend = trendList.sort(() => 0.5 - Math.random()).slice(0, 3);
        trendingContainer.className = 'row ' +
          (pickTrend.length === 1 ? 'row-cols-1' :
           pickTrend.length === 2 ? 'row-cols-1 row-cols-md-2' :
           'row-cols-1 row-cols-md-3') + ' g-4';
        trendingContainer.innerHTML = '';
        pickTrend.forEach(art => {
          const col = document.createElement('div');
          col.className = 'col h-400';
          col.innerHTML = `
            <a href="article.html?slug=${encodeURIComponent(art.slug)}" class="text-decoration-none text-white">
              <div class="card card-cover h-100 text-bg-dark rounded-4 shadow-lg"
                   style="background-image:url('${art.cover}');background-size:cover;min-height:460px;">
                <div class="d-flex flex-column h-100 p-4 text-shadow-1">
                  <h3 class="display-6 fw-bold text-white mb-auto">${art.title}</h3>
                  <ul class="list-unstyled col-md mt-auto text-white small mb-0">
                    <li class="text-white fw-bold">${[].concat(art.categories).join(' | ')}</li>
                    <li class="text-white-50">${art.authors} &bull; ${art.date}</li>
                </ul>
                </div>
              </div>
            </a>
          `;
          trendingContainer.appendChild(col);
        });
      }

      // LATEST GRID
      if (latestContainer) {
        valid.sort((a,b) => {
          const pDate = str => {
            if (!str) return 0;
            if (/^\d{2}\/\d{2}\/\d{2,4}$/.test(str)) {
              const parts = str.split('/');
              const d = parts[0].padStart(2,'0'), m = parts[1].padStart(2,'0'), y = parts[2].length === 2 ? '20' + parts[2] : parts[2];
              return new Date(`${y}-${m}-${d}`).getTime() || 0;
            }
            return new Date(str).getTime() || 0;
          };
          return pDate(b.date) - pDate(a.date);
        });

        const pickLatest = valid.slice(0, 6);
        if (!pickLatest.length) {
          if (noArticlesMsg) noArticlesMsg.classList.remove('d-none');
        } else {
          if (noArticlesMsg) noArticlesMsg.classList.add('d-none');
          latestContainer.innerHTML = '';
          for (let i = 0; i < pickLatest.length; i += 3) {
            const row = document.createElement('div');
            row.className = 'row mb-4 stagger-children';
            pickLatest.slice(i, i + 3).forEach(art => {
              const snippet = (()=>{
                try {
                  const d = document.createElement('div');
                  d.innerHTML = art.content || '';
                  const parsed = (typeof marked !== 'undefined' && marked.parse) ? marked.parse(d.textContent || '') : (d.textContent || '');
                  const tmp = document.createElement('div');
                  tmp.innerHTML = parsed;
                  return (tmp.textContent || tmp.innerText || '').slice(0, 200) + '…';
                } catch {
                  return (art.content || '').slice(0, 200) + '…';
                }
              })();
              const col = document.createElement('div');
              col.className = 'col-md-4 mb-3';
              col.innerHTML = `
                <div class="card news-item shadow-sm slide-in-left h-100">
                  <a href="article.html?slug=${encodeURIComponent(art.slug)}"
                     class="text-decoration-none text-white">
                    <img src="${art.cover}" class="card-img-top"
                         style="height:225px;object-fit:cover;" alt="${art.title}">
                  </a>
                  <div class="card-body d-flex flex-column">
                    <strong class="d-inline-block mb-2 category-text">
                      ${[].concat(art.categories).join(' | ')}
                    </strong>
                    <a href="article.html?slug=${encodeURIComponent(art.slug)}"
                       class="text-decoration-none text-white">
                      <h5 class="card-title card-title-home">${art.title}</h5>
                      <div class="card-text mb-3 mt-2 card-text-home">${snippet}</div>
                    </a>
                    <div class="d-flex justify-content-between mt-auto small">
                      <span class="category-text">${art.date}</span>
                      <span class="category-text">${art.authors}</span>
                    </div>
                  </div>
                </div>
              `;
              row.appendChild(col);
            });
            latestContainer.appendChild(row);
          }
          if (typeof staggerFadeChildren === 'function') staggerFadeChildren(latestContainer);
          document.querySelectorAll('.slide-in-left').forEach(el => el.classList.add('visible'));
        }
      }
    })
    .catch(err => {
      console.error('Error loading home articles:', err);
      if (featuredContainer) featuredContainer.innerHTML = '<p class="text-center">Could not load featured articles right now.</p>';
      if (trendingContainer) trendingContainer.innerHTML = '';
      if (latestContainer) latestContainer.innerHTML = '';
      if (continueList) continueList.innerHTML = '<p class="mb-0">Could not load articles right now.</p>';
      if (noArticlesMsg) {
        noArticlesMsg.classList.remove('d-none');
        noArticlesMsg.textContent = 'Could not load articles right now. Please try again later.';
      }
    });
});
