// ─── Page Skeleton Helper ────────────────────────────────────────────────
function showPageSkeletons(relatedCount = 4) {
  const artTitle = document.getElementById('article-title');
  const artDate  = document.getElementById('article-date');
  const artAuth  = document.getElementById('author');
  const artImg   = document.getElementById('image');
  const artCont  = document.getElementById('article-content');

  if (artTitle) artTitle.innerHTML = `<span class="placeholder col-8 placeholder-wave"></span>`;
  if (artDate)  artDate.innerHTML  = `<span class="placeholder col-4 placeholder-wave"></span>`;
  if (artAuth)  artAuth.innerHTML  = `<span class="placeholder col-3 placeholder-wave"></span>`;

  if (artImg) {
    artImg.src = '';
    artImg.classList.add('placeholder');
    artImg.style = 'width:100%; height:300px; object-fit:cover;';
  }

  if (artCont) {
    artCont.innerHTML = Array(5).fill(0).map(() =>
      `<p><span class="placeholder col-12 placeholder-wave"></span></p>`
    ).join('');
  }

  const relatedContainer = document.querySelector('.recent-posts');
  if (relatedContainer) {
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
}

document.addEventListener('DOMContentLoaded', () => {
  // Show skeletons immediately
  showPageSkeletons(4);

  // Get slug from URL
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  if (!slug) {
    console.warn('No article slug provided in URL');
    return;
  }

  let currentArticleSlug = slug;
  let progressSaveAllowed = true;

  function getArticleReadProgress() {
    const articleEl = document.querySelector('article.news-item');
    const headerEl = document.querySelector('header');
    const footerEl = document.querySelector('footer');
    if (!articleEl) return 0;

    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;
    const footerHeight = footerEl ? footerEl.getBoundingClientRect().height : 0;
    const viewport = Math.max(0, window.innerHeight - headerHeight);

    if (articleEl.scrollHeight <= viewport) {
      progressSaveAllowed = false;
      return 0;
    }

    progressSaveAllowed = true;
    const articleTop = articleEl.offsetTop;
    const readableHeight = Math.max(1, articleEl.scrollHeight - viewport);
    const readTop = Math.max(0, window.scrollY + headerHeight - articleTop);
    const footerAdjustedLimit = Math.max(1, document.documentElement.scrollHeight - window.innerHeight - footerHeight);
    const pageLimit = Math.max(readableHeight, footerAdjustedLimit);
    return Math.max(0, Math.min(99, (readTop / Math.min(readableHeight, pageLimit)) * 100));
  }

  function saveArticleProgress() {
    if (!currentArticleSlug || typeof upsertReadHistory !== 'function') return;
    const existing = typeof getReadHistoryEntry === 'function' ? getReadHistoryEntry(currentArticleSlug) : null;
    if (existing && existing.markedRead) return;
    const progress = getArticleReadProgress();
    if (!progressSaveAllowed) return;
    if (progress > 2 || existing) {
      upsertReadHistory(currentArticleSlug, { progress: Math.max(progress, existing ? existing.progress || 0 : 0) });
    }
  }

  window.addEventListener('pagehide', saveArticleProgress);
  window.addEventListener('beforeunload', saveArticleProgress);

  // Fetch & Render Article
  fetch(`articles/${encodeURIComponent(slug)}.json`)
    .then(res => {
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return res.json();
    })
    .then(article => {
      const titleEl = document.getElementById('article-title');
      const pageTitleEl = document.getElementById('page-title');
      const authorEl = document.getElementById('author');
      const dateEl = document.getElementById('article-date');
      const contentEl = document.getElementById('article-content');
      const imgEl = document.getElementById('image');

      if (titleEl) titleEl.textContent = article.title || "Untitled Article";
      if (pageTitleEl) pageTitleEl.textContent = article.title ? `${article.title} | Z-A-S` : "Article | Z-A-S";
      if (authorEl) authorEl.textContent = article.authors || "Unknown Author";
      if (dateEl) dateEl.textContent = article.date || "";

      if (imgEl) {
        imgEl.classList.remove('placeholder');
        imgEl.style = '';
        imgEl.src = article.cover || "pics/default-image.webp";
        imgEl.alt = article.title || "Article Image";
      }

      if (contentEl) {
        contentEl.innerHTML = (typeof marked !== 'undefined' && marked.parse)
          ? marked.parse(article.content || "")
          : (article.content || "<p>No content available.</p>");
      }

      // Initialize Lightbox after injection
      if (window.initArticleLightbox) {
        const articleBox = document.querySelector('article') || document.querySelector('.news-item');
        window.initArticleLightbox(articleBox);
      }

      // Setup favorite button
      if (typeof setupFavoriteButton === 'function') {
        setupFavoriteButton(slug);
      }

      const headerReadBtn = document.getElementById('headerMarkReadBtn');
      if (headerReadBtn && typeof updateMarkReadButton === 'function') {
        headerReadBtn.dataset.markReadSlug = slug;
        updateMarkReadButton(headerReadBtn);
      }

      const actionsEl = document.getElementById('article-actions');
      if (actionsEl && typeof renderMarkReadButton === 'function') {
        actionsEl.innerHTML = `
          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-between">
            <span class="small text-secondary">Track your reading progress locally in this browser.</span>
            ${renderMarkReadButton(slug, 'article-bottom-read-btn')}
          </div>
        `;
        if (typeof bindMarkReadButtons === 'function') bindMarkReadButtons(actionsEl);
      }

      // Fetch related posts
      return fetch('articles/index.json')
        .then(r => r.json())
        .then(indexData => {
          const relatedContainer = document.querySelector('.recent-posts');
          if (!relatedContainer) return;
          relatedContainer.innerHTML = "";

          const currentCats = Array.isArray(article.categories)
            ? article.categories
            : (article.categories ? [article.categories] : []);

          const others = indexData.published
            .filter(s => s !== slug)
            .map(s => fetch(`articles/${s}.json`).then(r => r.ok ? r.json() : null).catch(() => null));

          return Promise.all(others).then(all => {
            const valid = all.filter(a => a && a.categories);
            const related = valid.filter(a => {
              const cats = Array.isArray(a.categories) ? a.categories : [a.categories];
              return cats.some(c => currentCats.includes(c));
            });

            const pick = related.sort(() => 0.5 - Math.random()).slice(0, 4);

            if (!pick.length) {
              relatedContainer.innerHTML = "<li><p class='text-muted py-2 mb-0'>No related posts found.</p></li>";
            } else {
              pick.forEach(a => {
                const li = document.createElement('li');
                li.innerHTML = `
                  <a class="d-flex flex-column flex-lg-row gap-3 align-items-start align-items-lg-center py-3 link-body-emphasis text-decoration-none border-1 border-top" href="article.html?slug=${encodeURIComponent(a.slug)}">
                    <img src="${a.cover || 'pics/default-image.webp'}" width="96" height="96" class="flex-shrink-0 rounded" alt="${a.title}" style="object-fit:cover;">
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
      const titleEl = document.getElementById('article-title');
      const authorEl = document.getElementById('author');
      const dateEl = document.getElementById('article-date');
      const contentEl = document.getElementById('article-content');
      const imgEl = document.getElementById('image');
      const relatedContainer = document.querySelector('.recent-posts');

      if (titleEl) titleEl.textContent = 'Article could not be loaded';
      if (authorEl) authorEl.textContent = '';
      if (dateEl) dateEl.textContent = '';
      if (imgEl) {
        imgEl.classList.remove('placeholder');
        imgEl.src = 'pics/default-image.webp';
        imgEl.alt = 'Default article image';
      }
      if (contentEl) {
        contentEl.innerHTML = '<p>Could not load this article right now. Please try again later.</p>';
      }
      if (relatedContainer) {
        relatedContainer.innerHTML = '';
      }
    });
});

// ─── Lightbox Module ───────────────────────────────────────────────────
(function () {
  let lightbox, imgEl, captionEl, thumbsEl;
  let images = [];
  let currentIndex = 0;

  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  function applyTransform() {
    if (!imgEl) return;
    imgEl.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  }

  function resetTransform() {
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    applyTransform();
  }

  function openLightbox(index) {
    currentIndex = index;

    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';

    const content = document.createElement('div');
    content.className = 'lightbox-content';

    imgEl = document.createElement('img');
    captionEl = document.createElement('div');
    captionEl.className = 'lightbox-caption';

    thumbsEl = document.createElement('div');
    thumbsEl.style.display = 'flex';
    thumbsEl.style.gap = '8px';
    thumbsEl.style.marginTop = '10px';
    thumbsEl.style.flexWrap = 'wrap';
    thumbsEl.style.justifyContent = 'center';

    content.appendChild(imgEl);
    content.appendChild(captionEl);
    content.appendChild(thumbsEl);
    lightbox.appendChild(content);
    document.body.appendChild(lightbox);

    resetTransform();
    renderImage();
    renderThumbnails();

    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', escHandler);

    imgEl.addEventListener('dblclick', toggleZoom);
    imgEl.addEventListener('pointerdown', pointerDown);
    imgEl.addEventListener('pointermove', pointerMove);
    imgEl.addEventListener('pointerup', pointerUp);
    imgEl.addEventListener('pointercancel', pointerUp);
  }

  function closeLightbox() {
    document.removeEventListener('keydown', escHandler);
    if (lightbox) {
      lightbox.remove();
      lightbox = null;
    }
  }

  function escHandler(e) {
    if (e.key === 'Escape') closeLightbox();
  }

  function renderImage() {
    const img = images[currentIndex];
    if (!img) return;
    imgEl.src = img.src;
    captionEl.textContent = img.dataset.caption || img.alt || img.title || '';
    resetTransform();
  }

  function renderThumbnails() {
    thumbsEl.innerHTML = '';
    images.forEach((img, i) => {
      const thumb = document.createElement('img');
      thumb.src = img.src;
      thumb.style.width = '60px';
      thumb.style.cursor = 'pointer';
      thumb.style.opacity = i === currentIndex ? '1' : '0.5';

      thumb.addEventListener('click', () => {
        currentIndex = i;
        renderImage();
        renderThumbnails();
      });

      thumbsEl.appendChild(thumb);
    });
  }

  function toggleZoom(e) {
    e.preventDefault();
    scale = (scale === 1) ? 2 : 1;
    if (scale === 1) resetTransform();
    else applyTransform();
  }

  function pointerDown(e) {
    if (scale === 1) return;
    isDragging = true;
    startX = e.clientX - offsetX;
    startY = e.clientY - offsetY;
    imgEl.setPointerCapture(e.pointerId);
  }

  function pointerMove(e) {
    if (!isDragging) return;
    offsetX = e.clientX - startX;
    offsetY = e.clientY - startY;
    applyTransform();
  }

  function pointerUp() {
    isDragging = false;
  }

  function makeArticleImagesLightboxable(article) {
    if (!article) return;
    images = Array.from(article.querySelectorAll('img'));
    images.forEach((img, index) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', e => {
        e.stopPropagation();
        openLightbox(index);
      });
    });
  }

  window.initArticleLightbox = makeArticleImagesLightboxable;
})();
