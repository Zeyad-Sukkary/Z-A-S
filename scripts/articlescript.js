// ─── Page Skeleton Helper ────────────────────────────────────────────────
function showPageSkeletons(relatedCount = 4) {
  const artTitle = document.getElementById('article-title');
  const artDate  = document.getElementById('article-date');
  const artAuth  = document.getElementById('author');
  const artImg   = document.getElementById('image');
  const artCont  = document.getElementById('article-content');

  artTitle.innerHTML = `<span class="placeholder col-8 placeholder-wave"></span>`;
  artDate.innerHTML  = `<span class="placeholder col-4 placeholder-wave"></span>`;
  artAuth.innerHTML  = `<span class="placeholder col-3 placeholder-wave"></span>`;

  artImg.src = '';
  artImg.classList.add('placeholder');
  artImg.style = 'width:100%; height:300px; object-fit:cover;';

  artCont.innerHTML = Array(5).fill(0).map(() =>
    `<p><span class="placeholder col-12 placeholder-wave"></span></p>`
  ).join('');

  const relatedContainer = document.querySelector('.recent-posts');
  relatedContainer.innerHTML = '';
  for (let i = 0; i < relatedCount; i++) {
    const li = document.createElement('li');
    li.innerHTML = `
      <a class="d-flex flex-column flex-lg-row gap-3 align-items-start align-items-lg-center py-3 link-body-emphasis text-decoration-none border-top" href="#">
        <div class="flex-shrink-0 placeholder" style="width:96px; height:96px;"></div>
        <div class="col-lg-8">
          <h6 class="placeholder col-6 placeholder-wave mb-1"></h6>
          <small class="placeholder col-4 placeholder-wave"></small>
        </div>
      </a>
    `;
    relatedContainer.appendChild(li);
  }
}

// ─── Show skeletons immediately ──────────────────────────────────────────
showPageSkeletons(4);

// ─── Get slug from URL ───────────────────────────────────────────────────
const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');

// ─── Fetch & Render Article ──────────────────────────────────────────────
fetch(`articles/${slug}.json`)
  .then(res => {
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return res.json();
  })
  .then(article => {
    // Replace main content
    document.getElementById('article-title').textContent = article.title || "No title";
    document.getElementById('page-title').textContent = article.title
      ? `${article.title} | Z-A-S`
      : "No title";
    document.getElementById('author').textContent = article.authors || "Unknown";
    document.getElementById('article-date').textContent = article.date || "";

    const imgEl = document.getElementById('image');
    imgEl.classList.remove('placeholder');
    imgEl.style = '';
    imgEl.src = article.cover || "default-image.png";
    imgEl.alt = article.title || "";

    document.getElementById('article-content').innerHTML =
      marked.parse(article.content || "") || "<p>No content</p>";

    // Set up favorite button
    setupFavoriteButton(slug);

    // Related posts
    return fetch('articles/index.json')
      .then(r => r.json())
      .then(indexData => {
        const relatedContainer = document.querySelector('.recent-posts');
        relatedContainer.innerHTML = "";

        const currentCats = Array.isArray(article.categories)
          ? article.categories
          : [article.categories];

        const others = indexData.published
          .filter(s => s !== slug)
          .map(s =>
            fetch(`articles/${s}.json`)
              .then(r => r.json())
              .catch(() => null)
          );

        return Promise.all(others).then(all => {
          const valid = all.filter(a => a && a.categories);
          const related = valid.filter(a => {
            const cats = Array.isArray(a.categories) ? a.categories : [a.categories];
            return cats.some(c => currentCats.includes(c));
          });
          const pick = related.sort(() => 0.5 - Math.random()).slice(0, 4);

          if (!pick.length) {
            relatedContainer.innerHTML = "<li><p>No related posts found.</p></li>";
          } else {
            pick.forEach(a => {
              const li = document.createElement('li');
              li.innerHTML = `
                <a class="d-flex flex-column flex-lg-row gap-3 align-items-start align-items-lg-center py-3 link-body-emphasis text-decoration-none border-1 border-top" href="/Z-A-S/article.html?slug=${a.slug}">
                  <img src="${a.cover || a.image}" width="96" height="96" class="flex-shrink-0 rounded" alt="${a.title}" style="object-fit:cover;">
                  <div class="col-lg-8">
                    <h6 class="mb-0">${a.title}</h6>
                    <small class="text-body-secondary">${a.date}</small>
                  </div>
                </a>
              `;
              relatedContainer.appendChild(li);
            });
          }
        });
      });
  })
  .catch(err => {
    console.error('Error loading article:', err);
    // optional fallback UI
  });

