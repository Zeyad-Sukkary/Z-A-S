// favorites.js
(function() {
  const container = document.getElementById('favorites-preview-container');
  const noFavsMsg = document.getElementById('noFavoritesMsg');
  const favSlugs = JSON.parse(localStorage.getItem('favorites') || '[]');

function showSkeletons(container, count) {
  const cards = [];
  for (let i = 0; i < count; i++) {
    cards.push(`
      <div class="col-md-6 mb-3">
        <div class="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 placeholder-glow" aria-hidden="true">
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
  wrapper.className = 'row col-md';
  wrapper.innerHTML = cards.join('');
  container.innerHTML = '';
  container.appendChild(wrapper);
}

  showSkeletons(container, Math.min(favSlugs.length || 6, 6));

  if (!favSlugs.length) {
    container.innerHTML = '';
    noFavsMsg.classList.remove('nonedisplay');
    return;
  }

  Promise.all(favSlugs.map(slug =>
    fetch(`articles/${slug}.json`)
      .then(r => r.ok ? r.json().then(data => ({ ...data, slug })) : null)
      .catch(() => null)
  ))
  .then(articles => {
    const valid = articles.filter(a =>
      a && a.title && a.slug && a.date && a.content && a.authors
    );

    if (!valid.length) {
      container.innerHTML = '';
      noFavsMsg.classList.remove('nonedisplay');
      return;
    }

    noFavsMsg.classList.add('nonedisplay');
    renderFavorites(valid);
  })
  .catch(err => {
    console.error('Error loading favorites:', err);
    container.innerHTML = `<p class="text-danger">Failed to load favorites.</p>`;
  });

  function renderFavorites(list) {
    container.innerHTML = '';

    for (let i = 0; i < list.length; i += 2) {
      const row = document.createElement('div');
      row.className = 'row mb-2';

      for (let j = i; j < i + 2 && j < list.length; j++) {
        const art = list[j];
        const txt = (() => {
          const d = document.createElement('div');
          d.innerHTML = art.content;
          return marked.parse(d.textContent || '').slice(0, 130) + '....';
        })();

        const col = document.createElement('div');
        col.className = 'col-md-6';
        col.innerHTML = `
          <div class="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative slide-in-left">
            <div class="col p-4 d-flex flex-column position-static">
              <strong class="d-inline-block mb-2 category-text">
                ${[].concat(art.categories).join(' | ')}
              </strong>
              <h3 class="mb-0" style="color: var(--maintext);">${art.title}</h3>
              <p class="mb-1 text-body-secondary">${art.date}</p>
              <p class="card-text mb-auto">${txt}</p>
              <a href="/Z-A-S/article.html?slug=${art.slug}"
                 class="icon-link link gap-1 icon-link-hover stretched-link">
                Read more
                <svg class="bi" aria-hidden="true">
                  <use xlink:href="#chevron-right"/>
                </svg>
              </a>
            </div>
            <div class="col-auto d-none d-lg-block">
              <img src="${art.cover || '/path/to/default-image.jpg'}"
                   width="200" height="320" style="object-fit:cover;"
                   alt="Thumbnail">
            </div>
          </div>`;
        observer.observe(col.querySelector('.slide-in-left'));
        row.appendChild(col);
      }
      container.appendChild(row);
      triggerSlideInAnimations();
    }
  }

  function triggerSlideInAnimations() {
    document.querySelectorAll('.slide-in-left')
            .forEach(el => el.classList.add('visible'));
  }
})();
