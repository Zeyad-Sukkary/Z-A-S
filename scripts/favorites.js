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

  // Function to show skeletons while loading
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

  // IntersectionObserver for slide-in animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // animate once
      }
    });
  }, { threshold: 0.1 });

  // Fetch all favorite JSONs
  Promise.all(favSlugs.map(slug =>
    fetch(`articles/${slug}.json`)
      .then(r => r.ok ? r.json().then(data => ({ ...data, slug })) : null)
      .catch(() => null)
  ))
  .then(articles => {
    // Normalize articles with defaults
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
  })
  .catch(err => {
    console.error('Error loading favorites:', err);
    container.innerHTML = `<p class="text-danger">Failed to load favorites.</p>`;
  });

  // Render favorites function
  function renderFavorites(list) {
    container.innerHTML = '';
    let toggle = true; // true = left, false = right

    for (let i = 0; i < list.length; i += 2) {
      const row = document.createElement('div');
      row.className = 'row mb-2';

      for (let j = i; j < i + 2 && j < list.length; j++) {
        const art = list[j];
        const txt = (() => {
          const d = document.createElement('div');
          d.innerHTML = art.content;
          return marked.parse(d.textContent || '').slice(0, 250) + '...';
        })();

        const col = document.createElement('div');
        col.className = 'col-md-6';

        const slideClass = toggle ? 'slide-in-left' : 'slide-in-right';
        toggle = !toggle;

        col.innerHTML = `
          <div class="container my-5 ${slideClass}">
            <div class="row p-4 pb-0 pe-lg-0 pt-lg-5 align-items-center rounded-3 border shadow-lg favorite-article">
              
              <!-- Text section -->
              <div class="col-lg-7 p-3 p-lg-5 pt-lg-3">
                <strong class="d-inline-block mb-2 category-text">
                  ${[].concat(art.categories).join(' | ')}
                </strong>
                <h1 class="display-4 fw-bold lh-1 text-body-emphasis">
                  <a href="article.html?slug=${art.slug}" class="text-decoration-none text-dark">
                    ${art.title}
                  </a>
                </h1>
                <p class="lead card-text card-text-favorite">
                  ${txt}
                </p>
                <div class="d-flex justify-content-between mt-auto small mb-3">
                  <span class="category-text">${art.date}</span>
                  <span class="category-text">${art.authors}</span>
                </div>
                <div class="d-grid gap-2 d-md-flex justify-content-md-start">
                  <a href="article.html?slug=${art.slug}" class="btn btn-primary btn-lg px-4 me-md-2 fw-bold">
                    Read More
                  </a>
                  <button type="button" class="btn btn-outline-secondary btn-lg px-4">
                    Save
                  </button>
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

        const slideEl = col.querySelector(`.${slideClass}`);
        if (slideEl) observer.observe(slideEl);

        row.appendChild(col);
      }

      container.appendChild(row);
    }
  }
})();
