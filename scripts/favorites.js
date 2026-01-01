(function() {
  const container = document.getElementById('favorites-preview-container');
  const noFavsMsg = document.getElementById('noFavoritesMsg');
  const favSlugs = JSON.parse(localStorage.getItem('favorites') || '[]');

  if (!container || !noFavsMsg) return; // stop if elements missing

  // Show no-favorites message if empty
  if (!favSlugs.length) {
    noFavsMsg.classList.remove('nonedisplay');
    return;
  } else {
    noFavsMsg.classList.add('nonedisplay');
  }

  // Show skeleton placeholders while loading
  function showSkeletons(container, count) {
    const cards = [];
    for (let i = 0; i < count; i++) {
      cards.push(`
      <div class="container my-5 slide-placeholder">
        <div class="p-4 pb-0 pe-lg-0 pt-lg-5 align-items-center rounded-3 border shadow-lg favorite-article">
          <div class="col-lg-7 p-3 p-lg-5 pt-lg-3">
            <strong class="d-inline-block mb-2 category-text placeholder-glow">
              <span class="placeholder col-4"></span>
            </strong>
            <h1 class="display-4 fw-bold lh-1 text-body-emphasis placeholder-glow">
              <span class="placeholder col-8"></span>
            </h1>
            <p class="lead card-text card-text-favorite placeholder-glow">
              <span class="placeholder col-12"></span>
              <span class="placeholder col-10"></span>
              <span class="placeholder col-8"></span>
            </p>
            <div class="d-flex justify-content-between mt-auto small mb-3 placeholder-glow">
              <span class="placeholder col-3"></span>
              <span class="placeholder col-3"></span>
            </div>
            <div class="d-grid gap-2 d-md-flex justify-content-md-start">
              <a href="#" class="btn btn-primary btn-lg px-4 me-md-2 fw-bold placeholder col-3"></a>
              <button type="button" class="btn btn-outline-secondary btn-lg px-4 placeholder col-3"></button>
            </div>
          </div>
          <div class="col-lg-4 offset-lg-1 p-0 overflow-hidden shadow-lg">
            <div class="placeholder-glow">
              <div class="placeholder w-100" style="height: 400px;"></div>
            </div>
          </div>
        </div>
      </div>`.trim());
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'row col-md';
    wrapper.innerHTML = cards.join('');
    container.innerHTML = '';
    container.appendChild(wrapper);
  }

  showSkeletons(container, Math.min(favSlugs.length || 6, 6));

  // Fetch all favorite JSONs
  Promise.all(favSlugs.map(slug =>
    fetch(`articles/${slug}.json`)
      .then(r => r.ok ? r.json().then(data => ({ ...data, slug })) : null)
      .catch(() => null)
  ))
  .then(articles => {
    const normalized = articles
      .filter(a => a && a.slug)
      .map(a => ({
        title: a?.title || 'Untitled',
        slug: a.slug,
        date: a?.date || 'Unknown date',
        content: a?.content || '',
        authors: a?.authors || 'Unknown author',
        cover: a?.cover || '/path/to/default-image.jpg',
        categories: a?.categories || []
      }));

    if (!normalized.length) {
      container.innerHTML = '';
      noFavsMsg.classList.remove('nonedisplay');
      return;
    }

    noFavsMsg.classList.add('nonedisplay');
    renderFavorites(normalized);

// IntersectionObserver for slide-in-left and slide-in-right
const slideObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      slideObserver.unobserve(entry.target); // animate once
    }
  });
}, {
  threshold: 0, // trigger as soon as any part is visible
});

// Observe all slide-in-left and slide-in-right elements
document.querySelectorAll('.slide-in-left, .slide-in-right').forEach(el => {
  slideObserver.observe(el);

  // Make visible if already in viewport
  const rect = el.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    el.classList.add('visible');
    slideObserver.unobserve(el);
  }
});


  })
  .catch(err => {
    console.error('Error loading favorites:', err);
    container.innerHTML = `<p class="text-danger">Failed to load favorites.</p>`;
  });

  // Render favorites function
  function renderFavorites(list) {
    container.innerHTML = '';
    let toggle = true;
    for (let i = 0; i < list.length; i++) {
      const art = list[i];
      const txt = (() => {
        const d = document.createElement('div');
        d.innerHTML = art.content;
        return marked.parse(d.textContent || '').slice(0, 250) + '...';
      })();

      const col = document.createElement('div');
      col.className = 'col-12';

      const slideClass = toggle ? 'slide-in-left' : 'slide-in-right';
      toggle =!toggle;
      
      col.innerHTML = `
        <div class="container my-5 slide-in"> 
          <div class="row col-12 p-4 pb-0 pe-lg-0 pt-lg-5 align-items-center rounded-3 border shadow-lg favorite-article">
            <!-- Text section -->
            <div class="col-lg-7 p-3 p-lg-5 pt-lg-3">
              <strong class="d-inline-block mb-2 category-text">
                ${[].concat(art.categories).join(' | ')}
              </strong>
              <h1 class="display-4 fw-bold card-title main-text lh-1">
                  ${art.title}
              </h1>
              <p class="card-text card-text-favorite">
                ${txt}
              </p>
              <div class="d-flex justify-content-between mt-auto small mb-3">
                <span class="category-text">${art.date}</span>
                <span class="category-text">${art.authors}</span>
              </div>
              <div class="d-grid gap-2 d-md-flex justify-content-md-start">
                <a href="article.html?slug=${art.slug}" class="btn button btn-lg px-4 me-md-2 fw-bold">
                  Read
                </a>
              </div>
            </div>

            <!-- Image section -->
            <div class="col-lg-4 offset-lg-1 p-0 overflow-hidden shadow-lg">
              <a href="article.html?slug=${art.slug}">
                <img src="${art.cover}" class="rounded-lg-3 w-100" style="object-fit:cover; height:400px;" alt="${art.title}">
              </a>
            </div>
          </div>
        </div>`;

      container.appendChild(col);
    }
  }
})();