// ─── Favorite Button Logic ───────────────────────────────────────────────
function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
  } catch {
    return [];
  }
}

function setFavorites(arr) {
  localStorage.setItem('favorites', JSON.stringify(arr));
}

function setupFavoriteButton(slug) {
  const btn = document.getElementById('fav-btn');
  if (!btn) return;

  const refresh = () => {
    const favs = getFavorites();
    const isFav = favs.includes(slug);
    btn.innerHTML = isFav ? ICONS.bookmarkHeartFill : ICONS.bookmarkHeart;
    btn.classList.toggle('active', isFav);
  };

  btn.addEventListener('click', () => {
    let favs = getFavorites();
    if (favs.includes(slug)) {
      favs = favs.filter(s => s !== slug);
    } else {
      favs.push(slug);
    }
    setFavorites(favs);
    refresh();
  });

  refresh(); // Initial load
}

// ─── Icon Definitions ────────────────────────────────────────────────────
const ICONS = {
  bookmarkHeartFill: `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="16" height="16"
         fill="currentColor"
         class="bi bi-bookmark-heart-fill"
         viewBox="0 0 16 16">
      <path d="M2 15.5a.5.5 0 0 0 .74.439L8 13.069l5.26
               2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2
               2 0 0 0-2 2zM8 4.41c1.387-1.425 4.854 1.07
               0 4.277C3.146 5.48 6.613 2.986 8 4.412z"/>
    </svg>`,
  bookmarkHeart: `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="16" height="16"
         fill="currentColor"
         class="bi bi-bookmark-heart"
         viewBox="0 0 16 16">
      <path d="M8 4.41c1.387-1.425 4.854 1.07 0
               4.277C3.146 5.48 6.613 2.986 8
               4.412z"/>
      <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0
               1 2 2v13.5a.5.5 0 0
               1-.777.416L8 13.101l-5.223
               2.815A.5.5 0 0 1 2 15.5V2zm2-1a1
               1 0 0 0-1 1v12.566l4.723-2.544a.5.5
               0 0 1 .554 0L13 14.566V2a1 1 0 0
               0-1-1H4z"/>
    </svg>`
};







// Lightbox for images in article content
(function () {
  let lightbox, imgEl, scale = 1, startX = 0, currentX = 0, isDragging = false;

  function openLightbox(src, caption) {
    if (lightbox) return;

    scale = 1;

    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';

    const content = document.createElement('div');
    content.className = 'lightbox-content';

    imgEl = document.createElement('img');
    imgEl.src = src;

    const cap = document.createElement('div');
    cap.className = 'lightbox-caption';
    cap.textContent = caption || '';

    content.appendChild(imgEl);
    if (caption) content.appendChild(cap);

    lightbox.appendChild(content);
    document.body.appendChild(lightbox);

    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', escHandler);
    imgEl.addEventListener('wheel', zoomHandler, { passive: false });
    imgEl.addEventListener('pointerdown', pointerDown);
    window.addEventListener('pointermove', pointerMove);
    window.addEventListener('pointerup', pointerUp);
  }

  function closeLightbox() {
    if (!lightbox) return;

    document.removeEventListener('keydown', escHandler);
    window.removeEventListener('pointermove', pointerMove);
    window.removeEventListener('pointerup', pointerUp);

    lightbox.remove();
    lightbox = null;
  }

  function escHandler(e) {
    if (e.key === 'Escape') closeLightbox();
  }

  // 🔍 Zoom with scroll wheel
  function zoomHandler(e) {
    e.preventDefault();

    scale += e.deltaY * -0.0015;
    scale = Math.min(Math.max(1, scale), 4);

    imgEl.style.transform = `scale(${scale}) translateX(${currentX}px)`;
  }

  // 👆 Swipe / drag
  function pointerDown(e) {
    isDragging = true;
    startX = e.clientX - currentX;
  }

  function pointerMove(e) {
    if (!isDragging || scale <= 1) return;

    currentX = e.clientX - startX;
    imgEl.style.transform = `scale(${scale}) translateX(${currentX}px)`;
  }

  function pointerUp() {
    isDragging = false;
  }

  function makeImagesLightboxable(container) {
    container.querySelectorAll('img').forEach(img => {
      img.style.cursor = 'zoom-in';

      img.addEventListener('click', e => {
        e.stopPropagation();

        const caption =
          img.dataset.caption ||
          img.alt ||
          img.title ||
          '';

        openLightbox(img.src, caption);
      });
    });
  }

  // Main image + article content
  makeImagesLightboxable(document);
})();
