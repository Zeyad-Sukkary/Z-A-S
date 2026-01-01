document.addEventListener('DOMContentLoaded', () => {

  const container = document.getElementById('favorites-preview-container');
  const noFavsMsg = document.getElementById('noFavoritesMsg');

  if (!container || !noFavsMsg) {
    console.warn('Favorites container or message element missing');
    return;
  }

  const favSlugs = JSON.parse(localStorage.getItem('favorites') || '[]');

  /* ===============================
     NO FAVORITES STATE
  =============================== */
  if (!favSlugs.length) {
    noFavsMsg.classList.remove('nonedisplay');
    return;
  } else {
    noFavsMsg.classList.add('nonedisplay');
  }

  /* ===============================
     SKELETON PLACEHOLDERS
  =============================== */
  function showSkeletons(count) {
    const cards = [];

    for (let i = 0; i < count; i++) {
      cards.push(`
        <div class="container my-5 slide-placeholder">
          <div class="p-4 pb-0 pe-lg-0 pt-lg-5 align-items-center rounded-3 border shadow-lg favorite-article">
            <div class="col-lg-7 p-3 p-lg-5 pt-lg-3">
              <strong class="d-inline-block mb-2 category-text placeholder-glow">
                <span class="placeholder col-4"></span>
              </strong>
              <h1 class="display-4 fw-bold lh-1 placeholder-glow">
                <span class="placeholder col-8"></span>
              </h1>
              <p class="lead placeholder-glow">
                <span class="placeholder col-12"></span>
                <span class="placeholder col-10"></span>
                <span class="placeholder col-8"></span>
              </p>
              <div class="d-flex justify-content-between mb-3 placeholder-glow">
                <span class="placeholder col-3"></span>
                <span class="placeholder col-3"></span>
              </div>
            </div>
            <div class="col-lg-4 offset-lg-1 p-0 overflow-hidden shadow-lg">
              <div class="placeholder-glow">
                <div class="placeholder w-100" style="height:400px;"></div>
              </div>
            </div>
          </div>
        </div>
      `);
    }

    container.innerHTML = cards.join('');
  }

  showSkeletons(Math.min(favSlugs.length, 6));

  /* ===============================
     FETCH FAVORITES
  =============================== */
  Promise.all(
    favSlugs.map(slug =>
      fetch(`articles/${slug}.json`)
        .then(r => r.ok ? r.json().then(data => ({ ...data, slug })) : null)
        .catch(() => null)
    )
  )
  .then(articles => {
    const list = articles.filter(Boolean);

    if (!list.length) {
      container.innerHTML = '';
      noFavsMsg.classList.remove('nonedisplay');
      return;
    }

    renderFavorites(list);
    initSlideObserver();
  })
  .catch(err => {
    console.error(err);
    container.innerHTML = `
      <div class="alert alert-danger text-center">
        Failed to load favorites.
      </div>
    `;
  });

  /* ===============================
     RENDER FAVORITES
  =============================== */
  function renderFavorites(list) {
    container.innerHTML = '';
    let toggle = true;

    list.forEach(art => {
      const textPreview = (() => {
        const temp = document.createElement('div');
        temp.innerHTML = art.content || '';
        return (temp.textContent || '').slice(0, 250) + '...';
      })();

      const slideClass = toggle ? 'slide-in-left' : 'slide-in-right';
      toggle = !toggle;

      const col = document.createElement('div');
      col.className = 'col-12';
      col.innerHTML = `
        <div class="container my-5 ${slideClass}">
          <div class="row p-4 align-items-center rounded-3 border shadow-lg favorite-article">
            <div class="col-lg-7 p-4">
              <strong class="category-text">
                ${(art.categories || []).join(' | ')}
              </strong>
              <h1 class="display-5 fw-bold">
                ${art.title || 'Untitled'}
              </h1>
              <p class="card-text">
                ${textPreview}
              </p>
              <div class="d-flex justify-content-between small mb-3">
                <span>${art.date || 'Unknown date'}</span>
                <span>${art.authors || 'Unknown author'}</span>
              </div>
              <a href="article.html?slug=${art.slug}" class="btn button btn-lg">
                Read
              </a>
            </div>

            <div class="col-lg-4 offset-lg-1 p-0 overflow-hidden shadow-lg">
              <a href="article.html?slug=${art.slug}">
                <img
                  src="${art.cover || '/path/to/default-image.jpg'}"
                  class="w-100"
                  style="height:400px; object-fit:cover;"
                  alt="${art.title}"
                >
              </a>
            </div>
          </div>
        </div>
      `;

      container.appendChild(col);
    });
  }

  function initSlideObserver() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    });

    document
      .querySelectorAll('.slide-in-left, .slide-in-right')
      .forEach(el => observer.observe(el));
  }

});
