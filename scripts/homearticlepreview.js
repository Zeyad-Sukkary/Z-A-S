// ─── Skeleton Helpers ────────────────────────────────────────────────────
// 1) Generic grid skeleton (for Trending & Latest)
function showSkeletons(container, count, isTrending = false) {
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

// 2) Featured‑carousel skeleton
function showFeaturedSkeletons(container, count = 2) {
  const indicators = Array.from({length: count}, (_, i) =>
    `<button type="button" data-bs-target="#featuredCarousel" data-bs-slide-to="${i}"
       class="${i===0?'active':''}" aria-current="${i===0?'true':''}"
       aria-label="Slide ${i+1}"></button>`
  ).join('');

  const slides = Array.from({length: count}, (_, i) => `
    <div class="carousel-item ${i===0?'active':''}">
      <div class="bd-placeholder-img placeholder-glow"
           style="width:100%; height:300px; background:#ddd;"></div>
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

// ─── DOM Containers & Initial Skeletons ─────────────────────────────────
const featuredContainer  = document.getElementById('featuredContainer');
const trendingContainer  = document.getElementById('trendingContainer');
const latestContainer    = document.getElementById('article-preview-container');
const noArticlesMsg      = document.getElementById('noArticlesMsg');

// show placeholders
showFeaturedSkeletons(featuredContainer, 2);
if (trendingContainer) showSkeletons(trendingContainer, 3, true);
showSkeletons(latestContainer, 6);

// ─── Fetch & Render All Sections ────────────────────────────────────────
fetch('articles/index.json')
  .then(res => res.json())
  .then(data => {
    // load every article JSON
    return Promise.all(
      data.published.map(slug =>
        fetch(`articles/${slug}.json`)
          .then(r => r.json())
          .catch(() => null)
      )
    );
  })
  .then(raw => {
    const valid = raw.filter(a =>
      a && a.title && a.slug && a.cover && a.date && a.content && a.authors
    );

    // ── FEATURED CAROUSEL ───────────────────────────────────────────────
    const featuredList = valid.filter(a => a.featured);
    const pickFeat    = featuredList.sort(()=>0.5-Math.random()).slice(0,2);
    if (pickFeat.length) {
      // indicators
      const featsInd = pickFeat.map((_,i)=>`
        <button type="button" data-bs-target="#featuredCarousel" data-bs-slide-to="${i}"
                class="${i===0?'active':''}" aria-current="${i===0?'true':''}"
                aria-label="Slide ${i+1}"></button>
      `).join('');
      // slides
      const featsSl = pickFeat.map((art,i)=>`
        <div class="carousel-item ${i===0?'active':''}">
          <img src="${art.cover}" class="d-block w-100"
               style="height:300px;object-fit:cover;" alt="${art.title}">
          <div class="carousel-caption d-none d-md-block">
            <h5 class="text-white">${art.title}</h5>
            <p>${art.excerpt||''}</p>
            <a href="article.html?slug=${art.slug}" class="button">Read more</a>
          </div>
        </div>
      `).join('');
      // inject
      featuredContainer.innerHTML = `
        <div id="featuredCarousel" class="carousel slide" data-bs-interval="7000">
          <div class="carousel-indicators text-white">${featsInd}</div>
          <div class="carousel-inner">${featsSl}</div>
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
      // optional: re-init Carousel
      new bootstrap.Carousel(
        featuredContainer.querySelector('#featuredCarousel'),
        { ride: false }
      );
    } else {
      featuredContainer.innerHTML = '<p>No featured articles.</p>';
    }

    // ── TRENDING GRID ───────────────────────────────────────────────────
    if (trendingContainer) {
      const trendList = valid.filter(a => a.trending);
      const pickTrend = trendList.sort(()=>0.5-Math.random()).slice(0,3);
      trendingContainer.className = 'row ' +
        (pickTrend.length===1 ? 'row-cols-1' :
         pickTrend.length===2 ? 'row-cols-1 row-cols-md-2' :
         'row-cols-1 row-cols-md-3') + ' g-4';
      trendingContainer.innerHTML = '';
      pickTrend.forEach(art => {
        const col = document.createElement('div');
        col.className = 'col h-400';
        col.innerHTML = `
          <a href="article.html?slug=${art.slug}" class="text-decoration-none text-white">
            <div class="card card-cover h-100 text-bg-dark rounded-4 shadow-lg"
                 style="background-image:url('${art.cover}');background-size:cover;">
              <div class="d-flex flex-column h-100 p-5 text-shadow-1">
                <h3 class="display-6 fw-bold text-white">${art.title}</h3>
                <ul class="list-unstyled col-md mt-auto text-white small">
                  <li class="text-white">${[].concat(art.categories).join(' | ')}</li>
                  <li class="text-white">${art.authors}</li>
                  <li class="text-white">${art.date}</li>
              </ul>
              </div>
            </div>
          </a>
        `;
        trendingContainer.appendChild(col);
      });
    }

    // ── LATEST GRID ─────────────────────────────────────────────────────
    valid.sort((a,b)=>{
      const [dA,mA,yA]=a.date.split('/').map(Number);
      const [dB,mB,yB]=b.date.split('/').map(Number);
      return new Date(2000+yB,mB-1,dB) - new Date(2000+yA,mA-1,dA);
    });
    const pickLatest = valid.slice(0,6);
    if (!pickLatest.length) {
      noArticlesMsg.classList.remove('d-none');
    } else {
      noArticlesMsg.classList.add('d-none');
      latestContainer.innerHTML = '';
      for (let i=0; i<pickLatest.length; i+=3) {
        const row = document.createElement('div');
        row.className = 'row mb-4';
        pickLatest.slice(i,i+3).forEach(art => {
          const snippet = (()=>{
            const d = document.createElement('div');
            d.innerHTML=art.content;
            return marked.parse(d.textContent||'').slice(0,250)+'…';
          })();
          const col = document.createElement('div');
          col.className = 'col-md-4';
          col.innerHTML = `
            <div class="card news-item shadow-sm slide-in-left">
              <a href="article.html?slug=${art.slug}"
                 class="text-decoration-none text-white">
                <img src="${art.cover}" class="card-img-top"
                     style="height:225px;object-fit:cover;" alt="${art.title}">
              </a>
              <div class="card-body">
                <strong class="d-inline-block mb-2 category-text">
                  ${[].concat(art.categories).join(' | ')}
                </strong>
               <a href="article.html?slug=${art.slug}"
                   class="text-decoration-none text-white">
                  <h5 class="card-title card-title-home">${art.title}</h5>
                  <div class="card-text card-text-home">${snippet}</div>
                </a>
                <div class="d-flex justify-content-between small">
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
      document.querySelectorAll('.slide-in-left')
              .forEach(el=>el.classList.add('visible'));
    }
  })
  .catch(err => {
    console.error('Error loading articles:', err);
    // fallback UI if needed
  });
