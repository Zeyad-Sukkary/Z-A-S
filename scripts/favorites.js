document.addEventListener('DOMContentLoaded', () => {

  const container = document.getElementById('favorites-preview-container');
  const noFavsMsg = document.getElementById('noFavoritesMsg');

  if (!container || !noFavsMsg) return;

  let favSlugs = [];
  try {
    favSlugs = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (!Array.isArray(favSlugs)) favSlugs = [];
  } catch {
    favSlugs = [];
  }

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
    container.innerHTML = Array.from({ length: count }).map(() => `
      <div class="container my-5 fade-placeholder">
        <div class="p-4 rounded-3 border shadow-lg favorite-article">
          <div class="placeholder-glow">
            <span class="placeholder col-8 mb-3"></span>
            <span class="placeholder col-12"></span>
            <span class="placeholder col-10"></span>
          </div>
        </div>
      </div>
    `).join('');
  }

  showSkeletons(Math.min(favSlugs.length, 6));

  /* ===============================
     FETCH FAVORITES
  =============================== */
  Promise.all(
    favSlugs.map(slug =>
      fetch(`articles/${encodeURIComponent(slug)}.json`)
        .then(r => r.ok ? r.json().then(d => ({ ...d, slug })) : null)
        .catch(() => null)
    )
  )
  .then(list => {
    list = list.filter(Boolean);

    if (!list.length) {
      container.innerHTML = '';
      noFavsMsg.classList.remove('nonedisplay');
      return;
    }

    renderFavorites(list);
    initFadeObserver();
  });

  /* ===============================
     HTML TRUNCATION (keeps tags)
  =============================== */
  function truncateHTML(html, maxChars = 250) {
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
          node.textContent = node.textContent.slice(0, remaining) + '…';
          count = maxChars;
        } else {
          count += node.textContent.length;
        }
      } else {
        [...node.childNodes].forEach(walk);
      }
    }

    [...wrapper.childNodes].forEach(walk);
    return wrapper.innerHTML;
  }

  /* ===============================
     RENDER FAVORITES
  =============================== */
  function renderFavorites(list) {
    container.innerHTML = '';

    list.forEach(art => {

      const rawHTML = marked.parse(art.content || '');
      const previewHTML = truncateHTML(rawHTML, 250);

      const col = document.createElement('div');
      col.className = 'col-12';
      col.innerHTML = `
        <div class="container my-5 fade-in">
          <div class="row p-4 align-items-center rounded-3 border shadow-lg favorite-article">
            <div class="col-lg-7 p-4">
              <strong class="category-text">
                ${(art.categories || []).join(' | ')}
              </strong>

              <h1 class="display-5 fw-bold">
                ${art.title || 'Untitled'}
              </h1>

              <div class="article-preview">
                ${previewHTML}
              </div>

              <div class="d-flex justify-content-between small mb-3">
                <p>${art.date || 'Unknown date'}</p>
                <p>${art.authors || 'Unknown author'}</p>
              </div>

              <a href="article.html?slug=${encodeURIComponent(art.slug)}"
                 class="btn button btn-lg">
                Read
              </a>
            </div>

            <div class="col-lg-4 offset-lg-1 p-0 overflow-hidden shadow-lg">
              <a href="article.html?slug=${encodeURIComponent(art.slug)}">
                <img
                  src="${art.cover || '/path/to/default-image.jpg'}"
                  class="w-100"
                  style="height:400px; object-fit:cover;"
                  alt="${art.title || ''}">
              </a>
            </div>
          </div>
        </div>
      `;

      container.appendChild(col);
    });
  }

  /* ===============================
     FADE-IN OBSERVER
  =============================== */
  function initFadeObserver() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }

});
