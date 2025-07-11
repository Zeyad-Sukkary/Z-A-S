// ─── Page Skeleton Helper ────────────────────────────────────────────────
function showPageSkeletons(relatedCount = 4) {
  // Article section
  const artTitle = document.getElementById('article-title');
  const artDate  = document.getElementById('article-date');
  const artAuth  = document.getElementById('author');
  const artImg   = document.getElementById('image');
  const artCont  = document.getElementById('article-content');

  // placeholders
  artTitle.innerHTML = `<span class="placeholder col-8 placeholder-glow"></span>`;
  artDate .innerHTML = `<span class="placeholder col-4 placeholder-glow"></span>`;
  artAuth .innerHTML = `<span class="placeholder col-3 placeholder-glow"></span>`;

  // turn the image into a placeholder box
  artImg.src = '';
  artImg.classList.add('placeholder');
  artImg.style = 'width:100%; height:300px; object-fit:cover;';

  artCont.innerHTML = Array(5).fill(0).map(() =>
    `<p><span class="placeholder col-12 placeholder-glow"></span></p>`
  ).join('');

  // Related posts skeletons
  const relatedContainer = document.querySelector('.recent-posts');
  relatedContainer.innerHTML = '';
  for (let i = 0; i < relatedCount; i++) {
    const li = document.createElement('li');
    li.innerHTML = `
      <a class="d-flex flex-column flex-lg-row gap-3 align-items-start align-items-lg-center py-3 link-body-emphasis text-decoration-none border-top" href="#">
        <div class="flex-shrink-0 placeholder" style="width:96px; height:96px;"></div>
        <div class="col-lg-8">
          <h6 class="placeholder col-6 placeholder-glow mb-1"></h6>
          <small class="placeholder col-4 placeholder-glow"></small>
        </div>
      </a>
    `;
    relatedContainer.appendChild(li);
  }
}

// ─── Show skeletons immediately ──────────────────────────────────────────
showPageSkeletons(4);  // Change `4` to however many related slots you want

// ─── Fetch & render article ──────────────────────────────────────────────
const urlParams = new URLSearchParams(window.location.search);
const slug      = urlParams.get('slug');

fetch(`articles/${slug}.json`)
  .then(res => {
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return res.json();
  })
  .then(article => {
    // ❏ Replace title/date/author
    document.getElementById('article-title').textContent = article.title || "No title";
    document.getElementById('page-title').textContent    = article.title
      ? `${article.title} | Z-A-S`
      : "No title";
    document.getElementById('author').textContent        = article.authors || "Unknown";
    document.getElementById('article-date').textContent  = article.date || "";

    // ❏ Replace image (remove placeholder class)
    const imgEl = document.getElementById('image');
    imgEl.classList.remove('placeholder');
    imgEl.style = '';
    imgEl.src   = article.cover || "default-image.png";
    imgEl.alt   = article.title || "";

    // ❏ Replace content
    document.getElementById('article-content').innerHTML =
      marked.parse(article.content || "") || "<p>No content</p>";

    // ─── Now fetch related posts ────────────────────────────────
    return fetch('articles/index.json')
      .then(r => r.json())
      .then(indexData => {
        const relatedContainer = document.querySelector('.recent-posts');
        relatedContainer.innerHTML = ""; // clear skeletons

        // build related list
        const currentCats = Array.isArray(article.categories)
          ? article.categories
          : [article.categories];
        const others = indexData.published
          .filter(s => s !== slug)
          .map(s => fetch(`articles/${s}.json`)
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

          if (pick.length === 0) {
            relatedContainer.innerHTML = "<li><p>No related posts found.</p></li>";
          } else {
            pick.forEach(a => {
              const li = document.createElement('li');
              li.innerHTML = `
                <a class="d-flex flex-column flex-lg-row gap-3 align-items-start align-items-lg-center py-3 link-body-emphasis text-decoration-none border-top" href="/Z-A-S/article.html?slug=${a.slug}">
                  <img src="${a.cover||a.image}" width="96" height="96" class="flex-shrink-0 rounded" alt="${a.title}" style="object-fit:cover;">
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
    // …your not-found display logic…
  });

// …rest of your lightbox & sidebar code…
