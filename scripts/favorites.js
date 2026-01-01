document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('favorites-preview-container');
  const noFavsMsg = document.getElementById('noFavoritesMsg');

  if (!container || !noFavsMsg) {
    console.warn('Favorites container or message element missing');
    return;
  }

  let favSlugs = [];
  try {
    favSlugs = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (!Array.isArray(favSlugs)) favSlugs = [];
  } catch (e) {
    console.warn('Could not parse favorites from localStorage', e);
    favSlugs = [];
  }

  /* ===============================
     NO FAVORITES STATE
  =============================== */
  if (!favSlugs.length) {
    noFavsMsg.classList.remove('nonedisplay');
    container.innerHTML = '';
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
      fetch(`articles/${encodeURIComponent(slug)}.json`)
        .then(r => (r.ok ? r.json().then(data => ({ ...data, slug })) : null))
        .catch(() => null)
    )
  )
    .then(articles => {
      const list = (articles || []).filter(Boolean);

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
     HELPERS
  =============================== */
  function safeText(str) {
    return (str == null) ? '' : String(str);
  }

  // Escape for attribute insertion (small helper)
  function escapeAttr(s) {
    return safeText(s).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ===============================
     RENDER FAVORITES
  =============================== */
  function renderFavorites(list) {
    container.innerHTML = ''; // clear skeletons
    let toggle = true;

    // If marked is not available, warn and fallback to plain text
    if (typeof marked === 'undefined' || typeof marked.parse !== 'function') {
      console.warn('marked.parse not found. Markdown will not be rendered.');
    }

    list.forEach(art => {
      // produce a plain-text preview from markdown -> html -> textContent
      let textPreview = '';
      try {
        if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
          const html = marked.parse(art.content || '');
          const temp = document.createElement('div');
          temp.innerHTML = html;
          const fullText = temp.textContent || temp.innerText || '';
          textPreview = fullText.trim();
        } else {
          // fallback: strip markdown-ish punctuation naively
          textPreview = safeText(art.content || '').replace(/[#_*~`>!-]/g, '').trim();
        }
      } catch (e) {
        console.warn('Error while parsing markdown for preview', e);
        textPreview = safeText(art.content || '');
      }

      const previewLen = 250;
      const needsEllipsis = textPreview.length > previewLen;
      textPreview = needsEllipsis ? textPreview.slice(0, previewLen).trim() + '…' : textPreview;

      const slideClass = toggle ? 'slide-in-left' : 'slide-in-right';
      toggle = !toggle;

      // Build DOM safely; avoid inserting user content into template literals as HTML
      const col = document.createElement('div');
      col.className = 'col-12';

      // Use a sanitized static template, then populate dynamic textContent/attrs
      col.innerHTML = `
        <div class="container my-5 ${slideClass}">
          <div class="row p-4 align-items-center rounded-3 border shadow-lg favorite-article">
            <div class="col-lg-7 p-4">
              <strong class="category-text"></strong>
              <h1 class="display-5 fw-bold title-text"></h1>
              <p class="card-text preview-text"></p>
              <div class="d-flex justify-content-between small mb-3 meta">
                <p class="meta-date"></p>
                <p class="meta-author"></p>
              </div>
              <a class="btn button btn-lg read-link" role="link">Read</a>
            </div>

            <div class="col-lg-4 offset-lg-1 p-0 overflow-hidden shadow-lg image-wrap">
              <a class="img-link" href="#">
                <img class="cover-img w-100" style="height:400px; object-fit:cover;" alt="">
              </a>
            </div>
          </div>
        </div>
      `;

      // Populate content safely via textContent / setAttribute
      const categoriesEl = col.querySelector('.category-text');
      const titleEl = col.querySelector('.title-text');
      const previewEl = col.querySelector('.preview-text');
      const dateEl = col.querySelector('.meta-date');
      const authorEl = col.querySelector('.meta-author');
      const readLink = col.querySelector('.read-link');
      const imgLink = col.querySelector('.img-link');
      const imgEl = col.querySelector('.cover-img');

      const categories = Array.isArray(art.categories) ? art.categories.join(' | ') : safeText(art.categories);
      categoriesEl.textContent = categories || '';
      titleEl.textContent = art.title || 'Untitled';
      previewEl.textContent = textPreview || '';
      dateEl.textContent = art.date || 'Unknown date';
      authorEl.textContent = art.authors || 'Unknown author';

      const slug = encodeURIComponent(art.slug || '');
      const articleHref = slug ? `article.html?slug=${slug}` : '#';
      readLink.setAttribute('href', articleHref);
      imgLink.setAttribute('href', articleHref);

      const coverSrc = art.cover || '/path/to/default-image.jpg';
      imgEl.setAttribute('src', coverSrc);
      imgEl.setAttribute('alt', escapeAttr(art.title || 'Article cover'));

      container.appendChild(col);
    });
  }

  /* ===============================
     SLIDE / FADE OBSERVER
  =============================== */
  function initSlideObserver() {
    // If IntersectionObserver not supported, just reveal all
    if (typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll('.slide-in-left, .slide-in-right').forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 } // small threshold so element animates shortly after it appears
    );

    document.querySelectorAll('.slide-in-left, .slide-in-right').forEach(el => observer.observe(el));
  }
});
